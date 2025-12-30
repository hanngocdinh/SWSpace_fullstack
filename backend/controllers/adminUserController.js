const adminUserRepo = require('../repositories/adminUserRepository');

function handleError(res, err) {
  const statusMap = {
    VALIDATION_ERROR: 400,
    EMAIL_EXISTS: 409,
    NOT_FOUND: 404,
    RELATION_CONSTRAINT: 409
  };
  const status = statusMap[err.code] || 500;
  const message = err.code === 'RELATION_CONSTRAINT'
    ? err.message
    : err.message || 'Unexpected error';
  return res.status(status).json({ error: message, code: err.code || 'SERVER_ERROR' });
}

module.exports = {
  async list(req, res) {
    try {
      const { role = 'admin', status = 'all', q, search, page = 1, pageSize = 10 } = req.query;
      const query = {
        role,
        status,
        search: q ?? search ?? '',
        page: Number(page),
        pageSize: Number(pageSize)
      };
      const result = await adminUserRepo.listUsers(query);
      res.json({ data: result.items, summary: result.summary, meta: result.meta });
    } catch (err) {
      console.error('adminUserController.list', err);
      handleError(res, err);
    }
  },

  async detail(req, res) {
    try {
      const user = await adminUserRepo.getUserById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ data: user });
    } catch (err) {
      console.error('adminUserController.detail', err);
      handleError(res, err);
    }
  },

  async create(req, res) {
    try {
      const { fullName, email, phone, password, role = 'user' } = req.body;
      const user = await adminUserRepo.createUser({ fullName, email, phone, password, role });
      res.status(201).json({ data: user });
    } catch (err) {
      console.error('adminUserController.create', err);
      handleError(res, err);
    }
  },

  async update(req, res) {
    try {
      const { fullName, phone, email, role, password, status } = req.body;
      const user = await adminUserRepo.updateUser(req.params.id, { fullName, phone, email, role, password, status });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ data: user });
    } catch (err) {
      console.error('adminUserController.update', err);
      handleError(res, err);
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const user = await adminUserRepo.updateStatus(req.params.id, status);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ data: user });
    } catch (err) {
      console.error('adminUserController.updateStatus', err);
      handleError(res, err);
    }
  },

  async destroy(req, res) {
    try {
      await adminUserRepo.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error('adminUserController.destroy', err);
      handleError(res, err);
    }
  },

  async recentBookings(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, pageSize = 5 } = req.query;
      const bookings = await adminUserRepo.getRecentBookings(id, { page, pageSize });
      res.json({ data: bookings.items, meta: bookings.meta });
    } catch (err) {
      console.error('adminUserController.recentBookings', err);
      handleError(res, err);
    }
  }
};
