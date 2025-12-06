import express from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validator.js';
import { authenticate } from '../middleware/auth.js';
import {
  addStock,
  getAllAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  getLowStockAssets,
  getAllCompanies,
  addCompany,
  getAllAssetTypes,
  addAssetType,
  getDashboardStats
} from '../controllers/inventoryController.js';
import {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial
} from '../controllers/materialController.js';
import {
  getAllStockAreas,
  getStockAreaById,
  createStockArea,
  updateStockArea,
  deleteStockArea
} from '../controllers/stockAreaController.js';
import {
  createInward,
  getAllInwards,
  getInwardById,
  updateInward,
  deleteInward
} from '../controllers/inwardController.js';
import {
  createMaterialRequest,
  getAllMaterialRequests,
  getMaterialRequestById,
  updateMaterialRequest,
  approveMaterialRequest,
  deleteMaterialRequest
} from '../controllers/materialRequestController.js';
import {
  createStockTransfer,
  getAllStockTransfers,
  getStockTransferById,
  updateStockTransfer,
  deleteStockTransfer
} from '../controllers/stockTransferController.js';
import {
  createConsumption,
  getAllConsumptions,
  getConsumptionById,
  updateConsumption,
  deleteConsumption
} from '../controllers/consumptionController.js';
import {
  getStockLevels,
  getStockLevelByMaterial,
  getStockSummary
} from '../controllers/stockLevelController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Health check
router.get("/health", (req, res) => {
  res.json({ message: "Inventory routes OK" });
});

// ==================== ASSET ROUTES ====================

/**
 * @route   POST /api/inventory/add-stock
 * @desc    Add new stock to inventory (creates new asset or updates existing)
 * @access  Private (add authentication middleware as needed)
 */
router.post(
  '/add-stock',
  [
    body('company')
      .notEmpty()
      .withMessage('Company is required')
      .trim(),
    body('assetType')
      .notEmpty()
      .withMessage('Asset type is required')
      .trim(),
    body('batchQty')
      .notEmpty()
      .withMessage('Batch quantity is required')
      .isInt({ min: 1 })
      .withMessage('Batch quantity must be a positive integer'),
    body('threshold')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Threshold must be a non-negative integer'),
    body('orgId')
      .optional()
      .isUUID()
      .withMessage('Invalid organization ID'),
  ],
  validate,
  addStock
);

/**
 * @route   GET /api/inventory/assets
 * @desc    Get all assets with filtering, searching, and pagination
 * @access  Private
 * @query   page, limit, search, assetType, company, orgId, showInactive
 */
router.get('/assets', getAllAssets);

/**
 * @route   GET /api/inventory/assets/:id
 * @desc    Get single asset by ID
 * @access  Private
 */
router.get(
  '/assets/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid asset ID')
  ],
  validate,
  getAssetById
);

/**
 * @route   PUT /api/inventory/assets/:id
 * @desc    Update asset details
 * @access  Private
 */
router.put(
  '/assets/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid asset ID'),
    body('assetType')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Asset type cannot be empty'),
    body('company')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Company cannot be empty'),
    body('totalIn')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Total in must be a non-negative integer'),
    body('totalOut')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Total out must be a non-negative integer'),
    body('addToOut')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Add to out must be a positive integer'),
    body('threshold')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Threshold must be a non-negative integer'),
  ],
  validate,
  updateAsset
);

/**
 * @route   DELETE /api/inventory/assets/:id
 * @desc    Delete (soft delete) an asset
 * @access  Private
 */
router.delete(
  '/assets/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid asset ID')
  ],
  validate,
  deleteAsset
);

/**
 * @route   GET /api/inventory/low-stock
 * @desc    Get assets with low stock (balance <= threshold)
 * @access  Private
 */
router.get('/low-stock', getLowStockAssets);

/**
 * @route   GET /api/inventory/dashboard
 * @desc    Get dashboard statistics and analytics
 * @access  Private
 */
router.get('/dashboard', getDashboardStats);

// ==================== COMPANY ROUTES ====================

/**
 * @route   GET /api/inventory/companies
 * @desc    Get all companies
 * @access  Private
 */
router.get('/companies', getAllCompanies);

/**
 * @route   POST /api/inventory/companies
 * @desc    Add new company
 * @access  Private (Admin only)
 */
router.post(
  '/companies',
  [
    body('companyCode')
      .notEmpty()
      .withMessage('Company code is required')
      .trim()
      .isLength({ min: 2, max: 10 })
      .withMessage('Company code must be 2-10 characters'),
    body('companyName')
      .notEmpty()
      .withMessage('Company name is required')
      .trim(),
    body('orgId')
      .optional()
      .isUUID()
      .withMessage('Invalid organization ID'),
  ],
  validate,
  addCompany
);

// ==================== ASSET TYPE ROUTES ====================

/**
 * @route   GET /api/inventory/asset-types
 * @desc    Get all asset types
 * @access  Private
 */
router.get('/asset-types', getAllAssetTypes);

/**
 * @route   POST /api/inventory/asset-types
 * @desc    Add new asset type
 * @access  Private (Admin only)
 */
router.post(
  '/asset-types',
  [
    body('typeName')
      .notEmpty()
      .withMessage('Type name is required')
      .trim(),
    body('typeCode')
      .notEmpty()
      .withMessage('Type code is required')
      .trim()
      .isLength({ min: 2, max: 20 })
      .withMessage('Type code must be 2-20 characters'),
    body('description')
      .optional()
      .trim(),
    body('orgId')
      .optional()
      .isUUID()
      .withMessage('Invalid organization ID'),
  ],
  validate,
  addAssetType
);

// ==================== MATERIAL ROUTES ====================

/**
 * @route   GET /api/inventory/materials
 * @desc    Get all materials with filtering and pagination
 * @access  Private
 */
router.get('/materials', getAllMaterials);

/**
 * @route   GET /api/inventory/materials/:id
 * @desc    Get single material by ID
 * @access  Private
 */
router.get(
  '/materials/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid material ID')
  ],
  validate,
  getMaterialById
);

/**
 * @route   POST /api/inventory/materials
 * @desc    Create new material
 * @access  Private
 */
router.post(
  '/materials',
  [
    body('materialName')
      .notEmpty()
      .withMessage('Material name is required')
      .trim(),
    body('productCode')
      .notEmpty()
      .withMessage('Product code is required')
      .trim(),
    body('materialType')
      .notEmpty()
      .withMessage('Material type is required')
      .trim(),
    body('uom')
      .optional()
      .trim(),
    body('orgId')
      .optional()
      .isUUID()
      .withMessage('Invalid organization ID'),
  ],
  validate,
  createMaterial
);

/**
 * @route   PUT /api/inventory/materials/:id
 * @desc    Update material
 * @access  Private
 */
router.put(
  '/materials/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid material ID'),
    body('materialName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Material name cannot be empty'),
    body('productCode')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Product code cannot be empty'),
  ],
  validate,
  updateMaterial
);

/**
 * @route   DELETE /api/inventory/materials/:id
 * @desc    Delete material (soft delete)
 * @access  Private
 */
router.delete(
  '/materials/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid material ID')
  ],
  validate,
  deleteMaterial
);

// ==================== STOCK AREA ROUTES ====================

/**
 * @route   GET /api/inventory/stock-areas
 * @desc    Get all stock areas
 * @access  Private
 */
router.get('/stock-areas', getAllStockAreas);

/**
 * @route   GET /api/inventory/stock-areas/:id
 * @desc    Get single stock area by ID
 * @access  Private
 */
router.get(
  '/stock-areas/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid stock area ID')
  ],
  validate,
  getStockAreaById
);

/**
 * @route   POST /api/inventory/stock-areas
 * @desc    Create new stock area
 * @access  Private
 */
router.post(
  '/stock-areas',
  [
    body('areaName')
      .notEmpty()
      .withMessage('Area name is required')
      .trim(),
    body('orgId')
      .optional()
      .isUUID()
      .withMessage('Invalid organization ID'),
  ],
  validate,
  createStockArea
);

/**
 * @route   PUT /api/inventory/stock-areas/:id
 * @desc    Update stock area
 * @access  Private
 */
router.put(
  '/stock-areas/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid stock area ID'),
    body('areaName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Area name cannot be empty'),
  ],
  validate,
  updateStockArea
);

/**
 * @route   DELETE /api/inventory/stock-areas/:id
 * @desc    Delete stock area (soft delete)
 * @access  Private
 */
router.delete(
  '/stock-areas/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid stock area ID')
  ],
  validate,
  deleteStockArea
);

// ==================== INWARD ROUTES ====================

/**
 * @route   POST /api/inventory/inward
 * @desc    Create new inward entry with items
 * @access  Private
 */
router.post(
  '/inward',
  [
    body('invoiceNumber')
      .notEmpty()
      .withMessage('Invoice number is required')
      .trim(),
    body('partyName')
      .notEmpty()
      .withMessage('Party name is required')
      .trim(),
    body('stockAreaId')
      .notEmpty()
      .isUUID()
      .withMessage('Valid stock area ID is required'),
    body('items')
      .isArray({ min: 1 })
      .withMessage('At least one item is required'),
    body('items.*.materialId')
      .notEmpty()
      .isUUID()
      .withMessage('Valid material ID is required for each item'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
  ],
  validate,
  createInward
);

/**
 * @route   GET /api/inventory/inward
 * @desc    Get all inward entries with filtering and pagination
 * @access  Private
 */
router.get('/inward', getAllInwards);

/**
 * @route   GET /api/inventory/inward/:id
 * @desc    Get single inward entry by ID with items
 * @access  Private
 */
router.get(
  '/inward/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid inward ID')
  ],
  validate,
  getInwardById
);

/**
 * @route   PUT /api/inventory/inward/:id
 * @desc    Update inward entry
 * @access  Private
 */
router.put(
  '/inward/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid inward ID'),
    body('stockAreaId')
      .optional()
      .isUUID()
      .withMessage('Invalid stock area ID'),
  ],
  validate,
  updateInward
);

/**
 * @route   DELETE /api/inventory/inward/:id
 * @desc    Delete inward entry (soft delete)
 * @access  Private
 */
router.delete(
  '/inward/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid inward ID')
  ],
  validate,
  deleteInward
);

// ==================== MATERIAL REQUEST ROUTES ====================

/**
 * @route   POST /api/inventory/material-request
 * @desc    Create new material request
 * @access  Private
 */
router.post(
  '/material-request',
  [
    body('prNumbers')
      .isArray({ min: 1 })
      .withMessage('At least one PR number is required'),
    body('prNumbers.*.prNumber')
      .notEmpty()
      .trim()
      .withMessage('PR number is required'),
    body('items')
      .isArray({ min: 1 })
      .withMessage('At least one item is required'),
    body('items.*.materialId')
      .notEmpty()
      .isUUID()
      .withMessage('Valid material ID is required for each item'),
    body('items.*.requestedQuantity')
      .isInt({ min: 1 })
      .withMessage('Requested quantity must be a positive integer'),
  ],
  validate,
  createMaterialRequest
);

/**
 * @route   GET /api/inventory/material-request
 * @desc    Get all material requests with filtering and pagination
 * @access  Private
 */
router.get('/material-request', getAllMaterialRequests);

/**
 * @route   GET /api/inventory/material-request/:id
 * @desc    Get single material request by ID
 * @access  Private
 */
router.get(
  '/material-request/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid material request ID')
  ],
  validate,
  getMaterialRequestById
);

/**
 * @route   PUT /api/inventory/material-request/:id
 * @desc    Update material request
 * @access  Private
 */
router.put(
  '/material-request/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid material request ID'),
  ],
  validate,
  updateMaterialRequest
);

/**
 * @route   POST /api/inventory/material-request/:id/approve
 * @desc    Approve or reject material request
 * @access  Private
 */
router.post(
  '/material-request/:id/approve',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid material request ID'),
    body('status')
      .isIn(['APPROVED', 'REJECTED'])
      .withMessage('Status must be APPROVED or REJECTED'),
    body('approvedItems')
      .optional()
      .isArray()
      .withMessage('Approved items must be an array'),
  ],
  validate,
  approveMaterialRequest
);

/**
 * @route   DELETE /api/inventory/material-request/:id
 * @desc    Delete material request (soft delete)
 * @access  Private
 */
router.delete(
  '/material-request/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid material request ID')
  ],
  validate,
  deleteMaterialRequest
);

// ==================== STOCK TRANSFER ROUTES ====================

/**
 * @route   POST /api/inventory/stock-transfer
 * @desc    Create new stock transfer
 * @access  Private
 */
router.post(
  '/stock-transfer',
  [
    body('fromStockAreaId')
      .notEmpty()
      .isUUID()
      .withMessage('Valid source stock area ID is required'),
    body('toStockAreaId')
      .notEmpty()
      .isUUID()
      .withMessage('Valid destination stock area ID is required'),
    body('items')
      .isArray({ min: 1 })
      .withMessage('At least one item is required'),
    body('items.*.materialId')
      .notEmpty()
      .isUUID()
      .withMessage('Valid material ID is required for each item'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
    body('materialRequestId')
      .optional()
      .isUUID()
      .withMessage('Invalid material request ID'),
  ],
  validate,
  createStockTransfer
);

/**
 * @route   GET /api/inventory/stock-transfer
 * @desc    Get all stock transfers with filtering and pagination
 * @access  Private
 */
router.get('/stock-transfer', getAllStockTransfers);

/**
 * @route   GET /api/inventory/stock-transfer/:id
 * @desc    Get single stock transfer by ID
 * @access  Private
 */
router.get(
  '/stock-transfer/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid stock transfer ID')
  ],
  validate,
  getStockTransferById
);

/**
 * @route   PUT /api/inventory/stock-transfer/:id
 * @desc    Update stock transfer
 * @access  Private
 */
router.put(
  '/stock-transfer/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid stock transfer ID'),
    body('fromStockAreaId')
      .optional()
      .isUUID()
      .withMessage('Invalid source stock area ID'),
    body('toStockAreaId')
      .optional()
      .isUUID()
      .withMessage('Invalid destination stock area ID'),
  ],
  validate,
  updateStockTransfer
);

/**
 * @route   DELETE /api/inventory/stock-transfer/:id
 * @desc    Delete stock transfer (soft delete)
 * @access  Private
 */
router.delete(
  '/stock-transfer/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid stock transfer ID')
  ],
  validate,
  deleteStockTransfer
);

// ==================== CONSUMPTION ROUTES ====================

/**
 * @route   POST /api/inventory/consumption
 * @desc    Create new consumption record
 * @access  Private
 */
router.post(
  '/consumption',
  [
    body('externalSystemRefId')
      .notEmpty()
      .trim()
      .withMessage('External system reference ID is required'),
    body('items')
      .isArray({ min: 1 })
      .withMessage('At least one item is required'),
    body('items.*.materialId')
      .notEmpty()
      .isUUID()
      .withMessage('Valid material ID is required for each item'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
    body('stockAreaId')
      .optional()
      .isUUID()
      .withMessage('Invalid stock area ID'),
  ],
  validate,
  createConsumption
);

/**
 * @route   GET /api/inventory/consumption
 * @desc    Get all consumption records with filtering and pagination
 * @access  Private
 */
router.get('/consumption', getAllConsumptions);

/**
 * @route   GET /api/inventory/consumption/:id
 * @desc    Get single consumption record by ID
 * @access  Private
 */
router.get(
  '/consumption/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid consumption ID')
  ],
  validate,
  getConsumptionById
);

/**
 * @route   PUT /api/inventory/consumption/:id
 * @desc    Update consumption record
 * @access  Private
 */
router.put(
  '/consumption/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid consumption ID'),
    body('stockAreaId')
      .optional()
      .isUUID()
      .withMessage('Invalid stock area ID'),
  ],
  validate,
  updateConsumption
);

/**
 * @route   DELETE /api/inventory/consumption/:id
 * @desc    Delete consumption record (soft delete)
 * @access  Private
 */
router.delete(
  '/consumption/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid consumption ID')
  ],
  validate,
  deleteConsumption
);

// ==================== STOCK LEVEL ROUTES ====================

/**
 * @route   GET /api/inventory/stock-levels
 * @desc    Get stock levels for materials
 * @access  Private
 * @query   materialId, stockAreaId, materialType, orgId
 */
router.get('/stock-levels', getStockLevels);

/**
 * @route   GET /api/inventory/stock-levels/:materialId
 * @desc    Get stock level for specific material
 * @access  Private
 * @query   stockAreaId, orgId
 */
router.get(
  '/stock-levels/:materialId',
  [
    param('materialId')
      .isUUID()
      .withMessage('Invalid material ID')
  ],
  validate,
  getStockLevelByMaterial
);

/**
 * @route   GET /api/inventory/stock-summary
 * @desc    Get stock summary across all areas
 * @access  Private
 * @query   orgId
 */
router.get('/stock-summary', getStockSummary);

// ==================== REPORTS ROUTES ====================

/**
 * @route   GET /api/inventory/reports/transactions
 * @desc    Get transaction history report
 * @access  Private
 */
router.get('/reports/transactions', getTransactionHistory);

/**
 * @route   GET /api/inventory/reports/movement
 * @desc    Get stock movement report
 * @access  Private
 */
router.get('/reports/movement', getStockMovement);

/**
 * @route   GET /api/inventory/reports/consumption
 * @desc    Get consumption analysis report
 * @access  Private
 */
router.get('/reports/consumption', getConsumptionAnalysis);

/**
 * @route   GET /api/inventory/reports/valuation
 * @desc    Get stock valuation report
 * @access  Private
 */
router.get('/reports/valuation', getStockValuation);

// ==================== FILE/DOCUMENT ROUTES ====================

/**
 * @route   GET /api/inventory/documents/:filename
 * @desc    Download document/file
 * @access  Private
 */
router.get('/documents/:filename', downloadDocument);

/**
 * @route   DELETE /api/inventory/documents/:filename
 * @desc    Delete document
 * @access  Private
 */
router.delete('/documents/:filename', deleteDocument);

/**
 * @route   POST /api/inventory/inward/:inwardId/documents
 * @desc    Add documents to existing inward entry
 * @access  Private
 */
router.post(
  '/inward/:inwardId/documents',
  uploadInwardDocuments,
  addDocumentsToInward
);

// ==================== AUDIT TRAIL ROUTES ====================

/**
 * @route   GET /api/inventory/audit-logs
 * @desc    Get audit logs/history
 * @access  Private
 */
router.get('/audit-logs', getAuditLogs);

/**
 * @route   GET /api/inventory/history/:entityType/:entityId
 * @desc    Get history for specific entity
 * @access  Private
 */
router.get('/history/:entityType/:entityId', getEntityHistory);

// ==================== NOTIFICATION ROUTES ====================

/**
 * @route   GET /api/inventory/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/notifications', getNotifications);

/**
 * @route   PUT /api/inventory/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/notifications/:notificationId/read', markNotificationRead);

/**
 * @route   DELETE /api/inventory/notifications/:notificationId
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/notifications/:notificationId', deleteNotification);

// ==================== SEARCH ROUTES ====================

/**
 * @route   GET /api/inventory/search
 * @desc    Global search across all inventory entities
 * @access  Private
 */
router.get('/search', globalSearch);

// ==================== BULK OPERATIONS ROUTES ====================

/**
 * @route   POST /api/inventory/bulk/materials
 * @desc    Bulk create/update materials
 * @access  Private
 */
router.post('/bulk/materials', bulkMaterials);

/**
 * @route   POST /api/inventory/bulk/inward
 * @desc    Bulk create inward entries
 * @access  Private
 */
router.post('/bulk/inward', bulkInward);

// ==================== EXPORT ROUTES ====================

/**
 * @route   GET /api/inventory/export/materials
 * @desc    Export materials to CSV/JSON
 * @access  Private
 */
router.get('/export/materials', exportMaterials);

/**
 * @route   GET /api/inventory/export/inward
 * @desc    Export inward entries to CSV/JSON
 * @access  Private
 */
router.get('/export/inward', exportInward);

/**
 * @route   GET /api/inventory/export/stock-levels
 * @desc    Export stock levels to CSV/JSON
 * @access  Private
 */
router.get('/export/stock-levels', exportStockLevels);

// ==================== VALIDATION ROUTES ====================

/**
 * @route   POST /api/inventory/validate/product-code
 * @desc    Validate if product code exists
 * @access  Private
 */
router.post('/validate/product-code', validateProductCode);

/**
 * @route   POST /api/inventory/validate/slip-number
 * @desc    Validate if slip number exists
 * @access  Private
 */
router.post('/validate/slip-number', validateSlipNumber);

export default router;