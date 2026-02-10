import { VercelRequest, VercelResponse } from '@vercel/node';

// Map endpoints to dynamic import functions
const handlers: Record<string, (req: VercelRequest, res: VercelResponse) => Promise<any>> = {
    'auth': async (req, res) => (await import('../handlers/auth')).default(req, res),
    'avisos': async (req, res) => (await import('../handlers/avisos')).default(req, res),
    'health-db': async (req, res) => (await import('../handlers/health-db')).default(req, res),
    'health': async (req, res) => (await import('../handlers/health')).default(req, res),
    'movements': async (req, res) => (await import('../handlers/movements')).default(req, res),
    'profiles': async (req, res) => (await import('../handlers/profiles')).default(req, res),
    'requests': async (req, res) => (await import('../handlers/requests')).default(req, res),
    'tipo-locais': async (req, res) => (await import('../handlers/tipo-locais')).default(req, res),
    'tipologias': async (req, res) => (await import('../handlers/tipologias')).default(req, res),
    'units': async (req, res) => (await import('../handlers/units')).default(req, res),
    'update-request-status': async (req, res) => (await import('../handlers/update_request_status')).default(req, res),
    'users': async (req, res) => (await import('../handlers/users')).default(req, res)
};

export default async function (req: VercelRequest, res: VercelResponse) {
    // Manually parse route from URL
    // URL format: /api/auth?foo=bar -> path: /auth
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const pathname = url.pathname;
    
    // Remove /api prefix if present
    const routePath = pathname.replace(/^\/api\/?/, '');
    const segments = routePath.split('/').filter(Boolean);

    console.log('[API Dispatcher] Request URL:', req.url);
    console.log('[API Dispatcher] Parsed Segments:', segments);
    console.log('[API Dispatcher] Query Params:', JSON.stringify(req.query));
    // Verify body exists before logging to avoid errors if body is undefined
    console.log('[API Dispatcher] Body Type:', typeof req.body);

    // CORS - Handle OPTIONS globally
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Fallback for root /api/ request
    if (segments.length === 0) {
        console.log('[API Dispatcher] Root request, returning health check.');
        return res.status(200).json({ status: 'API Dispatcher Online', handlers: Object.keys(handlers) });
    }

    const endpoint = segments[0];
    
    // DEBUG: Test endpoint to verify dispatcher works without DB
    if (endpoint === 'test') {
        return res.status(200).json({ message: 'Dispatcher is working!', timestamp: new Date().toISOString() });
    }

    const handler = handlers[endpoint];

    console.log(`[API Dispatcher] Routing to endpoint: ${endpoint}`);

    if (handler) {
        try {
            return await handler(req, res);
        } catch (error: any) {
            console.error(`[API Dispatcher] Error in handler '${endpoint}':`, error);
            // Ensure we don't try to send headers if already sent
            if (!res.headersSent) {
                return res.status(500).json({ error: 'Internal Server Error', details: error.message });
            }
        }
    } else {
        console.error(`[API Dispatcher] Endpoint '${endpoint}' not found`);
        return res.status(404).json({ error: `Start Endpoint '${endpoint}' not found` });
    }
}
