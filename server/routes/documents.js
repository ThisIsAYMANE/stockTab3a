const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Document, Supplier, Client, User } = require('../models');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all documents
router.get('/', auth, async (req, res) => {
  try {
    const { type, status, startDate, endDate } = req.query;
    const where = {};

    if (type && type !== 'all') {
      where.type = type;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const documents = await Document.findAll({
      where,
      include: [
        { model: Supplier, attributes: ['name'], required: false },
        { model: Client, attributes: ['name'], required: false },
        { model: User, attributes: ['username'], required: false }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get document by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        { model: Supplier },
        { model: Client },
        { model: User, attributes: ['username'] }
      ]
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create document
router.post('/', [auth, authorize('admin', 'manager', 'cashier')], [
  body('type').notEmpty().withMessage('Document type is required'),
  body('number').notEmpty().withMessage('Document number is required'),
  body('workflowStep').isNumeric().withMessage('Workflow step must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const document = await Document.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json(document);
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Document number already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update document
router.put('/:id', [auth, authorize('admin', 'manager', 'cashier')], async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await document.update(req.body);
    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete document
router.delete('/:id', [auth, authorize('admin', 'manager')], async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await document.destroy();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get workflow statistics
router.get('/workflow/stats', auth, async (req, res) => {
  try {
    const stats = await Promise.all([
      Document.count({ where: { type: 'supplier_purchase_order' } }),
      Document.count({ where: { type: 'reception_slip' } }),
      Document.count({ where: { type: 'stock_entry' } }),
      Document.count({ where: { type: 'customer_sales_order' } }),
      Document.count({ where: { type: 'delivery_note' } }),
      Document.count({ where: { type: 'invoice' } })
    ]);

    res.json({
      purchaseOrders: stats[0],
      receptionSlips: stats[1],
      stockEntries: stats[2],
      salesOrders: stats[3],
      deliveryNotes: stats[4],
      invoices: stats[5]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
