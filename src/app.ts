import express from 'express';
// import itemRoutes from './routes/itemRoutes';
// import { errorHandler } from './middlewares/errorHandler';

const app = express();

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
// app.use("/items", itemRoutes);

// Global error handler (should be after routes)
// app.use(errorHandler);

export default app;
