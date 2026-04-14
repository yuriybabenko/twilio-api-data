const express = require('express');
const router = express.Router();
const { brands } = require('../lib/data');
const { paginate } = require('../lib/utils');

router.get('/v1/Brands.json', (req, res) => {
  res.json(paginate(req, brands, 'brands'));
});

module.exports = router;
