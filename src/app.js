import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { requireAuth } from "./middlewares/auth.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import routes from "./routes/index.js";

const app = express();

app.use(
  cors({
    origin: env.corsOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  }),
);
app.use(express.json());

// Público, sin JWT: para probar que el server está vivo (health check).
app.get("/health", (req, res) => res.json({ status: "ok" }));

// De acá para abajo, todo pasa primero por requireAuth (Resource Server).
app.use(requireAuth, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
