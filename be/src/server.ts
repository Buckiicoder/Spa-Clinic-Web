import { config } from "dotenv";
config();
import app from "./app.js";
import { verifyDatabaseConnection } from "./config/db.js";
import http from "http";
import { initSocket } from "./socket.js";
import "./utils/payroll.cron.js";
import { startBookingCron } from "./utils/bookingCron.js";
import { startAutoCheckoutCron } from "./utils/autoCheckoutCron.js";
import { start } from "repl";

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await verifyDatabaseConnection(); // 🔥 VERIFY TRƯỚC
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      startBookingCron();
      startAutoCheckoutCron();
    });
  } catch (err) {
    console.error("❌ Server aborted due to DB error");
    process.exit(1);
  }
};

startServer();
