const dashboardRepo = require('../repositories/adminDashboardRepository');

function toInt(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

module.exports = {
  async overview(req, res) {
    try {
      const months = toInt(req.query.months, undefined);
      const recentLimit = toInt(req.query.activityLimit ?? req.query.limit, undefined);
      const data = await dashboardRepo.getDashboardOverview({ months, recentLimit });
      res.json({ data });
    } catch (err) {
      console.error('adminDashboardController.overview', err);
      res.status(500).json({ error: 'Failed to load dashboard insights' });
    }
  },
  async notifications(req, res) {
    try {
      const limit = toInt(req.query.limit, undefined);
      const data = await dashboardRepo.fetchNotifications({ limit });
      res.json({ data });
    } catch (err) {
      console.error('adminDashboardController.notifications', err);
      res.status(500).json({ error: 'Failed to load notifications' });
    }
  }
};
