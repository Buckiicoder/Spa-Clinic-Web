import { config } from 'dotenv'
config()

import { Pool } from 'pg'

if (!process.env.DATABASE_URL) {
  throw new Error('❌ DATABASE_URL is not defined')
}

// Db dùng trong local
export const db = new Pool({
  connectionString: process.env.DATABASE_URL
})

// Db dùng cho deploy server
// export const db = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });


// 🔥 VERIFY THỰC SỰ DB
export const verifyDatabaseConnection = async () => {
  try {
    const res = await db.query(
      'SELECT current_database(), current_user, NOW()'
    )

    console.log('✅ PostgreSQL connected successfully')
    console.log('📦 Database:', res.rows[0].current_database)
    console.log('👤 User:', res.rows[0].current_user)
  } catch (err) {
    console.error('❌ PostgreSQL connection FAILED')
    throw err
  }
}
