import path from "path";

export const config = {
  databasePath: path.join(
    process.cwd(),
    process.env.DATABASE_PATH || "documents.db",
  ),
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : ["http://localhost:5173", "http://localhost:3000"],
};
