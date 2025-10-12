import { User } from './User.js';
import { Business } from './Business.js';
import { Customer } from './Customer.js';
import { Template } from './Template.js';
import { Campaign } from './Campaign.js';
import { MessageLog } from './MessageLog.js';
import Employee from './Employee.js';

// Define associations
User.hasMany(Business, { foreignKey: 'userId', as: 'businesses' });
Business.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Customer, { foreignKey: 'userId', as: 'customers' });
Customer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Template, { foreignKey: 'userId', as: 'templates' });
Template.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Campaign, { foreignKey: 'userId', as: 'campaigns' });
Campaign.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Employee, { foreignKey: 'userId', as: 'employees' });
Employee.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Template.hasMany(Campaign, { foreignKey: 'templateId', as: 'campaigns' });
Campaign.belongsTo(Template, { foreignKey: 'templateId', as: 'template' });

Campaign.hasMany(MessageLog, { foreignKey: 'campaignId', as: 'messageLogs' });
MessageLog.belongsTo(Campaign, { foreignKey: 'campaignId', as: 'campaign' });

Customer.hasMany(MessageLog, { foreignKey: 'customerId', as: 'messageLogs' });
MessageLog.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Template.hasMany(MessageLog, { foreignKey: 'templateId', as: 'messageLogs' });
MessageLog.belongsTo(Template, { foreignKey: 'templateId', as: 'template' });

export {
  User,
  Business,
  Customer,
  Template,
  Campaign,
  MessageLog,
  Employee
};
