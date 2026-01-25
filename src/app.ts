import express from 'express';
import cors from 'cors';
import orgRoutes from './routes/orgRoutes';
import jobRoutes from "./routes/job.routes"
import orgEmpRoutes from "./routes/orgEmpRoutes";
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/user.routes';
const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

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

app.use('/api', orgRoutes);
app.use("/api",jobRoutes);
app.use("/api", orgEmpRoutes)
app.use('/api',authRoutes)
app.use('/api' , userRoutes)

// Global error handler (should be after routes)
// app.use(errorHandler);

export default app;
