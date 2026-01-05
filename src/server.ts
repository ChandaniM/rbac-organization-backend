// src/server.ts
import app from "./app";
import config from "./config/config";
import { connectDB } from "./config/mongo"; // ✅ NOTE THE { }

const startServer = async () => {
  await connectDB(); // DB connection

  app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
  });
};

startServer();
