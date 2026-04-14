const express = require('express');
const router = express.Router();
const { messages, messageStats, account } = require('../lib/data');
const { accountMismatch, filterItems, paginate, notFound } = require('../lib/utils');

router.get('/2010-04-01/Accounts/:AccountSid/Messages.json', (req, res) => {
  if (accountMismatch(res, req.params.AccountSid, account.sid)) return;
  const filters = { From: req.query.From, To: req.query.To, Status: req.query.Status };
  const list = filterItems(messages, filters);
  res.json(paginate(req, list, 'messages'));
});

router.get('/2010-04-01/Accounts/:AccountSid/Messages/Stats.json', (req, res) => {
  if (accountMismatch(res, req.params.AccountSid, account.sid)) return;
  let list = messageStats;
  if (req.query.StartDate) {
    list = list.filter((row) => row.date >= req.query.StartDate);
  }
  if (req.query.EndDate) {
    list = list.filter((row) => row.date <= req.query.EndDate);
  }
  res.json(paginate(req, list, 'usage'));
});

router.get('/2010-04-01/Accounts/:AccountSid/Messages/:Sid.json', (req, res) => {
  if (accountMismatch(res, req.params.AccountSid, account.sid)) return;
  const record = messages.find((row) => row.sid === req.params.Sid);
  if (!record) {
    notFound(res, 'Messages', req.params.Sid);
    return;
  }
  res.json(record);
});

module.exports = router;
