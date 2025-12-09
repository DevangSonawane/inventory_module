import { Op } from 'sequelize';
import Material from '../models/Material.js';
import InwardEntry from '../models/InwardEntry.js';
import InwardItem from '../models/InwardItem.js';
import StockArea from '../models/StockArea.js';
import MaterialRequest from '../models/MaterialRequest.js';
import StockTransfer from '../models/StockTransfer.js';
import ConsumptionRecord from '../models/ConsumptionRecord.js';

/**
 * Export materials to CSV
 */
export const exportMaterials = async (req, res, next) => {
  try {
    const { format = 'csv' } = req.query;

    const materials = await Material.findAll({
      where: { is_active: true },
      order: [['material_name', 'ASC']],
    });

    if (format === 'csv') {
      // CSV format
      const headers = ['Material ID', 'Material Name', 'Product Code', 'Material Type', 'UOM', 'Description'];
      const rows = materials.map(m => [
        m.material_id,
        m.material_name,
        m.product_code,
        m.material_type,
        m.uom || '',
        m.description || '',
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=materials.csv');
      res.send(csv);
    } else {
      // JSON format
      res.status(200).json({
        success: true,
        data: materials,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Export inward entries
 */
export const exportInward = async (req, res, next) => {
  try {
    const { format = 'csv', startDate, endDate } = req.query;

    const whereClause = {
      is_active: true,
      ...(startDate && endDate && {
        date: {
          [Op.between]: [startDate, endDate],
        },
      }),
    };

    const inwards = await InwardEntry.findAll({
      where: whereClause,
      include: [
        {
          model: StockArea,
          as: 'stockArea',
          attributes: ['area_name'],
        },
        {
          model: InwardItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material',
              attributes: ['material_name', 'product_code'],
            },
          ],
        },
      ],
      order: [['date', 'DESC']],
    });

    if (format === 'csv') {
      const headers = ['Slip Number', 'Date', 'Invoice Number', 'Party Name', 'Stock Area', 'Items Count', 'Status'];
      const rows = inwards.map(i => [
        i.slip_number,
        i.date,
        i.invoice_number,
        i.party_name,
        i.stockArea?.area_name || '',
        i.items?.length || 0,
        i.status,
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=inward_entries.csv');
      res.send(csv);
    } else {
      res.status(200).json({
        success: true,
        data: inwards,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Export stock levels
 */
export const exportStockLevels = async (req, res, next) => {
  try {
    const { format = 'csv' } = req.query;

    // Use the stock levels query from stockLevelController
    // For simplicity, return JSON - can be enhanced to use actual stock calculation
    const materials = await Material.findAll({
      where: { is_active: true },
      include: [
        {
          model: InwardItem,
          as: 'inwardItems',
          attributes: [],
        },
      ],
      order: [['material_name', 'ASC']],
    });

    if (format === 'csv') {
      const headers = ['Material Name', 'Product Code', 'Material Type', 'UOM'];
      const rows = materials.map(m => [
        m.material_name,
        m.product_code,
        m.material_type,
        m.uom || '',
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=stock_levels.csv');
      res.send(csv);
    } else {
      res.status(200).json({
        success: true,
        data: materials,
      });
    }
  } catch (error) {
    next(error);
  }
};











