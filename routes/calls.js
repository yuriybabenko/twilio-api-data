const express = require('express');
const router = express.Router();
const { calls, callStats, account } = require('../lib/data');
const { accountMismatch, filterItems, paginate, notFound } = require('../lib/utils');

router.get('/2010-04-01/Accounts/:AccountSid/Calls.json', (req, res) => {
  if (accountMismatch(res, req.params.AccountSid, account.sid)) return;
  const filters = { From: req.query.From, To: req.query.To, Status: req.query.Status };
  const list = filterItems(calls, filters);
  res.json(paginate(req, list, 'calls'));
});

router.get('/2010-04-01/Accounts/:AccountSid/Calls/Stats.json', (req, res) => {
  if (accountMismatch(res, req.params.AccountSid, account.sid)) return;
  let list = callStats;
  if (req.query.StartDate) {
    list = list.filter((row) => row.date >= req.query.StartDate);
  }
  if (req.query.EndDate) {
    list = list.filter((row) => row.date <= req.query.EndDate);
  }
  res.json(paginate(req, list, 'usage'));
});

router.get('/2010-04-01/Accounts/:AccountSid/Calls/:Sid.json', (req, res) => {
  if (accountMismatch(res, req.params.AccountSid, account.sid)) return;
  const record = calls.find((row) => row.sid === req.params.Sid);
  if (!record) {
    notFound(res, 'Calls', req.params.Sid);
    return;
  }
  res.json(record);
});

module.exports = router;
