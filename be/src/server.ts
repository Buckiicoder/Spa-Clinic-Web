import { config } from 'dotenv'
config()
import app from './app.js'
import { verifyDatabaseConnection } from './config/db.js'
import http from "http";
import { initSocket } from "./socket.js"

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await verifyDatabaseConnection() // 🔥 VERIFY TRƯỚC
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  } catch (err) {
    console.error('❌ Server aborted due to DB error')
    process.exit(1)
  }
}

startServer()
