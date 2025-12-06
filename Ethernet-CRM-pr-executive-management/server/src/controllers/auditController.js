import { Op } from 'sequelize';
import InwardEntry from '../models/InwardEntry.js';
import MaterialRequest from '../models/MaterialRequest.js';
import StockTransfer from '../models/StockTransfer.js';
import ConsumptionRecord from '../models/ConsumptionRecord.js';
import User from '../models/User.js';

/**
 * Get audit logs/history
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const { entityType, entityId, userId, startDate, endDate, page = 1, limit = 50 } = req.query;

    const offset = (page - 1) * limit;
    const logs = [];

    // Build date filter
    const dateFilter = startDate && endDate ? {
      [Op.between]: [new Date(startDate), new Date(endDate)],
    } : {};

    // Get inward entry history
    if (!entityType || entityType === 'inward') {
      const whereClause = {
        is_active: true,
        ...(entityId && { inward_id: entityId }),
        ...(userId && { created_by: userId }),
        ...(dateFilter && { created_at: dateFilter }),
      };

      const inwards = await InwardEntry.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: User,
            as: 'updater',
            attributes: ['id', 'name', 'email'],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
      });

      logs.push(...inwards.map(item => ({
        entityType: 'INWARD',
        entityId: item.inward_id,
        action: 'CREATE',
        userId: item.created_by,
        userName: item.creator?.name || 'Unknown',
        timestamp: item.created_at,
        details: {
          slipNumber: item.slip_number,
          invoiceNumber: item.invoice_number,
          partyName: item.party_name,
        },
      })));
    }

    // Get material request history
    if (!entityType || entityType === 'materialRequest') {
      const whereClause = {
        is_active: true,
        ...(entityId && { request_id: entityId }),
        ...(userId && { requested_by: userId }),
        ...(dateFilter && { created_at: dateFilter }),
      };

      const requests = await MaterialRequest.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'requester',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'name', 'email'],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
      });

      logs.push(...requests.map(item => ({
        entityType: 'MATERIAL_REQUEST',
        entityId: item.request_id,
        action: item.status === 'APPROVED' ? 'APPROVE' : 'CREATE',
        userId: item.approved_by || item.requested_by,
        userName: item.approver?.name || item.requester?.name || 'Unknown',
        timestamp: item.approved_at || item.created_at,
        details: {
          slipNumber: item.slip_number,
          status: item.status,
        },
      })));
    }

    // Get stock transfer history
    if (!entityType || entityType === 'stockTransfer') {
      const whereClause = {
        is_active: true,
        ...(entityId && { transfer_id: entityId }),
        ...(userId && { created_by: userId }),
        ...(dateFilter && { created_at: dateFilter }),
      };

      const transfers = await StockTransfer.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email'],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
      });

      logs.push(...transfers.map(item => ({
        entityType: 'STOCK_TRANSFER',
        entityId: item.transfer_id,
        action: 'CREATE',
        userId: item.created_by,
        userName: item.creator?.name || 'Unknown',
        timestamp: item.created_at,
        details: {
          transferNumber: item.transfer_number,
          status: item.status,
        },
      })));
    }

    // Sort by timestamp
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      data: {
        logs: logs.slice(0, parseInt(limit)),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalItems: logs.length,
          totalPages: Math.ceil(logs.length / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get history for specific entity
 */
export const getEntityHistory = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;

    const history = [];

    if (entityType === 'inward') {
      const inward = await InwardEntry.findByPk(entityId, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: User,
            as: 'updater',
            attributes: ['id', 'name', 'email'],
          },
        ],
      });

      if (inward) {
        history.push({
          action: 'CREATED',
          userId: inward.created_by,
          userName: inward.creator?.name || 'Unknown',
          timestamp: inward.created_at,
          details: 'Inward entry created',
        });

        if (inward.updated_at !== inward.created_at) {
          history.push({
            action: 'UPDATED',
            userId: inward.updated_by,
            userName: inward.updater?.name || 'Unknown',
            timestamp: inward.updated_at,
            details: 'Inward entry updated',
          });
        }
      }
    }

    // Similar for other entity types...

    res.status(200).json({
      success: true,
      data: {
        entityType,
        entityId,
        history,
      },
    });
  } catch (error) {
    next(error);
  }
};


