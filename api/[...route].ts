import { VercelRequest, VercelResponse } from '@vercel/node';
import authHandler from '../handlers/auth';
import avisosHandler from '../handlers/avisos';
import healthDbHandler from '../handlers/health-db';
import healthHandler from '../handlers/health';
import movementsHandler from '../handlers/movements';
import profilesHandler from '../handlers/profiles';
import requestsHandler from '../handlers/requests';
import tipoLocaisHandler from '../handlers/tipo-locais';
import tipologiasHandler from '../handlers/tipologias';
import unitsHandler from '../handlers/units';
import updateRequestStatusHandler from '../handlers/update_request_status';
import usersHandler from '../handlers/users';

const handlers: Record<string, (req: VercelRequest, res: VercelResponse) => any> = {
    'auth': authHandler,
    'avisos': avisosHandler,
    'health-db': healthDbHandler,
    'health': healthHandler,
    'movements': movementsHandler,
    'profiles': profilesHandler,
    'requests': requestsHandler,
    'tipo-locais': tipoLocaisHandler,
    'tipologias': tipologiasHandler,
    'units': unitsHandler,
    'update-request-status': updateRequestStatusHandler,
    'users': usersHandler
};

export default async function (req: VercelRequest, res: VercelResponse) {
    const { route } = req.query;

    console.log('[API Dispatcher] Request URL:', req.url);
    console.log('[API Dispatcher] Query Params:', JSON.stringify(req.query));
    console.log('[API Dispatcher] Body:', typeof req.body === 'object' ? JSON.stringify(req.body) : req.body);

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

    // route is an array of path segments, e.g. ['users'] or ['users', '123']
    // For our flat API structure, the first segment is the endpoint.
    // E.g. /api/users -> route: ['users']
    
    if (!route || !Array.isArray(route) || route.length === 0) {
        // Fallback for root /api/ request -> return status
        console.log('[API Dispatcher] Root request, returning health check.');
        return res.status(200).json({ status: 'API Dispatcher Online', handlers: Object.keys(handlers) });
    }

    const endpoint = route[0];
    
    // DEBUG: Test endpoint to verify dispatcher works without DB
    if (endpoint === 'test') {
        return res.status(200).json({ message: 'Dispatcher is working!', timestamp: new Date().toISOString() });
    }

    const handler = handlers[endpoint];

    console.log(`[API Dispatcher] Routing to endpoint: ${endpoint}`);
    console.log(`[API Dispatcher] Available handlers:`, Object.keys(handlers));

    if (handler) {
        // Forward the request to the specific handler
        // The handler will see the full query parameters including 'route'
        try {
            return await handler(req, res);
        } catch (error: any) {
            console.error(`[API Dispatcher] Error in handler '${endpoint}':`, error);
            if (!res.headersSent) {
                return res.status(500).json({ error: 'Internal Server Error', details: error.message });
            }
        }
    } else {
        return res.status(404).json({ error: `Start Endpoint '${endpoint}' not found` });
    }
}
