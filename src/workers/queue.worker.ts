import emailQueue, { getQueueStats as getEmailQueueStats } from '../queues/email.queue';
import auditLogQueue, { getAuditQueueStats } from '../queues/audit-log.queue';

console.log('🚀 Queue Worker Starting...');

emailQueue.on('ready', () => {
  console.log('✅ Email Queue Worker Ready');
});

auditLogQueue.on('ready', () => {
  console.log('✅ Audit Log Queue Worker Ready');
});

setInterval(async () => {
  const [emailStats, auditStats] = await Promise.all([
    getEmailQueueStats(),
    getAuditQueueStats(),
  ]);

  console.log('\n📊 Queue Statistics:');
  console.log('Email Queue:', emailStats);
  console.log('Audit Log Queue:', auditStats);
}, 60000);

const gracefulShutdown = async () => {
  console.log('\n⏳ Shutting down queue workers gracefully...');
  
  await Promise.all([
    emailQueue.close(),
    auditLogQueue.close(),
  ]);
  
  console.log('✅ All queues closed');
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

console.log('✅ Queue Worker Started Successfully');
