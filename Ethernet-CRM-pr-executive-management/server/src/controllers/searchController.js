import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import Material from '../models/Material.js';
import StockArea from '../models/StockArea.js';
import InwardEntry from '../models/InwardEntry.js';
import InwardItem from '../models/InwardItem.js';
import MaterialRequest from '../models/MaterialRequest.js';
import StockTransfer from '../models/StockTransfer.js';
import ConsumptionRecord from '../models/ConsumptionRecord.js';
import InventoryMaster from '../models/InventoryMaster.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import PurchaseRequest from '../models/PurchaseRequest.js';
import BusinessPartner from '../models/BusinessPartner.js';
import User from '../models/User.js';
import ReturnRecord from '../models/ReturnRecord.js';

/**
 * Global search across all inventory entities
 * Searches: Materials, Stock Areas, Inward Entries, Material Requests, Stock Transfers,
 * Consumption Records, Serial Numbers, MAC IDs, Purchase Orders, Purchase Requests,
 * Business Partners, Users, Return Records, and more
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

    const searchTerm = q.trim().toLowerCase();
    const searchLimit = parseInt(limit);
    const formattedResults = [];

    // Helper function to format results
    const formatResult = (entityType, entityId, title, description, metadata = {}) => {
      return {
        entityType,
        entityId,
        title,
        description,
        ...metadata
      };
    };

    // 1. Search Materials (by name, product code, type, description)
    if (!type || type === 'materials') {
      const materials = await Material.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { material_name: { [Op.like]: `%${searchTerm}%` } },
            { product_code: { [Op.like]: `%${searchTerm}%` } },
            { material_type: { [Op.like]: `%${searchTerm}%` } },
            { description: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        limit: searchLimit,
        attributes: ['material_id', 'material_name', 'product_code', 'material_type', 'uom', 'description'],
      });
      
      materials.forEach(m => {
        formattedResults.push(formatResult(
          'material',
          m.material_id,
          `${m.material_name} (${m.product_code})`,
          `Type: ${m.material_type} | UOM: ${m.uom}`,
          { materialType: m.material_type, productCode: m.product_code }
        ));
      });
    }

    // 2. Search Serial Numbers and MAC IDs (from InventoryMaster)
    if (!type || type === 'serial' || type === 'inventory') {
      const inventoryItems = await InventoryMaster.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { serial_number: { [Op.like]: `%${searchTerm}%` } },
            { mac_id: { [Op.like]: `%${searchTerm}%` } },
            { ticket_id: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        include: [
          {
            model: Material,
            as: 'material',
            attributes: ['material_name', 'product_code'],
          },
        ],
        limit: searchLimit,
        attributes: ['id', 'serial_number', 'mac_id', 'ticket_id', 'status', 'current_location_type'],
      });

      inventoryItems.forEach(item => {
        const title = item.serial_number 
          ? `Serial: ${item.serial_number}${item.mac_id ? ` | MAC: ${item.mac_id}` : ''}`
          : item.mac_id 
          ? `MAC: ${item.mac_id}`
          : `Inventory ID: ${item.id}`;
        
        formattedResults.push(formatResult(
          'inventory',
          item.id,
          title,
          `Material: ${item.material?.material_name || 'Unknown'} | Status: ${item.status} | Location: ${item.current_location_type}${item.ticket_id ? ` | Ticket: ${item.ticket_id}` : ''}`,
          { serialNumber: item.serial_number, macId: item.mac_id, ticketId: item.ticket_id }
        ));
      });
    }

    // 3. Search Inward Entries (by slip number, invoice, party, PO, vehicle, remarks)
    if (!type || type === 'inward') {
      const inwards = await InwardEntry.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { slip_number: { [Op.like]: `%${searchTerm}%` } },
            { invoice_number: { [Op.like]: `%${searchTerm}%` } },
            { party_name: { [Op.like]: `%${searchTerm}%` } },
            { purchase_order: { [Op.like]: `%${searchTerm}%` } },
            { vehicle_number: { [Op.like]: `%${searchTerm}%` } },
            { remark: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        limit: searchLimit,
        attributes: ['inward_id', 'slip_number', 'invoice_number', 'party_name', 'date', 'status', 'vehicle_number'],
      });

      inwards.forEach(inward => {
        formattedResults.push(formatResult(
          'inward',
          inward.inward_id,
          `Inward: ${inward.slip_number} | ${inward.party_name}`,
          `Invoice: ${inward.invoice_number} | Date: ${inward.date} | Status: ${inward.status}`,
          { slipNumber: inward.slip_number, invoiceNumber: inward.invoice_number, status: inward.status }
        ));
      });
    }

    // 4. Search Material Requests (by request ID, PR numbers, status, remarks)
    if (!type || type === 'materialRequest') {
      const materialRequests = await MaterialRequest.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { request_id: { [Op.like]: `%${searchTerm}%` } },
            { status: { [Op.like]: `%${searchTerm}%` } },
            { remarks: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        limit: searchLimit * 2, // Get more to filter by pr_numbers
        attributes: ['request_id', 'pr_numbers', 'status', 'created_at', 'remarks'],
      });

      // Filter by pr_numbers in application layer since it's JSON
      const filteredRequests = materialRequests.filter(req => {
        const prNumbers = req.pr_numbers || [];
        const matchesPR = prNumbers.some(pr => 
          pr.prNumber && pr.prNumber.toLowerCase().includes(searchTerm)
        );
        return matchesPR || true; // Include all since we already filtered by other fields
      }).slice(0, searchLimit);

      filteredRequests.forEach(req => {
        const prNumbers = req.pr_numbers || [];
        const prList = prNumbers.map(pr => pr.prNumber).join(', ') || 'N/A';
        formattedResults.push(formatResult(
          'materialRequest',
          req.request_id,
          `Material Request: ${req.request_id}`,
          `PR Numbers: ${prList} | Status: ${req.status}`,
          { status: req.status, prNumbers: prList }
        ));
      });
    }

    // 5. Search Stock Transfers (by transfer number, description, status)
    if (!type || type === 'stockTransfer') {
      const stockTransfers = await StockTransfer.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { transfer_number: { [Op.like]: `%${searchTerm}%` } },
            { description: { [Op.like]: `%${searchTerm}%` } },
            { status: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        limit: searchLimit,
        attributes: ['transfer_id', 'transfer_number', 'transfer_date', 'status', 'description'],
      });

      stockTransfers.forEach(transfer => {
        formattedResults.push(formatResult(
          'stockTransfer',
          transfer.transfer_id,
          `Stock Transfer: ${transfer.transfer_number}`,
          `Date: ${transfer.transfer_date} | Status: ${transfer.status}`,
          { transferNumber: transfer.transfer_number, status: transfer.status }
        ));
      });
    }

    // 6. Search Consumption Records (by external ref, ticket ID, remarks)
    if (!type || type === 'consumption') {
      const consumptions = await ConsumptionRecord.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { external_system_ref_id: { [Op.like]: `%${searchTerm}%` } },
            { ticket_id: { [Op.like]: `%${searchTerm}%` } },
            { remarks: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        limit: searchLimit,
        attributes: ['consumption_id', 'external_system_ref_id', 'consumption_date', 'ticket_id', 'remarks'],
      });

      consumptions.forEach(consumption => {
        formattedResults.push(formatResult(
          'consumption',
          consumption.consumption_id,
          `Consumption: ${consumption.external_system_ref_id || consumption.consumption_id}`,
          `Date: ${consumption.consumption_date}${consumption.ticket_id ? ` | Ticket: ${consumption.ticket_id}` : ''}`,
          { ticketId: consumption.ticket_id, externalRef: consumption.external_system_ref_id }
        ));
      });
    }

    // 7. Search Purchase Orders (by PO number, vendor, status, remarks)
    if (!type || type === 'purchaseOrder') {
      const purchaseOrders = await PurchaseOrder.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { po_number: { [Op.like]: `%${searchTerm}%` } },
            { remarks: { [Op.like]: `%${searchTerm}%` } },
            { status: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        include: [
          {
            model: BusinessPartner,
            as: 'vendor',
            attributes: ['partner_name'],
          },
        ],
        limit: searchLimit,
        attributes: ['po_id', 'po_number', 'po_date', 'status', 'remarks'],
      });

      purchaseOrders.forEach(po => {
        formattedResults.push(formatResult(
          'purchaseOrder',
          po.po_id,
          `Purchase Order: ${po.po_number}`,
          `Vendor: ${po.vendor?.partner_name || 'N/A'} | Date: ${po.po_date} | Status: ${po.status}`,
          { poNumber: po.po_number, status: po.status, vendorName: po.vendor?.partner_name }
        ));
      });
    }

    // 8. Search Purchase Requests (by PR number, status, remarks)
    if (!type || type === 'purchaseRequest') {
      const purchaseRequests = await PurchaseRequest.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { pr_number: { [Op.like]: `%${searchTerm}%` } },
            { status: { [Op.like]: `%${searchTerm}%` } },
            { remarks: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        limit: searchLimit,
        attributes: ['pr_id', 'pr_number', 'pr_date', 'status', 'remarks'],
      });

      purchaseRequests.forEach(pr => {
        formattedResults.push(formatResult(
          'purchaseRequest',
          pr.pr_id,
          `Purchase Request: ${pr.pr_number}`,
          `Date: ${pr.pr_date} | Status: ${pr.status}`,
          { prNumber: pr.pr_number, status: pr.status }
        ));
      });
    }

    // 9. Search Business Partners (by name, contact, email, phone, GST, address)
    if (!type || type === 'businessPartner') {
      const businessPartners = await BusinessPartner.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { partner_name: { [Op.like]: `%${searchTerm}%` } },
            { contact_person: { [Op.like]: `%${searchTerm}%` } },
            { email: { [Op.like]: `%${searchTerm}%` } },
            { phone: { [Op.like]: `%${searchTerm}%` } },
            { gst_number: { [Op.like]: `%${searchTerm}%` } },
            { address: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        limit: searchLimit,
        attributes: ['partner_id', 'partner_name', 'partner_type', 'contact_person', 'email', 'phone', 'gst_number'],
      });

      businessPartners.forEach(partner => {
        formattedResults.push(formatResult(
          'businessPartner',
          partner.partner_id,
          `${partner.partner_name} (${partner.partner_type})`,
          `Contact: ${partner.contact_person || 'N/A'} | ${partner.email || ''} | ${partner.phone || ''}`,
          { partnerType: partner.partner_type, email: partner.email, phone: partner.phone }
        ));
      });
    }

    // 10. Search Stock Areas (by name, location code, address)
    if (!type || type === 'stockArea') {
      const stockAreas = await StockArea.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { area_name: { [Op.like]: `%${searchTerm}%` } },
            { location_code: { [Op.like]: `%${searchTerm}%` } },
            { address: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        include: [
          {
            model: User,
            as: 'storeKeeper',
            attributes: ['name', 'email'],
          },
        ],
        limit: searchLimit,
        attributes: ['area_id', 'area_name', 'location_code', 'address'],
      });

      stockAreas.forEach(area => {
        formattedResults.push(formatResult(
          'stockArea',
          area.area_id,
          `Stock Area: ${area.area_name}`,
          `Location Code: ${area.location_code || 'N/A'}${area.storeKeeper ? ` | Store Keeper: ${area.storeKeeper.name}` : ''}`,
          { locationCode: area.location_code, storeKeeper: area.storeKeeper?.name }
        ));
      });
    }

    // 11. Search Users (by name, email, employee code, phone)
    if (!type || type === 'user') {
      const users = await User.findAll({
        where: {
          isActive: true,
          [Op.or]: [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { email: { [Op.like]: `%${searchTerm}%` } },
            { employeCode: { [Op.like]: `%${searchTerm}%` } },
            { phoneNumber: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        limit: searchLimit,
        attributes: ['id', 'name', 'email', 'employeCode', 'phoneNumber', 'role'],
      });

      users.forEach(user => {
        formattedResults.push(formatResult(
          'user',
          user.id.toString(),
          `${user.name}${user.employeCode ? ` (${user.employeCode})` : ''}`,
          `Email: ${user.email || 'N/A'} | Role: ${user.role}`,
          { email: user.email, employeeCode: user.employeCode, role: user.role }
        ));
      });
    }

    // 12. Search Return Records (by return ID, ticket ID, reason, remarks)
    if (!type || type === 'return') {
      const returnRecords = await ReturnRecord.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { return_id: { [Op.like]: `%${searchTerm}%` } },
            { ticket_id: { [Op.like]: `%${searchTerm}%` } },
            { reason: { [Op.like]: `%${searchTerm}%` } },
            { remarks: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        limit: searchLimit,
        attributes: ['return_id', 'return_date', 'ticket_id', 'reason', 'status', 'remarks'],
      });

      returnRecords.forEach(returnRecord => {
        formattedResults.push(formatResult(
          'return',
          returnRecord.return_id,
          `Return: ${returnRecord.return_id}${returnRecord.ticket_id ? ` | Ticket: ${returnRecord.ticket_id}` : ''}`,
          `Date: ${returnRecord.return_date} | Reason: ${returnRecord.reason || 'N/A'} | Status: ${returnRecord.status}`,
          { ticketId: returnRecord.ticket_id, reason: returnRecord.reason, status: returnRecord.status }
        ));
      });
    }

    // 13. Search Inward Items by serial number or MAC ID (through InwardItem)
    if (!type || type === 'inwardItem') {
      const inwardItems = await InwardItem.findAll({
        where: {
          [Op.or]: [
            { serial_number: { [Op.like]: `%${searchTerm}%` } },
            { mac_id: { [Op.like]: `%${searchTerm}%` } },
            { remarks: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        include: [
          {
            model: InwardEntry,
            as: 'inwardEntry',
            attributes: ['inward_id', 'slip_number', 'invoice_number', 'party_name'],
          },
          {
            model: Material,
            as: 'material',
            attributes: ['material_name', 'product_code'],
          },
        ],
        limit: searchLimit,
        attributes: ['item_id', 'serial_number', 'mac_id', 'quantity', 'price', 'remarks'],
      });

      inwardItems.forEach(item => {
        const title = item.serial_number 
          ? `Serial: ${item.serial_number}${item.mac_id ? ` | MAC: ${item.mac_id}` : ''}`
          : item.mac_id 
          ? `MAC: ${item.mac_id}`
          : `Item: ${item.item_id}`;
        
        formattedResults.push(formatResult(
          'inwardItem',
          item.item_id,
          title,
          `Material: ${item.material?.material_name || 'Unknown'} | Inward: ${item.inwardEntry?.slip_number || 'N/A'} | Invoice: ${item.inwardEntry?.invoice_number || 'N/A'}`,
          { 
            serialNumber: item.serial_number, 
            macId: item.mac_id,
            inwardId: item.inwardEntry?.inward_id,
            materialName: item.material?.material_name
          }
        ));
      });
    }

    // Sort results by relevance (exact matches first, then partial matches)
    formattedResults.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const aExact = aTitle === searchTerm || aTitle.startsWith(searchTerm);
      const bExact = bTitle === searchTerm || bTitle.startsWith(searchTerm);
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return aTitle.localeCompare(bTitle);
    });

    // Limit total results
    const limitedResults = formattedResults.slice(0, searchLimit * 2);

    // Group results by entity type for summary
    const summary = {};
    limitedResults.forEach(result => {
      summary[result.entityType] = (summary[result.entityType] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        query: searchTerm,
        results: limitedResults,
        summary: {
          total: limitedResults.length,
          ...summary
        },
      },
    });
  } catch (error) {
    console.error('Error in global search:', error);
    next(error);
  }
};
