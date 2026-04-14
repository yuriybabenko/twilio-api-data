const fs = require('fs');
const path = require('path');
const { dataDir } = require('../scripts/generate-data');

function parseCsv(filename) {
  const contents = fs.readFileSync(path.join(dataDir, filename), 'utf8').trim();
  if (!contents) return [];
  const [headerLine, ...lines] = contents.split('\n');
  const headers = headerLine.split(',').map((h) => h.trim());
  return lines.map((line) => {
    const values = line.split(',');
    return headers.reduce((obj, key, index) => {
      const value = values[index] || '';
      if (value.startsWith('{') || value.startsWith('[')) {
        try {
          obj[key] = JSON.parse(value);
          return obj;
        } catch {
          // leave as string
        }
      }
      obj[key] = value;
      return obj;
    }, {});
  });
}

function selectAccount(accountSid) {
  const accounts = parseCsv('account.csv');
  return accounts.find((acct) => acct.sid === accountSid) || accounts[0];
}

const account = selectAccount();
const incomingPhoneNumbers = parseCsv('incoming_phone_numbers.csv');
const shortCodes = parseCsv('short_codes.csv');
const availablePhoneNumbers = parseCsv('available_phone_numbers.csv');
const messagingServices = parseCsv('messaging_services.csv');
const brands = parseCsv('brands.csv');
const campaigns = parseCsv('campaigns.csv');
const serviceNumbers = parseCsv('service_numbers.csv');
const messages = parseCsv('messages.csv');
const calls = parseCsv('calls.csv');
const billings = parseCsv('billings.csv');
const messageStats = parseCsv('message_stats.csv');
const callStats = parseCsv('call_stats.csv');
const organizations = parseCsv('organizations.csv');
const usageRecords = parseCsv('usage_records.csv');
const exportData = parseCsv('exports.csv');
const verifyServices = parseCsv('verify_services.csv');
const verifyVerifications = parseCsv('verify_verifications.csv');
const conversations = parseCsv('conversations.csv');

module.exports = {
  account,
  incomingPhoneNumbers,
  shortCodes,
  availablePhoneNumbers,
  messagingServices,
  brands,
  campaigns,
  serviceNumbers,
  messages,
  calls,
  billings,
  messageStats,
  callStats,
  organizations,
  usageRecords,
  exportData,
  verifyServices,
  verifyVerifications,
  conversations
};
