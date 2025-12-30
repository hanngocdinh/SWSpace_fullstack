// backend/controllers/packageController.js
const PackageModel = require('../models/packageModel');

module.exports = {
  async create(req, res) {
    try {
      // chỉ lấy các field mà model cần
      const {
        serviceCode, unitCode, name, price,
        description = null,
        accessDays = null,
        bundleHours = null,      // 👈 nhận bundleHours
        discountPct = null,      // 👈 nhận discountPct
        features = null,
        status = 'active',
        badge = null,
        thumbnailUrl = null,
        maxCapacity = null,
        createdBy = null,
      } = req.body;

      const pkg = await PackageModel.create({
        serviceCode, unitCode, name, price,
        description, accessDays, bundleHours,  // 👈 truyền xuống model
        discountPct,
        features, status, badge, thumbnailUrl, maxCapacity, createdBy,
      });

      res.status(201).json(pkg);
    } catch (e) {
      console.error(e);
      res.status(e?.status || 400).json({ error: e.message });
    }
  },

  async list(req, res) {
    try {
      const data = await PackageModel.list();
      res.json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch packages' });
    }
  },

  async update(req, res) {
    try {
      const id = Number(req.params.id);
      const {
        serviceCode, unitCode, name, price,
        description = null,
        accessDays = null,
        bundleHours = null,      // 👈 nhận bundleHours khi update
        discountPct = null,      // 👈 nhận discountPct khi update
        features = null,
        status,
        badge = null,
        thumbnailUrl = null,
        maxCapacity = null,
      } = req.body;

      const pkg = await PackageModel.update(id, {
        serviceCode, unitCode, name, price,
        description, accessDays, bundleHours,  // 👈 truyền xuống model
        discountPct,
        features, status, badge, thumbnailUrl, maxCapacity,
      });

      res.json(pkg);
    } catch (e) {
      console.error(e);
      res.status(e?.status || 400).json({ error: e.message });
    }
  },

  async remove(req, res) {
    try {
      await PackageModel.remove(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      console.error(e);
      res.status(400).json({ error: e.message });
    }
  }
};
