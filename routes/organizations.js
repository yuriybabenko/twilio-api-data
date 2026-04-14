const express = require('express');
const router = express.Router();
const { organizations } = require('../lib/data');
const { paginate } = require('../lib/utils');

router.get('/v1/Organizations.json', (req, res) => {
  const result = paginate(req, organizations, 'organizations');
  res.json(result);
});

router.post('/v1/Organizations', (req, res) => {
  const newOrg = {
    sid: 'OR' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    friendly_name: req.body.friendly_name || 'New Organization',
    status: 'active',
    date_created: new Date().toISOString(),
    date_updated: new Date().toISOString()
  };
  res.json(newOrg);
});

router.get('/v1/Organizations/:OrganizationSid.json', (req, res) => {
  const org = organizations.find(o => o.sid === req.params.OrganizationSid);
  if (!org) return res.status(404).json({ code: 20404, message: 'Organization not found' });
  res.json(org);
});

module.exports = router;