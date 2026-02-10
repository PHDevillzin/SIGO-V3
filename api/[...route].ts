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

    // route is an array of path segments, e.g. ['users'] or ['users', '123']
    // For our flat API structure, the first segment is the endpoint.
    // E.g. /api/users -> route: ['users']
    
    if (!route || !Array.isArray(route) || route.length === 0) {
        return res.status(404).json({ error: 'Endpoint not found' });
    }

    const endpoint = route[0];
    const handler = handlers[endpoint];

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
