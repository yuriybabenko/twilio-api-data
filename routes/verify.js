const express = require('express');
const router = express.Router();
const { verifyServices, verifyVerifications } = require('../lib/data');
const { paginate } = require('../lib/utils');

router.get('/v2/Services', (req, res) => {
  const result = paginate(req, verifyServices, 'services');
  res.json(result);
});

router.post('/v2/Services', (req, res) => {
  const newService = {
    sid: 'VA' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    friendly_name: req.body.friendly_name || 'New Service',
    code_length: 6,
    lookup_enabled: 'true',
    psd2_enabled: 'false',
    status: 'active',
    date_created: new Date().toISOString(),
    date_updated: new Date().toISOString()
  };
  res.json(newService);
});

router.get('/v2/Services/:ServiceSid', (req, res) => {
  const service = verifyServices.find(s => s.sid === req.params.ServiceSid);
  if (!service) return res.status(404).json({ code: 20404, message: 'Service not found' });
  res.json(service);
});

router.post('/v2/Services/:ServiceSid/Verifications', (req, res) => {
  const verification = {
    sid: 'VE' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    service_sid: req.params.ServiceSid,
    account_sid: req.body.account_sid || 'AC123',
    to: req.body.to,
    channel: req.body.channel || 'sms',
    status: 'pending',
    valid: 'false',
    date_created: new Date().toISOString(),
    date_updated: new Date().toISOString()
  };
  res.json(verification);
});

router.get('/v2/Services/:ServiceSid/Verifications', (req, res) => {
  const verifications = verifyVerifications.filter(v => v.service_sid === req.params.ServiceSid);
  const result = paginate(req, verifications, 'verifications');
  res.json(result);
});

module.exports = router;