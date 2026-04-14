const express = require('express');
const router = express.Router();
const { incomingPhoneNumbers, availablePhoneNumbers, account } = require('../lib/data');
const { accountMismatch, filterItems, paginate, notFound } = require('../lib/utils');

router.get('/2010-04-01/Accounts/:AccountSid/IncomingPhoneNumbers.json', (req, res) => {
  if (accountMismatch(res, req.params.AccountSid, account.sid)) return;
  const filters = {
    PhoneNumber: req.query.PhoneNumber,
    FriendlyName: req.query.FriendlyName,
    PhoneNumberType: req.query.PhoneNumberType
  };
  const list = filterItems(incomingPhoneNumbers, filters);
  res.json(paginate(req, list, 'incoming_phone_numbers'));
});

router.get('/2010-04-01/Accounts/:AccountSid/IncomingPhoneNumbers/:Sid.json', (req, res) => {
  if (accountMismatch(res, req.params.AccountSid, account.sid)) return;
  const record = incomingPhoneNumbers.find((row) => row.sid === req.params.Sid);
  if (!record) {
    notFound(res, 'IncomingPhoneNumbers', req.params.Sid);
    return;
  }
  res.json(record);
});

router.get('/2010-04-01/Accounts/:AccountSid/AvailablePhoneNumbers/US/Local.json', (req, res) => {
  if (accountMismatch(res, req.params.AccountSid, account.sid)) return;
  const list = filterItems(availablePhoneNumbers.filter((row) => row.phone_number.startsWith('+1')), { PhoneNumber: req.query.PhoneNumber });
  res.json(paginate(req, list, 'available_phone_numbers'));
});

router.get('/2010-04-01/Accounts/:AccountSid/AvailablePhoneNumbers/US/TollFree.json', (req, res) => {
  if (accountMismatch(res, req.params.AccountSid, account.sid)) return;
  const list = filterItems(availablePhoneNumbers.filter((row) => row.phone_number.startsWith('+18')), { PhoneNumber: req.query.PhoneNumber });
  res.json(paginate(req, list, 'available_phone_numbers'));
});

module.exports = router;
