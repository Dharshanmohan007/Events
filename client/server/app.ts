import express from "express";
import cors from "cors";
import individualEventAttendingRoutes from "./routes/individualEventAttending.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));

app.use("/api/individual-event-attending", individualEventAttendingRoutes);

app.get("/health", (_req, res) => {
  res.json({ success: true, status: "ok" });
});

export default app;
