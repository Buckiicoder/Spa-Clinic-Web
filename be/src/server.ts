import { config } from 'dotenv'
config()

import app from './app.js'
import { verifyDatabaseConnection } from './config/db.js'

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await verifyDatabaseConnection() // 🔥 VERIFY TRƯỚC
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  } catch (err) {
    console.error('❌ Server aborted due to DB error')
    process.exit(1)
  }
}

startServer()
