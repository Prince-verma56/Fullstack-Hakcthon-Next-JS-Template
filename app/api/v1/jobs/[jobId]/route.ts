import { createApiRoute } from '@/server/api';
import { getJobQueue } from '@/server/jobs';

export async function GET(req: Request, { params }: { params: { jobId: string } }) {
  return createApiRoute(
    { req, requireAuth: true },
    async (ctx) => {
      const queue = getJobQueue();
      const status = await queue.getJobStatus(params.jobId);
      
      if (!status) {
        throw new Error('Job not found');
      }

      return status;
    }
  );
}
