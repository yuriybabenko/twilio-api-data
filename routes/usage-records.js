const express = require('express');
const router = express.Router();
const { usageRecords, account } = require('../lib/data');
const { paginate, accountMismatch } = require('../lib/utils');

function filterRecords(records, query) {
  let filtered = records;
  if (query.Category) {
    filtered = filtered.filter(r => r.category === query.Category);
  }
  if (query.StartDate) {
    filtered = filtered.filter(r => r.start_date >= query.StartDate);
  }
  if (query.EndDate) {
    filtered = filtered.filter(r => r.end_date <= query.EndDate);
  }
  // IncludeSubaccounts not implemented, as no subaccounts in mock
  return filtered;
}

router.get('/2010-04-01/Accounts/:AccountSid/Usage/Records', (req, res) => {
  if (accountMismatch(res, req.params.AccountSid, account.sid)) return;
  let records = usageRecords;
  records = filterRecords(records, req.query);
  const result = paginate(req, records, 'usage_records');
  res.json(result);
});

router.get('/2010-04-01/Accounts/:AccountSid/Usage/Records/:Category', (req, res) => {
  if (accountMismatch(res, req.params.AccountSid, account.sid)) return;
  let records = usageRecords;
  if (req.params.Category) {
    if (['calls', 'sms', 'mms', 'totalprice'].includes(req.params.Category)) {
      records = records.filter(r => r.category === req.params.Category);
    } else {
      // For Today, Yesterday, etc.
      const now = new Date();
      let start, end;
      switch (req.params.Category) {
        case 'Today':
          start = end = now.toISOString().split('T')[0];
          break;
        case 'Yesterday':
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          start = end = yesterday.toISOString().split('T')[0];
          break;
        case 'ThisMonth':
          start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
          break;
        case 'LastMonth':
          start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
          end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
          break;
        case 'ThisYear':
          start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
          end = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
          break;
        case 'LastYear':
          start = new Date(now.getFullYear() - 1, 0, 1).toISOString().split('T')[0];
          end = new Date(now.getFullYear() - 1, 11, 31).toISOString().split('T')[0];
          break;
        default:
          records = [];
      }
      if (start && end) {
        records = records.filter(r => r.start_date <= end && r.end_date >= start);
      }
    }
  }
  records = filterRecords(records, req.query);
  const result = paginate(req, records, 'usage_records');
  res.json(result);
});

module.exports = router;