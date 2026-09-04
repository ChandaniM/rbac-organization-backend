import express from 'express';
import cors from 'cors';
import orgRoutes from './routes/orgRoutes';
import jobRoutes from "./routes/job.routes"
import orgEmpRoutes from "./routes/orgEmpRoutes";
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/user.routes';
import documentRoutes from './routes/document.routes';
import announcementRoutes from './routes/announcement.routes';
import dashboardRoutes from './routes/dashboard.routes';
import NotificationRoutes from './routes/notification.routes';
import auditLogRoutes from './routes/audit-log.routes';
import queueMonitorRoutes from './routes/queue-monitor.routes';
import deduplicationMonitorRoutes from './routes/deduplication-monitor.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import { auditLogMiddleware } from './middlewares/audit-log.middleware';
import './config/redis.config';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Add audit logging middleware
app.use(auditLogMiddleware({
  excludePaths: ['/health', '/metrics', '/api/audit-logs']
}));

// Default help route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the API! Use /items or other endpoints to interact with the API.",
    availableRoutes: {
      items: "/items",
      // add more routes here
    }
  });
});

// Routes

app.use('/api/resources', documentRoutes);
app.use('/api', orgRoutes);
app.use("/api", orgEmpRoutes)
app.use('/api',authRoutes)
app.use('/api' , userRoutes)
app.use("/api",jobRoutes);
app.use("/api/announcements", announcementRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/notifications', NotificationRoutes);
app.use('/api', auditLogRoutes);
app.use('/api/monitoring', queueMonitorRoutes);
app.use('/api/monitoring', deduplicationMonitorRoutes);
app.use('/api', projectRoutes);
app.use('/api', taskRoutes);

export default app;
