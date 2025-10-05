import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  businessId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Temporarily nullable to allow migration
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phoneE164: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^\+\d{8,15}$/
    }
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  consentAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'customers',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'phoneE164']
    }
  ]
});

export { Customer };
