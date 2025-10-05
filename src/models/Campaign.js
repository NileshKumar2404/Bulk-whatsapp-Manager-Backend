import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const Campaign = sequelize.define('Campaign', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  businessId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  templateId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'templates',
      key: 'id'
    }
  },
  customerIds: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'JSON string of customer IDs'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'scheduled', 'running', 'completed', 'paused', 'failed', 'cancelled'),
    defaultValue: 'draft'
  },
  recipientCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  filters: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: { tags: [] }
  },
  stats: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      total: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0
    }
  }
}, {
  tableName: 'campaigns',
  timestamps: true
});

export { Campaign };
