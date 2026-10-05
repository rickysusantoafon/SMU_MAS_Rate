/**
 * Serverless Health Check Endpoint
 * Route: /api/health
 */

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  service: string;
  timestamp: string;
  uptimeSeconds: number;
  masKeyConfigured: boolean;
  masEndpoint: string;
  endpoints: {
    health: string;
    sora: string;
  };
}

export default async function handler(req: any, res: any) {
  // Set permissive CORS headers for client-side consumption
  res.setHeader?.('Access-Control-Allow-Origin', '*');
  res.setHeader?.('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader?.('Access-Control-Allow-Headers', 'Content-Type, KeyId, Authorization');

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      return res.status(200).end();
    }
    res.writeHead?.(200);
    return res.end?.();
  }

  const masKeyConfigured = Boolean(
    process.env.MAS_KEY_ID && process.env.MAS_KEY_ID.trim().length > 0
  );

  const payload: HealthResponse = {
    status: 'healthy',
    service: 'MAS SORA Serverless API Gateway',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    masKeyConfigured,
    masEndpoint:
      'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily',
    endpoints: {
      health: '/api/health',
      sora: '/api/sora',
    },
  };

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(200).json(payload);
  }

  res.writeHead?.(200, { 'Content-Type': 'application/json' });
  return res.end?.(JSON.stringify(payload));
}
