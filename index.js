const express = require('express');
const path = require('path');
const fs = require('fs');
const { ensureDataFiles } = require('./scripts/generate-data');
const { account } = require('./lib/data');

ensureDataFiles();

const accountRoutes = require('./routes/account');
const phoneNumberRoutes = require('./routes/phone-numbers');
const messageRoutes = require('./routes/messages');
const callRoutes = require('./routes/calls');
const messagingServiceRoutes = require('./routes/messaging-services');
const brandRoutes = require('./routes/brands');
const campaignRoutes = require('./routes/campaigns');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

// Register route modules
app.use(accountRoutes);
app.use(phoneNumberRoutes);
app.use(messageRoutes);
app.use(callRoutes);
app.use(messagingServiceRoutes);
app.use(brandRoutes);
app.use(campaignRoutes);

app.get('/collection.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'postman', 'twilio-dummy-api.postman_collection.json'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', account_sid: account.sid });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Twilio dummy API server is running at http://localhost:${port}`);
  console.log(`Dummy account SID: ${account.sid}`);
});
