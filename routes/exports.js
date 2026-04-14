const express = require('express');
const router = express.Router();
const { exportData } = require('../lib/data');
const { paginate } = require('../lib/utils');

router.post('/v1/Exports', (req, res) => {
  const newExport = {
    sid: 'EX' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    status: 'processing',
    resource_type: req.body.resource_type,
    start_day: req.body.start_day,
    end_day: req.body.end_day,
    date_created: new Date().toISOString(),
    date_updated: new Date().toISOString()
  };
  res.json(newExport);
});

router.get('/v1/Exports/:ExportSid', (req, res) => {
  const exp = exportData.find(e => e.sid === req.params.ExportSid);
  if (!exp) return res.status(404).json({ code: 20404, message: 'Export not found' });
  res.json(exp);
});

router.get('/v1/Exports', (req, res) => {
  const result = paginate(req, exportData, 'exports');
  res.json(result);
});

module.exports = router;