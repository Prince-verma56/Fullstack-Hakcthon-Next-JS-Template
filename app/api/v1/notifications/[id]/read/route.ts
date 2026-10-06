import { createApiRoute } from '@/server/api';
import { notificationService } from '@/server/notifications';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return createApiRoute(
    { req, requireAuth: true },
    async (ctx) => {
      const success = await notificationService.markAsRead(params.id, ctx.userId!);
      return { success };
    }
  );
}
