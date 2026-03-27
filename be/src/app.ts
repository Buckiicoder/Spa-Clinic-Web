import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

//demo
// app.use(cors({
//   origin: ["http://localhost:5173", "http://localhost:5174"],
//   credentials: true
// }))

//reality
app.use(
  cors({
    origin: [
      "https://spa-clinic-web.vercel.app",
      "https://spa-clinic-mk6vzac1d-buckiicoders-projects.vercel.app",
    ],
    credentials: true,
  }),
);

app.options("*", cors());
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

export default app;
