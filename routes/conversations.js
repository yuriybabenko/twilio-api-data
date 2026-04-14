const express = require('express');
const router = express.Router();
const { conversations } = require('../lib/data');
const { paginate } = require('../lib/utils');

router.get('/v1/Conversations', (req, res) => {
  const result = paginate(req, conversations, 'conversations');
  res.json(result);
});

router.post('/v1/Conversations', (req, res) => {
  const newConv = {
    sid: 'CH' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    account_sid: req.body.account_sid || 'AC123',
    friendly_name: req.body.friendly_name || 'New Conversation',
    state: 'active',
    date_created: new Date().toISOString(),
    date_updated: new Date().toISOString()
  };
  res.json(newConv);
});

router.get('/v1/Conversations/:ConversationSid', (req, res) => {
  const conv = conversations.find(c => c.sid === req.params.ConversationSid);
  if (!conv) return res.status(404).json({ code: 20404, message: 'Conversation not found' });
  res.json(conv);
});

module.exports = router;