const express = require('express');
const router = express.Router();

router.get('/v1/PhoneNumbers/:PhoneNumber', (req, res) => {
  const phoneNumber = req.params.PhoneNumber;
  res.json({
    phone_number: phoneNumber,
    national_format: phoneNumber,
    carrier: {
      name: 'Example Carrier',
      type: 'mobile',
      error_code: null
    },
    country_code: 'US',
    url: `/v1/PhoneNumbers/${phoneNumber}`
  });
});

module.exports = router;