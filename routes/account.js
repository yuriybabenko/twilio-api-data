const express = require('express');
const router = express.Router();
const { account } = require('../lib/data');
const { accountMismatch } = require('../lib/utils');

router.get('/2010-04-01/Accounts/:AccountSid.json', (req, res) => {
  if (accountMismatch(res, req.params.AccountSid, account.sid)) return;
  res.json({
    sid: account.sid,
    friendly_name: account.friendly_name,
    status: account.status,
    type: 'trial',
    date_created: account.date_created,
    date_updated: account.date_updated,
    uri: `/2010-04-01/Accounts/${account.sid}.json`,
    subresource_uris: {
      incoming_phone_numbers: `/2010-04-01/Accounts/${account.sid}/IncomingPhoneNumbers.json`,
      messages: `/2010-04-01/Accounts/${account.sid}/Messages.json`,
      calls: `/2010-04-01/Accounts/${account.sid}/Calls.json`,
      messaging_services: `/2010-04-01/Accounts/${account.sid}/Messaging/Services.json`
    }
  });
});

module.exports = router;
