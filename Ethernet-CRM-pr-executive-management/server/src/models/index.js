// Import all models
import User from './User.js';
import Asset from './Asset.js';
import AssetType from './AssetType.js';
import Company from './Company.js';
import Material from './Material.js';
import StockArea from './StockArea.js';
import InwardEntry from './InwardEntry.js';
import InwardItem from './InwardItem.js';
import MaterialRequest from './MaterialRequest.js';
import MaterialRequestItem from './MaterialRequestItem.js';
import StockTransfer from './StockTransfer.js';
import StockTransferItem from './StockTransferItem.js';
import ConsumptionRecord from './ConsumptionRecord.js';
import ConsumptionItem from './ConsumptionItem.js';

// ==================== INVENTORY MODEL ASSOCIATIONS ====================

// StockArea associations
StockArea.hasMany(InwardEntry, { foreignKey: 'stock_area_id', as: 'inwardEntries' });
InwardEntry.belongsTo(StockArea, { foreignKey: 'stock_area_id', as: 'stockArea' });

StockArea.hasMany(StockTransfer, { foreignKey: 'from_stock_area_id', as: 'transfersFrom' });
StockArea.hasMany(StockTransfer, { foreignKey: 'to_stock_area_id', as: 'transfersTo' });
StockTransfer.belongsTo(StockArea, { foreignKey: 'from_stock_area_id', as: 'fromStockArea' });
StockTransfer.belongsTo(StockArea, { foreignKey: 'to_stock_area_id', as: 'toStockArea' });

StockArea.hasMany(ConsumptionRecord, { foreignKey: 'stock_area_id', as: 'consumptionRecords' });
ConsumptionRecord.belongsTo(StockArea, { foreignKey: 'stock_area_id', as: 'stockArea' });

// Material associations
Material.hasMany(InwardItem, { foreignKey: 'material_id', as: 'inwardItems' });
InwardItem.belongsTo(Material, { foreignKey: 'material_id', as: 'material' });

Material.hasMany(MaterialRequestItem, { foreignKey: 'material_id', as: 'requestItems' });
MaterialRequestItem.belongsTo(Material, { foreignKey: 'material_id', as: 'material' });

Material.hasMany(StockTransferItem, { foreignKey: 'material_id', as: 'transferItems' });
StockTransferItem.belongsTo(Material, { foreignKey: 'material_id', as: 'material' });

Material.hasMany(ConsumptionItem, { foreignKey: 'material_id', as: 'consumptionItems' });
ConsumptionItem.belongsTo(Material, { foreignKey: 'material_id', as: 'material' });

// InwardEntry associations
InwardEntry.hasMany(InwardItem, { foreignKey: 'inward_id', as: 'items' });
InwardItem.belongsTo(InwardEntry, { foreignKey: 'inward_id', as: 'inwardEntry' });

// MaterialRequest associations
MaterialRequest.hasMany(MaterialRequestItem, { foreignKey: 'request_id', as: 'items' });
MaterialRequestItem.belongsTo(MaterialRequest, { foreignKey: 'request_id', as: 'materialRequest' });

MaterialRequest.hasMany(StockTransfer, { foreignKey: 'material_request_id', as: 'stockTransfers' });
StockTransfer.belongsTo(MaterialRequest, { foreignKey: 'material_request_id', as: 'materialRequest' });

// StockTransfer associations
StockTransfer.hasMany(StockTransferItem, { foreignKey: 'transfer_id', as: 'items' });
StockTransferItem.belongsTo(StockTransfer, { foreignKey: 'transfer_id', as: 'stockTransfer' });

// ConsumptionRecord associations
ConsumptionRecord.hasMany(ConsumptionItem, { foreignKey: 'consumption_id', as: 'items' });
ConsumptionItem.belongsTo(ConsumptionRecord, { foreignKey: 'consumption_id', as: 'consumptionRecord' });

// User associations (for created_by, updated_by, requested_by, approved_by)
User.hasMany(InwardEntry, { foreignKey: 'created_by', as: 'createdInwards' });
InwardEntry.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
InwardEntry.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });

User.hasMany(MaterialRequest, { foreignKey: 'requested_by', as: 'materialRequests' });
MaterialRequest.belongsTo(User, { foreignKey: 'requested_by', as: 'requester' });
MaterialRequest.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

User.hasMany(StockTransfer, { foreignKey: 'created_by', as: 'createdTransfers' });
StockTransfer.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
StockTransfer.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });

User.hasMany(ConsumptionRecord, { foreignKey: 'created_by', as: 'consumptionRecords' });
ConsumptionRecord.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Export all models
const models = {
  User,
  Asset,
  AssetType,
  Company,
  Material,
  StockArea,
  InwardEntry,
  InwardItem,
  MaterialRequest,
  MaterialRequestItem,
  StockTransfer,
  StockTransferItem,
  ConsumptionRecord,
  ConsumptionItem,
};

export default models;
