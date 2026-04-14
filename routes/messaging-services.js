const express = require('express');
const router = express.Router();
const { messagingServices, serviceNumbers, incomingPhoneNumbers, shortCodes, account } = require('../lib/data');
const { accountMismatch, paginate, notFound } = require('../lib/utils');

router.get('/2010-04-01/Accounts/:AccountSid/Messaging/Services.json', (req, res) => {
  if (accountMismatch(res, req.params.AccountSid, account.sid)) return;
  res.json(paginate(req, messagingServices, 'messaging_services'));
});

router.get('/2010-04-01/Accounts/:AccountSid/Messaging/Services/:Sid.json', (req, res) => {
  if (accountMismatch(res, req.params.AccountSid, account.sid)) return;
  const record = messagingServices.find((row) => row.sid === req.params.Sid);
  if (!record) {
    notFound(res, 'Messaging/Services', req.params.Sid);
    return;
  }
  res.json(record);
});

router.get('/2010-04-01/Accounts/:AccountSid/Messaging/Services/:Sid/PhoneNumbers.json', (req, res) => {
  if (accountMismatch(res, req.params.AccountSid, account.sid)) return;
  const mapping = serviceNumbers.filter((row) => row.messaging_service_sid === req.params.Sid);
  const list = mapping.map((row) => {
    const phone = incomingPhoneNumbers.concat(shortCodes).find((pn) => pn.phone_number === row.phone_number);
    return {
      sid: row.phone_number_sid,
      account_sid: account.sid,
      messaging_service_sid: row.messaging_service_sid,
      phone_number: row.phone_number,
      uri: `/2010-04-01/Accounts/${account.sid}/IncomingPhoneNumbers/${row.phone_number_sid}.json`
    };
  });
  res.json(paginate(req, list, 'phone_numbers'));
});

module.exports = router;
