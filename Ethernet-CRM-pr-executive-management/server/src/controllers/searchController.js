import { Op } from 'sequelize';
import Material from '../models/Material.js';
import StockArea from '../models/StockArea.js';
import InwardEntry from '../models/InwardEntry.js';
import MaterialRequest from '../models/MaterialRequest.js';
import StockTransfer from '../models/StockTransfer.js';
import ConsumptionRecord from '../models/ConsumptionRecord.js';

/**
 * Global search across all inventory entities
 */
export const globalSearch = async (req, res, next) => {
  try {
    const { q, type, limit = 20 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const searchTerm = q.trim();
    const results = {
      materials: [],
      stockAreas: [],
      inwardEntries: [],
      materialRequests: [],
      stockTransfers: [],
      consumptionRecords: [],
    };

    // Search materials
    if (!type || type === 'materials') {
      const materials = await Material.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { material_name: { [Op.like]: `%${searchTerm}%` } },
            { product_code: { [Op.like]: `%${searchTerm}%` } },
            { material_type: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        limit: parseInt(limit),
        attributes: ['material_id', 'material_name', 'product_code', 'material_type', 'uom'],
      });
      results.materials = materials;
    }

    // Search stock areas
    if (!type || type === 'stockAreas') {
      const stockAreas = await StockArea.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { area_name: { [Op.like]: `%${searchTerm}%` } },
            { location_code: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        limit: parseInt(limit),
        attributes: ['area_id', 'area_name', 'location_code'],
      });
      results.stockAreas = stockAreas;
    }

    // Search inward entries
    if (!type || type === 'inward') {
      const inwards = await InwardEntry.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { slip_number: { [Op.like]: `%${searchTerm}%` } },
            { invoice_number: { [Op.like]: `%${searchTerm}%` } },
            { party_name: { [Op.like]: `%${searchTerm}%` } },
            { purchase_order: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        limit: parseInt(limit),
        attributes: ['inward_id', 'slip_number', 'invoice_number', 'party_name', 'date'],
      });
      results.inwardEntries = inwards;
    }

    // Search material requests
    if (!type || type === 'materialRequest') {
      const materialRequests = await MaterialRequest.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { slip_number: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        limit: parseInt(limit),
        attributes: ['request_id', 'slip_number', 'request_date', 'status'],
      });
      results.materialRequests = materialRequests;
    }

    // Search stock transfers
    if (!type || type === 'stockTransfer') {
      const stockTransfers = await StockTransfer.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { transfer_number: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        limit: parseInt(limit),
        attributes: ['transfer_id', 'transfer_number', 'transfer_date', 'status'],
      });
      results.stockTransfers = stockTransfers;
    }

    // Search consumption records
    if (!type || type === 'consumption') {
      const consumptions = await ConsumptionRecord.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { external_system_ref_id: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        limit: parseInt(limit),
        attributes: ['consumption_id', 'external_system_ref_id', 'consumption_date'],
      });
      results.consumptionRecords = consumptions;
    }

    // Calculate totals
    const totalResults = 
      results.materials.length +
      results.stockAreas.length +
      results.inwardEntries.length +
      results.materialRequests.length +
      results.stockTransfers.length +
      results.consumptionRecords.length;

    res.status(200).json({
      success: true,
      data: {
        query: searchTerm,
        results,
        summary: {
          total: totalResults,
          materials: results.materials.length,
          stockAreas: results.stockAreas.length,
          inwardEntries: results.inwardEntries.length,
          materialRequests: results.materialRequests.length,
          stockTransfers: results.stockTransfers.length,
          consumptionRecords: results.consumptionRecords.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

