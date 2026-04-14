const express = require('express');
const router = express.Router();
const { campaigns } = require('../lib/data');
const { paginate, notFound } = require('../lib/utils');

router.get('/v1/Brands/:BrandSid/Campaigns.json', (req, res) => {
  const list = campaigns.filter((row) => row.brand_sid === req.params.BrandSid);
  res.json(paginate(req, list, 'campaigns'));
});

router.get('/v1/Brands/:BrandSid/Campaigns/:Sid.json', (req, res) => {
  const record = campaigns.find((row) => row.sid === req.params.Sid && row.brand_sid === req.params.BrandSid);
  if (!record) {
    notFound(res, 'Campaigns', req.params.Sid);
    return;
  }
  res.json(record);
});

module.exports = router;
