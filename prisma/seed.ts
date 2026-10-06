import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  
  // Seed demo user
  const user = await prisma.user.upsert({
    where: { id: 'demo-user' },
    update: {},
    create: {
      id: 'demo-user',
      clerkUserId: 'demo-clerk-123',
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'user',
    },
  });

  // Seed demo conversation
  const conv = await prisma.conversation.upsert({
    where: { id: 'demo-conv' },
    update: {},
    create: {
      id: 'demo-conv',
      userId: user.id,
      channel: 'text',
      metadata: { title: 'Demo Conversation', status: 'active' },
    },
  });

  // Seed demo message
  await prisma.message.upsert({
    where: { id: 'demo-msg-1' },
    update: {},
    create: {
      id: 'demo-msg-1',
      conversationId: conv.id,
      role: 'assistant',
      content: 'Hello! I am the demo AI assistant. How can I help you today?',
    },
  });

  // Example RAG document (abstract)
  await prisma.document.upsert({
    where: { id: 'demo-doc-1' },
    update: {},
    create: {
      id: 'demo-doc-1',
      userId: user.id,
      filename: 'Platform Overview.txt',
      mimeType: 'text/plain',
      metadata: { 
        source: 'demo',
        content: 'This platform provides a generic AI foundation with text, voice, tools, RAG, and multi-agent orchestration capabilities.'
      },
    },
  });

  console.log('✅ Database seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
