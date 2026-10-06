/**
 * Health Check API Endpoint
 *
 * GET /api/health
 *
 * Returns the application health status.
 * Useful for Docker health checks and monitoring.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
