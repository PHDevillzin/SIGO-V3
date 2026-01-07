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
              try {
                const url = new URL(req.url || '', `http://${req.headers.host}`);
                const endpoint = url.pathname.replace(/^\//, ''); // Remove leading slash
                
                // Map endpoints to files
                const endpointFileMap: Record<string, string> = {
                  'users': './api/users.ts',
                  'units': './api/units.ts',
                  'requests': './api/requests.ts',
                  'tipologias': './api/tipologias.ts',
                  'tipo-locais': './api/tipo-locais.ts',
                  'profiles': './api/profiles.ts'
                };

                const filePath = endpointFileMap[endpoint];

                if (!filePath) {
                  return next();
                }

                console.log(`[API] Processing ${req.method} /api/${endpoint}`);

                // Import the handler dynamically
                const { default: handler } = await import(filePath);

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
                   try {
                     const body = JSON.parse(rawBody);
                     Object.assign(req, { body });
                   } catch {
                     Object.assign(req, { body: rawBody });
                   }
                 }

                // Shim Response methods
                const originalEnd = res.end.bind(res);
                
                Object.assign(res, {
                  status: (code: number) => {
                    res.statusCode = code;
                    return res;
                  },
                  json: (data: any) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                    return res;
                  },
                  setHeader: (name: string, value: string | number | readonly string[]) => {
                     // Vite/Connect response already has setHeader, but Vercel might use it differently
                     // pass through
                     res.setHeader(name, value);
                     return res;
                  }
                });

                await handler(req, res);

              } catch (error) {
                console.error('[API] Error handling request:', error);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Internal Server Error (Local)' }));
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
