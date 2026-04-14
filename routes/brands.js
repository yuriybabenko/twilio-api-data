const express = require('express');
const router = express.Router();
const { brands } = require('../lib/data');
const { paginate, notFound } = require('../lib/utils');

router.get('/v1/Brands.json', (req, res) => {
  res.json(paginate(req, brands, 'brands'));
});

router.get('/v1/Brands/:Sid.json', (req, res) => {
  const brand = brands.find(b => b.sid === req.params.Sid);
  if (!brand) {
    return notFound(res, 'Brands', req.params.Sid);
  }
  res.json(brand);
});

module.exports = router;
