import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Polyfill process.env for the API files which rely on it
  process.env.DATABASE_URL = env.DATABASE_URL;

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      {
        name: 'vercel-api-middleware',
        configureServer(server) {
          server.middlewares.use('/api', async (req, res, next) => {
            const url = new URL(req.url || '', `http://${req.headers.host}`);
            const endpoint = url.pathname.replace(/^\//, ''); // Remove leading slash

            console.log(`[API Middleware] Incoming request: ${req.method} /api/${endpoint}`);

            const endpointFileMap: Record<string, string> = {
              'users': 'api/users.ts',
              'units': 'api/units.ts',
              'requests': 'api/requests.ts',
              'tipologias': 'api/tipologias.ts',
              'tipo-locais': 'api/tipo-locais.ts',
              'profiles': 'api/profiles.ts',
              'auth': 'api/auth.ts',
              'health': 'api/health.ts',
              'health-db': 'api/health-db.ts',
              'movements': 'api/movements.ts',
              'update-request-status': 'api/update_request_status.ts'
            };

            const relativePath = endpointFileMap[endpoint];

            if (!relativePath) {
              console.log(`[API Middleware] No handler found for endpoint: ${endpoint}`);
              return next();
            }

            // Force absolute path resolution from the project root
            const projectRoot = process.cwd();
            const absolutePath = path.resolve(projectRoot, relativePath);

            console.log(`[API Middleware] Resolving handler: ${relativePath} -> ${absolutePath}`);

            try {
              // Use Vite's ssrLoadModule to load the TypeScript file
              const module = await server.ssrLoadModule(absolutePath);

              if (!module.default) {
                throw new Error(`Module ${relativePath} does not export a default handler.`);
              }

              const handler = module.default;
              console.log(`[API Middleware] Handler loaded successfully.`);

              // Shim Request props
              const query = Object.fromEntries(url.searchParams);
              Object.assign(req, { query });

              // Shim Body for POST/PUT/PATCH
              if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
                const buffers = [];
                for await (const chunk of req) {
                  buffers.push(chunk);
                }
                const rawBody = Buffer.concat(buffers).toString();
                if (rawBody) {
                  try {
                    const body = JSON.parse(rawBody);
                    Object.assign(req, { body });
                  } catch {
                    Object.assign(req, { body: rawBody });
                  }
                } else {
                  Object.assign(req, { body: {} });
                }
              }

              // Shim Response methods
              // We need to be careful not to double-bind or lose context
              const originalEnd = res.end.bind(res);
              const originalSetHeader = res.setHeader.bind(res);

              // Track if response has been sent to avoid double-send errors
              let sent = false;

              const augmentedRes = Object.assign(res, {
                status: (code: number) => {
                  res.statusCode = code;
                  return res;
                },
                json: (data: any) => {
                  if (sent) return res;
                  sent = true;
                  res.setHeader('Content-Type', 'application/json');
                  const jsonStr = JSON.stringify(data);
                  console.log(`[API Middleware] Sending JSON response (${jsonStr.length} bytes)`);
                  originalEnd(jsonStr);
                  return res;
                },
                setHeader: (name: string, value: string | number | readonly string[]) => {
                  originalSetHeader(name, value);
                  return res;
                },
                end: (chunk?: any, encoding?: any, cb?: any) => {
                  if (sent) return res;
                  sent = true;
                  console.log(`[API Middleware] Ending response manually`);
                  return originalEnd(chunk, encoding, cb);
                }
              });

              await handler(req, augmentedRes);

            } catch (error: any) {
              console.error('[API Middleware] Error handling request:', error);
              if (!res.headersSent) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  error: 'Internal Server Error (Local Middleware)',
                  details: error.message,
                  stack: error.stack
                }));
              }
            }
          });
        }
      }
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
