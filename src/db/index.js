import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';              // ← add this
import { DB_NAME } from "../constant.js";

const sequelize = new Sequelize(DB_NAME, 'root', '', {
  host: '127.0.0.1',
  port: 3306,
  dialect: 'mysql',
  logging: false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
});

const connectDB = async () => {
  try {
    // NEW: ensure DB exists before authenticate
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '' // put your password if you have one
    });
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await conn.end();

    await sequelize.authenticate();
    console.log(`\nConnected to MySQL: ${sequelize.getDatabaseName()}`);

    await import('../models/index.js');

    const [results] = await sequelize.query("SHOW TABLES");
    const tableExists = results.length > 0;

    if (tableExists) {
      console.log('Existing tables found. Skipping sync to avoid conflicts.');
      console.log('If you need to update the database structure, please run: npm run reset-db');
    } else {
      console.log('No existing tables found. Creating new tables.');
      await sequelize.sync({ force: false });
      console.log('Database synchronized successfully');
    }
  } catch (error) {
    console.error('MySQL connection error:', error);
    console.log('\nTo fix database structure issues, please run: npm run reset-db');
    process.exit(1);
  }
};

export { sequelize };
export default connectDB;
