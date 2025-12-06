import InwardEntry from '../models/InwardEntry.js';
import InwardItem from '../models/InwardItem.js';
import Material from '../models/Material.js';
import StockArea from '../models/StockArea.js';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { generateGRN } from '../utils/slipGenerator.js';

/**
 * Create new inward entry with items
 * POST /api/inventory/inward
 */
export const createInward = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      date,
      invoiceNumber,
      partyName,
      purchaseOrder,
      stockAreaId,
      vehicleNumber,
      remark,
      items, // Array of items
      documents // Array of document file paths/URLs
    } = req.body;

    const userId = req.user?.id || req.user?.user_id;

    // Validate stock area exists
    const stockArea = await StockArea.findOne({
      where: { area_id: stockAreaId, is_active: true }
    });

    if (!stockArea) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid stock area'
      });
    }

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }

    // Generate unique slip number
    let slipNumber = generateGRN();
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      const existing = await InwardEntry.findOne({
        where: { slip_number: slipNumber }
      });
      if (!existing) {
        isUnique = true;
      } else {
        slipNumber = generateGRN();
        attempts++;
      }
    }

    // Create inward entry
    const inwardEntry = await InwardEntry.create({
      date: date || new Date().toISOString().split('T')[0],
      invoice_number: invoiceNumber,
      party_name: partyName,
      purchase_order: purchaseOrder || null,
      stock_area_id: stockAreaId,
      vehicle_number: vehicleNumber || null,
      slip_number: slipNumber,
      status: 'COMPLETED',
      remark: remark || null,
      documents: documents || null,
      org_id: req.body.orgId || null,
      created_by: userId,
      updated_by: userId,
      is_active: true
    }, { transaction });

    // Validate and create items
    const createdItems = [];
    for (const item of items) {
      const { materialId, quantity, price, serialNumber, macId, remarks } = item;

      // Validate material exists
      const material = await Material.findOne({
        where: { material_id: materialId, is_active: true }
      });

      if (!material) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Material with ID ${materialId} not found`
        });
      }

      const inwardItem = await InwardItem.create({
        inward_id: inwardEntry.inward_id,
        material_id: materialId,
        quantity: parseInt(quantity) || 1,
        price: price ? parseFloat(price) : null,
        serial_number: serialNumber || null,
        mac_id: macId || null,
        remarks: remarks || null
      }, { transaction });

      createdItems.push(inwardItem);
    }

    await transaction.commit();

    // Fetch complete inward entry with items and relations
    const completeInward = await InwardEntry.findOne({
      where: { inward_id: inwardEntry.inward_id },
      include: [
        {
          model: InwardItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material'
            }
          ]
        },
        {
          model: StockArea,
          as: 'stockArea'
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Inward entry created successfully',
      data: completeInward
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating inward entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create inward entry',
      error: error.message
    });
  }
};

/**
 * Get all inward entries with filtering and pagination
 * GET /api/inventory/inward
 */
export const getAllInwards = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      stockAreaId = '',
      partyName = '',
      dateFrom = '',
      dateTo = '',
      status = '',
      orgId = '',
      showInactive = false
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(parseInt(limit, 10) || 50, 1);
    const offset = (pageNumber - 1) * limitNumber;

    // Build where clause
    const whereClause = {};

    if (orgId) {
      whereClause.org_id = orgId;
    }

    if (!showInactive || showInactive === 'false') {
      whereClause.is_active = true;
    }

    if (stockAreaId) {
      whereClause.stock_area_id = stockAreaId;
    }

    if (partyName) {
      whereClause.party_name = { [Op.like]: `%${partyName}%` };
    }

    if (status) {
      whereClause.status = status;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      whereClause.date = {};
      if (dateFrom) {
        whereClause.date[Op.gte] = dateFrom;
      }
      if (dateTo) {
        whereClause.date[Op.lte] = dateTo;
      }
    }

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { invoice_number: { [Op.like]: `%${search}%` } },
        { party_name: { [Op.like]: `%${search}%` } },
        { slip_number: { [Op.like]: `%${search}%` } },
        { purchase_order: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: inwards } = await InwardEntry.findAndCountAll({
      where: whereClause,
      limit: limitNumber,
      offset: offset,
      order: [['date', 'DESC'], ['created_at', 'DESC']],
      include: [
        {
          model: StockArea,
          as: 'stockArea',
          attributes: ['area_id', 'area_name', 'location_code']
        }
      ],
      distinct: true,
    });

    const totalInwards = typeof count === 'number' ? count : 0;

    return res.status(200).json({
      success: true,
      data: {
        inwards,
        pagination: {
          currentPage: pageNumber,
          totalPages: limitNumber ? Math.max(Math.ceil(totalInwards / limitNumber), 1) : 1,
          totalItems: totalInwards,
          itemsPerPage: limitNumber
        }
      }
    });
  } catch (error) {
    console.error('Error fetching inward entries:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch inward entries',
      error: error.message
    });
  }
};

/**
 * Get single inward entry by ID with items
 * GET /api/inventory/inward/:id
 */
export const getInwardById = async (req, res) => {
  try {
    const { id } = req.params;

    const inward = await InwardEntry.findOne({
      where: {
        inward_id: id,
        is_active: true
      },
      include: [
        {
          model: InwardItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material'
            }
          ]
        },
        {
          model: StockArea,
          as: 'stockArea'
        }
      ]
    });

    if (!inward) {
      return res.status(404).json({
        success: false,
        message: 'Inward entry not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: inward
    });
  } catch (error) {
    console.error('Error fetching inward entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch inward entry',
      error: error.message
    });
  }
};

/**
 * Update inward entry
 * PUT /api/inventory/inward/:id
 */
export const updateInward = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const {
      date,
      invoiceNumber,
      partyName,
      purchaseOrder,
      stockAreaId,
      vehicleNumber,
      remark,
      status,
      items, // Optional: update items
      documents
    } = req.body;

    const userId = req.user?.id || req.user?.user_id;

    const inward = await InwardEntry.findOne({
      where: {
        inward_id: id,
        is_active: true
      }
    }, { transaction });

    if (!inward) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Inward entry not found'
      });
    }

    // Validate stock area if provided
    if (stockAreaId && stockAreaId !== inward.stock_area_id) {
      const stockArea = await StockArea.findOne({
        where: { area_id: stockAreaId, is_active: true }
      });

      if (!stockArea) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Invalid stock area'
        });
      }
    }

    // Update inward entry
    await inward.update({
      date: date || inward.date,
      invoice_number: invoiceNumber || inward.invoice_number,
      party_name: partyName || inward.party_name,
      purchase_order: purchaseOrder !== undefined ? purchaseOrder : inward.purchase_order,
      stock_area_id: stockAreaId || inward.stock_area_id,
      vehicle_number: vehicleNumber !== undefined ? vehicleNumber : inward.vehicle_number,
      remark: remark !== undefined ? remark : inward.remark,
      status: status || inward.status,
      documents: documents !== undefined ? documents : inward.documents,
      updated_by: userId
    }, { transaction });

    // Update items if provided
    if (items && Array.isArray(items)) {
      // Delete existing items
      await InwardItem.destroy({
        where: { inward_id: id },
        transaction
      });

      // Create new items
      for (const item of items) {
        const { materialId, quantity, price, serialNumber, macId, remarks } = item;

        const material = await Material.findOne({
          where: { material_id: materialId, is_active: true }
        });

        if (!material) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Material with ID ${materialId} not found`
          });
        }

        await InwardItem.create({
          inward_id: id,
          material_id: materialId,
          quantity: parseInt(quantity) || 1,
          price: price ? parseFloat(price) : null,
          serial_number: serialNumber || null,
          mac_id: macId || null,
          remarks: remarks || null
        }, { transaction });
      }
    }

    await transaction.commit();

    // Fetch updated inward entry
    const updatedInward = await InwardEntry.findOne({
      where: { inward_id: id },
      include: [
        {
          model: InwardItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material'
            }
          ]
        },
        {
          model: StockArea,
          as: 'stockArea'
        }
      ]
    });

    return res.status(200).json({
      success: true,
      message: 'Inward entry updated successfully',
      data: updatedInward
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating inward entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update inward entry',
      error: error.message
    });
  }
};

/**
 * Delete inward entry (soft delete)
 * DELETE /api/inventory/inward/:id
 */
export const deleteInward = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?.user_id;

    const inward = await InwardEntry.findOne({
      where: {
        inward_id: id,
        is_active: true
      }
    });

    if (!inward) {
      return res.status(404).json({
        success: false,
        message: 'Inward entry not found'
      });
    }

    await inward.update({
      is_active: false,
      updated_by: userId
    });

    return res.status(200).json({
      success: true,
      message: 'Inward entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting inward entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete inward entry',
      error: error.message
    });
  }
};

