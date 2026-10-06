import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ErrorResponseSchema } from '../contracts';
import { IdempotencyService } from '../integrations/idempotency';
import { auditService } from '../audit';
import { auth } from '@clerk/nextjs/server';

export interface ApiContext {
  userId: string | null;
  role: string;
  permissions: string[];
  requestId: string;
}

export interface ApiHandlerOptions<TReq = unknown> {
  req: Request;
  requireAuth?: boolean;
  requiredPermissions?: string[];
  idempotencyKey?: string | null;
  schema?: z.ZodType<TReq>;
  rateLimit?: {
    limit: number;
    windowSeconds: number;
    keyGen?: (req: Request, userId: string | null) => string;
  };
}

export type ApiHandler<TReq, TRes> = (ctx: ApiContext, input: TReq) => Promise<TRes>;

/**
 * Universal API Route Wrapper
 * Handles:
 * - Next.js Request / Response formatting
 * - Clerk Authentication (supports Mobile Bearer tokens via Clerk's middleware)
 * - Schema validation
 * - Error normalization
 * - Idempotency
 * - Request IDs
 */
export async function createApiRoute<TReq, TRes>(
  options: ApiHandlerOptions<TReq>,
  handler: ApiHandler<TReq, TRes>
): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  let userId: string | null = null;
  let role = 'guest';
  let permissions: string[] = [];

  try {
    // 1. Authentication
    const authResult = await auth();
    userId = authResult?.userId || null;
    
    // In a real implementation, you'd fetch user role from db or clerk metadata here
    // For now, simple mock resolution
    if (userId) {
      role = 'user'; 
      permissions = ['user'];
    }

    if (options.requireAuth && !userId) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    if (options.requiredPermissions && options.requiredPermissions.length > 0) {
      const hasPermission = options.requiredPermissions.every(p => permissions.includes(p));
      if (!hasPermission) {
        return errorResponse('FORBIDDEN', 'Insufficient permissions', 403);
      }
    }

    // 1.5 Rate Limiting
    if (options.rateLimit) {
      const { rateLimiter } = await import('../rate-limit');
      const rlKey = options.rateLimit.keyGen 
        ? options.rateLimit.keyGen(options.req, userId)
        : `default:${userId || 'ip'}`;
      
      const rlResult = await rateLimiter.check(rlKey, options.rateLimit.limit, options.rateLimit.windowSeconds);
      if (!rlResult.allowed) {
        return errorResponse('TOO_MANY_REQUESTS', 'Rate limit exceeded', 429, { resetAt: rlResult.resetAt });
      }
    }

    // 2. Body Parsing & Validation
    let input: TReq = {} as TReq;
    if (options.schema && ['POST', 'PUT', 'PATCH'].includes(options.req.method)) {
      let body;
      try {
        body = await options.req.json();
      } catch (e) {
        return errorResponse('INVALID_JSON', 'Malformed JSON body', 400);
      }
      const parsed = options.schema.safeParse(body);
      if (!parsed.success) {
        return errorResponse('VALIDATION_ERROR', 'Invalid request payload', 400, parsed.error.format());
      }
      input = parsed.data;
    } else if (options.schema && options.req.method === 'GET') {
      const { searchParams } = new URL(options.req.url);
      const params = Object.fromEntries(searchParams.entries());
      const parsed = options.schema.safeParse(params);
      if (!parsed.success) {
        return errorResponse('VALIDATION_ERROR', 'Invalid query parameters', 400, parsed.error.format());
      }
      input = parsed.data;
    }

    const ctx: ApiContext = {
      userId,
      role,
      permissions,
      requestId,
    };

    // 3. Execution (with Idempotency)
    const execute = () => handler(ctx, input);

    let result: TRes;
    if (options.idempotencyKey) {
      result = await IdempotencyService.execute(`api-${options.idempotencyKey}`, execute);
    } else {
      result = await execute();
    }

    // 4. Success Response
    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error: unknown) {
    console.error(`[API Error] ${options.req.method} ${options.req.url} - ${requestId}:`, error);
    return errorResponse('INTERNAL_ERROR', (error as Error).message || 'An unexpected error occurred', 500);
  }
}

function errorResponse(code: string, message: string, status: number, details?: unknown) {
  const payload = {
    success: false,
    error: {
      code,
      message,
      details,
    }
  };
  return NextResponse.json(payload, { status });
}
