import { Sequelize } from 'sequelize';
import { DB_NAME } from "../constant.js";

const sequelize = new Sequelize(DB_NAME, 'root', '', {
  host: '127.0.0.1',
  port: 3306,
  dialect: 'mysql',
  logging: false, // Set to console.log to see SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`\nConnected to MySQL: ${sequelize.getDatabaseName()}`);
    
    // Import models to establish relationships
    await import('../models/index.js');
    
    // Sync all models - use alter: true to update tables without losing data
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('MySQL connection error:', error);
    process.exit(1);
  }
};

export { sequelize };
export default connectDB;
