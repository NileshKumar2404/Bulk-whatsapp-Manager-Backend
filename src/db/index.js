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
    
    // Check if tables exist and sync accordingly
    const [results] = await sequelize.query("SHOW TABLES");
    const tableExists = results.length > 0;
    
    if (tableExists) {
      console.log('Existing tables found. Skipping sync to avoid conflicts.');
      console.log('If you need to update the database structure, please run: npm run reset-db');
      // Skip sync entirely when tables exist to avoid conflicts
    } else {
      console.log('No existing tables found. Creating new tables.');
      // Create new tables
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