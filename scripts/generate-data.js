const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dataDir = path.join(__dirname, '..', 'data');
const accountSid = `AC${crypto.randomBytes(16).toString('hex')}`;
const authToken = crypto.randomBytes(16).toString('hex');
const dateNow = new Date();
const threeYearsAgo = new Date(dateNow.getTime() - 3 * 365 * 24 * 60 * 60 * 1000);

const phoneNumberPrefixes = {
  tollFree: ['800', '888', '877', '866', '855', '844', '833', '822'],
  localAreas: ['212', '213', '312', '415', '503', '305', '617', '702', '314', '404', '512', '646', '206', '614', '917']
};

function quoteCsv(value) {
  if (value == null) {
    return '';
  }
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function csvLine(values) {
  return values.map(quoteCsv).join(',');
}

function formatIso(date) {
  return new Date(date).toISOString();
}

function randomDateBetween(start, end) {
  return new Date(start.getTime() + Math.floor(Math.random() * (end.getTime() - start.getTime())));
}

function randomElement(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomChoice(list, count) {
  const copy = [...list];
  const chosen = [];
  while (chosen.length < count && copy.length) {
    const idx = Math.floor(Math.random() * copy.length);
    chosen.push(copy.splice(idx, 1)[0]);
  }
  return chosen;
}

function makeSid(prefix) {
  return `${prefix}${crypto.randomBytes(8).toString('hex')}`;
}

function makePhoneNumber(areaCode, lineIndex) {
  const line = (1000000 + lineIndex).toString().padStart(7, '0');
  return `+1${areaCode}${line}`;
}

function makeShortCode(index) {
  return `${80000 + index}`;
}

function writeCsv(filename, headers, rows) {
  const filePath = path.join(dataDir, filename);
  const contents = [csvLine(headers), ...rows.map(row => csvLine(headers.map(name => row[name] || '')))].join('\n') + '\n';
  fs.writeFileSync(filePath, contents, 'utf8');
}

function buildPhoneRecords() {
  const numbers = [];
  let counter = 0;

  const verifiedTollFree = [];
  const unverifiedTollFree = [];
  const localNumbers = [];

  phoneNumberPrefixes.tollFree.slice(0, 12).forEach((prefix, index) => {
    const number = makePhoneNumber(prefix, index + 100);
    const row = {
      sid: makeSid('PN'),
      account_sid: accountSid,
      friendly_name: `TollFree ${number}`,
      phone_number: number,
      country_code: 'US',
      phone_number_type: 'tollfree',
      capabilities: 'SMS,VOICE',
      sms_enabled: 'true',
      voice_enabled: 'true',
      verified: index < 10 ? 'true' : 'false',
      date_created: formatIso(randomDateBetween(threeYearsAgo, dateNow)),
      date_updated: formatIso(dateNow)
    };
    numbers.push(row);
    if (index < 10) {
      verifiedTollFree.push(row);
    } else {
      unverifiedTollFree.push(row);
    }
  });

  for (let i = 0; i < 500; i += 1) {
    const areaCode = phoneNumberPrefixes.localAreas[i % phoneNumberPrefixes.localAreas.length];
    const number = makePhoneNumber(areaCode, counter + 1);
    counter += 1;
    const row = {
      sid: makeSid('PN'),
      account_sid: accountSid,
      friendly_name: `Local ${areaCode}-${String(counter).padStart(4, '0')}`,
      phone_number: number,
      country_code: 'US',
      phone_number_type: 'local',
      capabilities: 'SMS,VOICE',
      sms_enabled: 'true',
      voice_enabled: 'true',
      verified: 'true',
      date_created: formatIso(randomDateBetween(threeYearsAgo, dateNow)),
      date_updated: formatIso(dateNow)
    };
    numbers.push(row);
    localNumbers.push(row);
  }

  return { all: numbers, localNumbers, verifiedTollFree, unverifiedTollFree };
}

function buildShortCodes() {
  return [0, 1].map((index) => {
    const number = makeShortCode(index);
    return {
      sid: makeSid('SC'),
      account_sid: accountSid,
      friendly_name: `Short Code ${number}`,
      phone_number: number,
      country_code: 'US',
      phone_number_type: 'short_code',
      capabilities: 'SMS',
      sms_enabled: 'true',
      voice_enabled: 'false',
      verified: 'true',
      date_created: formatIso(randomDateBetween(threeYearsAgo, dateNow)),
      date_updated: formatIso(dateNow)
    };
  });
}

function buildAvailableNumbers() {
  const rows = [];
  const poolAreaCodes = ['707', '818', '929', '980', '989'];
  for (let i = 0; i < 150; i += 1) {
    const areaCode = phoneNumberPrefixes.localAreas[i % phoneNumberPrefixes.localAreas.length];
    rows.push({
      friendly_name: `Available ${areaCode}`,
      phone_number: makePhoneNumber(areaCode, 900000 + i),
      region: 'US',
      iso_country: 'US',
      lata: '722',
      rate_center: `RC${i}`,
      latitude: '38.8951',
      longitude: '-77.0364',
      address_requirements: 'none'
    });
  }
  for (let i = 0; i < 80; i += 1) {
    const prefix = phoneNumberPrefixes.tollFree[i % phoneNumberPrefixes.tollFree.length];
    rows.push({
      friendly_name: `Available TollFree ${prefix}`,
      phone_number: makePhoneNumber(prefix, 900000 + i),
      region: 'US',
      iso_country: 'US',
      lata: '722',
      rate_center: `TF${i}`,
      latitude: '38.8951',
      longitude: '-77.0364',
      address_requirements: 'none'
    });
  }
  return rows;
}

function buildMessagingServices(phoneRows) {
  const services = [];
  for (let i = 1; i <= 15; i += 1) {
    services.push({
      sid: makeSid('MG'),
      account_sid: accountSid,
      friendly_name: `Service ${i}`,
      status: i <= 12 ? 'active' : 'inactive',
      date_created: formatIso(randomDateBetween(threeYearsAgo, dateNow)),
      date_updated: formatIso(dateNow),
      sms_url: `https://example.com/sms/${i}`,
      price_unit: 'USD'
    });
  }
  return services;
}

function buildBrandAndCampaigns(services) {
  const brands = [];
  const campaigns = [];
  const brandNames = ['Acme Holdings', 'Global Tech Inc', 'Sunshine Retail', 'Metro Services', 'Prime Solutions'];
  const useCases = ['marketing', 'customer_care', 'operational', 'alerts', 'onboarding', 'account_notifications', 'fraud_alerts', '2fa'];

  // Create 5 brands
  for (let b = 0; b < 5; b++) {
    const brandSid = makeSid('BR');
    brands.push({
      sid: brandSid,
      account_sid: accountSid,
      friendly_name: brandNames[b],
      status: b < 4 ? 'active' : 'pending',
      date_created: formatIso(randomDateBetween(threeYearsAgo, dateNow)),
      date_updated: formatIso(dateNow),
      company_name: `${brandNames[b]} LLC`,
      ein: `${10 + b}-345678${b}`
    });

    // Create 3 campaigns per brand
    for (let c = 0; c < 3; c++) {
      const serviceIndex = (b * 3 + c) % services.length;
      const statusRand = Math.random();
      const status = statusRand < 0.7 ? 'approved' : statusRand < 0.85 ? 'pending' : 'rejected';

      campaigns.push({
        sid: makeSid('CB'),
        account_sid: accountSid,
        brand_sid: brandSid,
        messaging_service_sid: services[serviceIndex].sid,
        friendly_name: `${brandNames[b]} ${useCases[c % useCases.length]} Campaign`,
        status,
        use_case: useCases[c % useCases.length],
        created_date: formatIso(randomDateBetween(threeYearsAgo, dateNow)),
        description: `A ${useCases[c % useCases.length]} campaign for ${brandNames[b]}.`,
        compliance_status: status === 'approved' ? 'active' : status
      });
    }
  }

  return { brands, campaigns };
}

function buildServiceNumberAssignments(services, ownedNumbers) {
  const rows = [];
  const numberPool = [...ownedNumbers];
  services.forEach((service) => {
    const count = 4 + Math.floor(Math.random() * 6);
    const assigned = randomChoice(numberPool, count);
    assigned.forEach((number) => {
      rows.push({
        messaging_service_sid: service.sid,
        phone_number: number.phone_number,
        phone_number_sid: number.sid
      });
    });
  });
  return rows;
}

function buildHistory(phoneNumbers, shortCodes) {
  const ownedNumbers = [...phoneNumbers, ...shortCodes];
  const externalNumbers = Array.from({ length: 500 }, (_, i) => `+1${6000000000 + i}`);
  const messages = [];
  const calls = [];

  // Generate ~10,000 messages over 3 years (average ~9 per day)
  for (let i = 0; i < 10000; i += 1) {
    const direction = Math.random() < 0.45 ? 'inbound' : 'outbound';
    const accountNumber = randomElement(ownedNumbers);
    const externalNumber = randomElement(externalNumbers);
    const from = direction === 'inbound' ? externalNumber : accountNumber.phone_number;
    const to = direction === 'inbound' ? accountNumber.phone_number : externalNumber;
    const created = randomDateBetween(threeYearsAgo, dateNow);
    const statusChooser = Math.random();
    const status = statusChooser < 0.55 ? 'delivered' : statusChooser < 0.80 ? 'sent' : 'failed';
    const numSegments = 1 + Math.floor(Math.random() * 3);
    const price = -0.0075 * numSegments;

    messages.push({
      sid: makeSid('SM'),
      account_sid: accountSid,
      date_created: formatIso(created),
      date_updated: formatIso(new Date(created.getTime() + 1000 * 30)),
      date_sent: formatIso(new Date(created.getTime() + 1000 * 12)),
      from,
      to,
      body: `Test message ${i + 1} for ${direction}.`,
      status,
      direction,
      num_segments: numSegments,
      price: price.toFixed(4),
      price_unit: 'USD',
      uri: `/2010-04-01/Accounts/${accountSid}/Messages/${makeSid('SM')}.json`,
      subresource_uris: `{"media":"/2010-04-01/Accounts/${accountSid}/Messages/${makeSid('SM')}/Media.json"}`
    });
  }

  // Generate ~5,000 calls over 3 years (average ~4-5 per day)
  for (let i = 0; i < 5000; i += 1) {
    const direction = Math.random() < 0.4 ? 'inbound' : 'outbound';
    const accountNumber = randomElement(ownedNumbers);
    const externalNumber = randomElement(externalNumbers);
    const from = direction === 'inbound' ? externalNumber : accountNumber.phone_number;
    const to = direction === 'inbound' ? accountNumber.phone_number : externalNumber;
    const created = randomDateBetween(threeYearsAgo, dateNow);
    const duration = 10 + Math.floor(Math.random() * 3600);
    const status = Math.random() < 0.6 ? 'completed' : 'busy';
    const price = -0.015 * Math.max(1, duration / 60);

    calls.push({
      sid: makeSid('CA'),
      account_sid: accountSid,
      date_created: formatIso(created),
      date_updated: formatIso(new Date(created.getTime() + 1000 * 30)),
      parent_call_sid: '',
      to,
      from,
      phone_number_sid: accountNumber.sid,
      status,
      start_time: formatIso(created),
      end_time: formatIso(new Date(created.getTime() + duration * 1000)),
      duration: String(duration),
      price: price.toFixed(4),
      price_unit: 'USD',
      direction,
      answered_by: 'human',
      forwarded_from: '',
      caller_name: 'Acme Test',
      uri: `/2010-04-01/Accounts/${accountSid}/Calls/${makeSid('CA')}.json`
    });
  }

  return { messages, calls };
}

function buildMessageStats(messages) {
  const statsByDay = {};
  messages.forEach((message) => {
    const day = message.date_created.split('T')[0];
    if (!statsByDay[day]) {
      statsByDay[day] = {
        sent: 0,
        delivered: 0,
        failed: 0,
        total_price: 0
      };
    }
    statsByDay[day].total_price += Number(message.price);
    if (message.status === 'delivered') {
      statsByDay[day].delivered += 1;
    } else if (message.status === 'failed') {
      statsByDay[day].failed += 1;
    } else {
      statsByDay[day].sent += 1;
    }
  });
  return Object.entries(statsByDay).map(([date, stats]) => ({
    account_sid: accountSid,
    date: date,
    period: 'daily',
    sent: stats.sent,
    delivered: stats.delivered,
    failed: stats.failed,
    inbound: Math.floor(stats.sent * 0.45),
    outbound: Math.floor(stats.sent * 0.55),
    total_price: Math.abs(stats.total_price).toFixed(2),
    price_unit: 'USD'
  }));
}

function buildOrganizations() {
  const organizations = [];
  const orgNames = [
    'Headquarters', 'EMEA Division', 'APAC Division', 'North America Sales',
    'Customer Support', 'Engineering', 'Marketing', 'Operations',
    'Product Team', 'Finance', 'Legal', 'HR Department',
    'R&D Lab', 'Manufacturing', 'Quality Assurance'
  ];

  for (let i = 0; i < 20; i++) {
    const statusRand = Math.random();
    organizations.push({
      sid: makeSid('OR'),
      friendly_name: i < orgNames.length ? orgNames[i] : `Organization ${i + 1}`,
      status: statusRand < 0.8 ? 'active' : statusRand < 0.95 ? 'inactive' : 'pending',
      date_created: formatIso(randomDateBetween(threeYearsAgo, dateNow)),
      date_updated: formatIso(dateNow)
    });
  }
  return organizations;
}

function buildUsageRecords() {
  const records = [];

  // Expanded categories with subcategories to reach 100x data points
  const categories = [
    // Call categories
    { category: 'calls', description: 'Voice calls', baseCount: 5, pricePerUnit: 0.013 },
    { category: 'calls-inbound', description: 'Inbound calls', baseCount: 3, pricePerUnit: 0.0085 },
    { category: 'calls-outbound', description: 'Outbound calls', baseCount: 2, pricePerUnit: 0.015 },
    { category: 'calls-inbound-local', description: 'Inbound local calls', baseCount: 2, pricePerUnit: 0.0085 },
    { category: 'calls-inbound-tollfree', description: 'Inbound toll-free calls', baseCount: 1, pricePerUnit: 0.022 },
    { category: 'calls-outbound-local', description: 'Outbound local calls', baseCount: 1, pricePerUnit: 0.013 },
    { category: 'calls-outbound-tollfree', description: 'Outbound toll-free calls', baseCount: 1, pricePerUnit: 0.019 },

    // SMS categories
    { category: 'sms', description: 'SMS messages', baseCount: 10, pricePerUnit: 0.0075 },
    { category: 'sms-inbound', description: 'Inbound SMS', baseCount: 5, pricePerUnit: 0.0075 },
    { category: 'sms-outbound', description: 'Outbound SMS', baseCount: 5, pricePerUnit: 0.0075 },
    { category: 'sms-inbound-longcode', description: 'Inbound SMS longcode', baseCount: 3, pricePerUnit: 0.0075 },
    { category: 'sms-inbound-shortcode', description: 'Inbound SMS shortcode', baseCount: 2, pricePerUnit: 0.01 },
    { category: 'sms-outbound-longcode', description: 'Outbound SMS longcode', baseCount: 3, pricePerUnit: 0.0075 },
    { category: 'sms-outbound-shortcode', description: 'Outbound SMS shortcode', baseCount: 2, pricePerUnit: 0.01 },

    // MMS categories
    { category: 'mms', description: 'MMS messages', baseCount: 2, pricePerUnit: 0.025 },
    { category: 'mms-inbound', description: 'Inbound MMS', baseCount: 1, pricePerUnit: 0.025 },
    { category: 'mms-outbound', description: 'Outbound MMS', baseCount: 1, pricePerUnit: 0.025 },

    // Phone number categories
    { category: 'phonenumbers', description: 'Phone numbers', baseCount: 50, pricePerUnit: 1.00 },
    { category: 'phonenumbers-local', description: 'Local phone numbers', baseCount: 45, pricePerUnit: 1.00 },
    { category: 'phonenumbers-tollfree', description: 'Toll-free numbers', baseCount: 5, pricePerUnit: 2.00 },
    { category: 'shortcodes', description: 'Short codes', baseCount: 2, pricePerUnit: 500 },
    { category: 'shortcodes-vanity', description: 'Vanity short codes', baseCount: 1, pricePerUnit: 1000 },

    // Recording and transcription
    { category: 'recordings', description: 'Call recordings', baseCount: 3, pricePerUnit: 0.0025 },
    { category: 'transcriptions', description: 'Transcriptions', baseCount: 1, pricePerUnit: 0.05 },

    // Verify and Lookup
    { category: 'verify-verifications', description: 'Verify verifications', baseCount: 8, pricePerUnit: 0.05 },
    { category: 'lookups', description: 'Lookup requests', baseCount: 5, pricePerUnit: 0.005 },

    // Conversations
    { category: 'conversations', description: 'Conversations', baseCount: 4, pricePerUnit: 0.02 },
    { category: 'conversations-messages', description: 'Conversation messages', baseCount: 15, pricePerUnit: 0.008 },

    // Total price
    { category: 'totalprice', description: 'Total price', baseCount: 0, pricePerUnit: 0.015 }
  ];

  // Generate daily usage records for the past 3 years
  const startDate = new Date(threeYearsAgo);
  const endDate = new Date(dateNow);
  const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

  for (let day = 0; day < daysDiff; day++) {
    const dayStart = new Date(startDate);
    dayStart.setDate(startDate.getDate() + day);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    categories.forEach(catConfig => {
      const { category, description, baseCount, pricePerUnit } = catConfig;
      const variance = Math.floor(Math.random() * baseCount);
      const count = baseCount + variance;
      const price = category === 'totalprice' ? (count * pricePerUnit).toFixed(2) : (count * pricePerUnit).toFixed(4);

      records.push({
        account_sid: accountSid,
        category,
        description,
        start_date: dayStart.toISOString().split('T')[0],
        end_date: dayEnd.toISOString().split('T')[0],
        count: count,
        count_unit: category === 'totalprice' ? 'usd' : category,
        price: price,
        price_unit: 'USD',
        usage_unit: category === 'totalprice' ? 'dollars' : category
      });
    });
  }

  return records;
}

function buildExports() {
  const exports = [];
  const types = ['messages', 'calls', 'verifications'];
  const statuses = ['completed', 'completed', 'completed', 'completed', 'failed', 'in_progress'];

  // Generate ~50 exports over 3 years (quarterly exports for each type)
  const startDate = new Date(threeYearsAgo);
  for (let quarter = 0; quarter < 12; quarter++) {
    const quarterStart = new Date(startDate);
    quarterStart.setMonth(startDate.getMonth() + quarter * 3);
    const quarterEnd = new Date(quarterStart);
    quarterEnd.setMonth(quarterStart.getMonth() + 3);
    quarterEnd.setDate(0);

    types.forEach(type => {
      const status = randomElement(statuses);
      exports.push({
        sid: makeSid('EX'),
        status: status,
        resource_type: type,
        start_day: quarterStart.toISOString().split('T')[0],
        end_day: quarterEnd.toISOString().split('T')[0],
        url: status === 'completed' ? `https://example.com/export/${type}-${quarter}.zip` : '',
        date_created: formatIso(randomDateBetween(quarterStart, quarterEnd)),
        date_updated: formatIso(dateNow)
      });
    });
  }

  return exports;
}

function buildVerifyServices() {
  const services = [];
  const serviceNames = [
    'Login Verification', '2FA Service', 'Transaction Approval',
    'Password Reset', 'Account Recovery', 'Payment Verification',
    'User Signup', 'Phone Verification'
  ];

  for (let i = 0; i < 10; i++) {
    const statusRand = Math.random();
    services.push({
      sid: makeSid('VA'),
      friendly_name: i < serviceNames.length ? serviceNames[i] : `Verify Service ${i + 1}`,
      code_length: [4, 6, 6, 6, 8][Math.floor(Math.random() * 5)],
      lookup_enabled: Math.random() < 0.7 ? 'true' : 'false',
      psd2_enabled: Math.random() < 0.3 ? 'true' : 'false',
      status: statusRand < 0.9 ? 'active' : 'inactive',
      date_created: formatIso(randomDateBetween(threeYearsAgo, dateNow)),
      date_updated: formatIso(dateNow)
    });
  }
  return services;
}

function buildVerifyVerifications(services) {
  const verifications = [];
  const channels = ['sms', 'call', 'email'];
  const statuses = ['approved', 'approved', 'approved', 'pending', 'canceled', 'expired'];

  // Generate ~2000 verifications over 3 years (~2 per day)
  services.forEach(service => {
    const verificationCount = Math.floor(200 + Math.random() * 100);
    for (let i = 0; i < verificationCount; i++) {
      const created = randomDateBetween(threeYearsAgo, dateNow);
      const status = randomElement(statuses);
      verifications.push({
        sid: makeSid('VE'),
        service_sid: service.sid,
        account_sid: accountSid,
        to: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        channel: randomElement(channels),
        status: status,
        valid: status === 'approved' ? 'true' : 'false',
        date_created: formatIso(created),
        date_updated: formatIso(new Date(created.getTime() + Math.random() * 3600000))
      });
    }
  });
  return verifications;
}

function buildConversations() {
  const conversations = [];
  const states = ['active', 'active', 'active', 'inactive', 'closed'];
  const conversationTopics = [
    'Customer Support', 'Sales Inquiry', 'Technical Support', 'Billing Question',
    'Product Feedback', 'Order Status', 'Account Help', 'Feature Request',
    'Bug Report', 'General Inquiry', 'Partnership Discussion', 'Complaint Resolution'
  ];

  // Generate ~150 conversations over 3 years
  for (let i = 0; i < 150; i++) {
    const created = randomDateBetween(threeYearsAgo, dateNow);
    const state = randomElement(states);
    conversations.push({
      sid: makeSid('CH'),
      account_sid: accountSid,
      friendly_name: i < conversationTopics.length * 12
        ? `${conversationTopics[i % conversationTopics.length]} #${Math.floor(i / conversationTopics.length) + 1}`
        : `Conversation ${i + 1}`,
      state: state,
      date_created: formatIso(created),
      date_updated: formatIso(state === 'closed' ? new Date(created.getTime() + Math.random() * 86400000 * 30) : dateNow)
    });
  }
  return conversations;
}

function buildCallStats(calls) {
  const statsByDay = {};
  calls.forEach((call) => {
    const day = call.date_created.split('T')[0];
    if (!statsByDay[day]) {
      statsByDay[day] = {
        completed: 0,
        busy: 0,
        total_duration: 0,
        total_price: 0,
        inbound: 0,
        outbound: 0
      };
    }
    const duration = Number(call.duration);
    statsByDay[day].total_duration += duration;
    statsByDay[day].total_price += Math.abs(Number(call.price));
    if (call.status === 'completed') {
      statsByDay[day].completed += 1;
    } else {
      statsByDay[day].busy += 1;
    }
    if (call.direction === 'inbound') {
      statsByDay[day].inbound += 1;
    } else {
      statsByDay[day].outbound += 1;
    }
  });
  return Object.entries(statsByDay).map(([date, stats]) => ({
    account_sid: accountSid,
    date: date,
    period: 'daily',
    completed: stats.completed,
    busy: stats.busy,
    inbound: stats.inbound,
    outbound: stats.outbound,
    total_duration: stats.total_duration,
    total_price: stats.total_price.toFixed(2),
    price_unit: 'USD'
  }));
}

function buildBillings(messages, calls) {
  const rows = [];
  messages.forEach((message) => {
    rows.push({
      sid: makeSid('BL'),
      account_sid: accountSid,
      resource_type: 'Message',
      resource_sid: message.sid,
      date_created: message.date_created,
      amount: message.price,
      currency: message.price_unit,
      description: `SMS charge for ${message.sid}`
    });
  });
  calls.forEach((call) => {
    rows.push({
      sid: makeSid('BL'),
      account_sid: accountSid,
      resource_type: 'Call',
      resource_sid: call.sid,
      date_created: call.date_created,
      amount: call.price,
      currency: call.price_unit,
      description: `Voice call charge for ${call.sid}`
    });
  });
  return rows;
}

function generateCsvData() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const account = {
    sid: accountSid,
    auth_token: authToken,
    friendly_name: 'Twilio Dummy Account',
    status: 'active',
    date_created: formatIso(randomDateBetween(threeYearsAgo, dateNow)),
    date_updated: formatIso(dateNow)
  };

  const phonePackage = buildPhoneRecords();
  const shortCodes = buildShortCodes();
  const availableNumbers = buildAvailableNumbers();
  const services = buildMessagingServices(phonePackage.all);
  const brandPackage = buildBrandAndCampaigns(services);
  const serviceNumberAssignments = buildServiceNumberAssignments(services, phonePackage.all);
  const history = buildHistory(phonePackage.all, shortCodes);
  const organizations = buildOrganizations();
  const usageRecords = buildUsageRecords();
  const exports = buildExports();
  const verifyServices = buildVerifyServices();
  const verifyVerifications = buildVerifyVerifications(verifyServices);
  const conversations = buildConversations();
  const billings = buildBillings(history.messages, history.calls);
  const messageStats = buildMessageStats(history.messages);
  const callStats = buildCallStats(history.calls);

  writeCsv('account.csv', ['sid', 'auth_token', 'friendly_name', 'status', 'date_created', 'date_updated'], [account]);
  writeCsv('incoming_phone_numbers.csv', ['sid', 'account_sid', 'friendly_name', 'phone_number', 'country_code', 'phone_number_type', 'capabilities', 'sms_enabled', 'voice_enabled', 'verified', 'date_created', 'date_updated'], phonePackage.all);
  writeCsv('short_codes.csv', ['sid', 'account_sid', 'friendly_name', 'phone_number', 'country_code', 'phone_number_type', 'capabilities', 'sms_enabled', 'voice_enabled', 'verified', 'date_created', 'date_updated'], shortCodes);
  writeCsv('available_phone_numbers.csv', ['friendly_name', 'phone_number', 'region', 'iso_country', 'lata', 'rate_center', 'latitude', 'longitude', 'address_requirements'], availableNumbers);
  writeCsv('messaging_services.csv', ['sid', 'account_sid', 'friendly_name', 'status', 'date_created', 'date_updated', 'sms_url', 'price_unit'], services);
  writeCsv('brands.csv', ['sid', 'account_sid', 'friendly_name', 'company_name', 'status', 'date_created', 'date_updated', 'ein'], brandPackage.brands);
  writeCsv('campaigns.csv', ['sid', 'account_sid', 'brand_sid', 'messaging_service_sid', 'friendly_name', 'status', 'use_case', 'created_date', 'description', 'compliance_status'], brandPackage.campaigns);
  writeCsv('service_numbers.csv', ['messaging_service_sid', 'phone_number', 'phone_number_sid'], serviceNumberAssignments);
  writeCsv('messages.csv', ['sid', 'account_sid', 'date_created', 'date_updated', 'date_sent', 'from', 'to', 'body', 'status', 'direction', 'num_segments', 'price', 'price_unit', 'uri', 'subresource_uris'], history.messages);
  writeCsv('calls.csv', ['sid', 'account_sid', 'date_created', 'date_updated', 'parent_call_sid', 'to', 'from', 'phone_number_sid', 'status', 'start_time', 'end_time', 'duration', 'price', 'price_unit', 'direction', 'answered_by', 'forwarded_from', 'caller_name', 'uri'], history.calls);
  writeCsv('billings.csv', ['sid', 'account_sid', 'resource_type', 'resource_sid', 'date_created', 'amount', 'currency', 'description'], billings);
  writeCsv('message_stats.csv', ['account_sid', 'date', 'period', 'sent', 'delivered', 'failed', 'inbound', 'outbound', 'total_price', 'price_unit'], messageStats);
  writeCsv('call_stats.csv', ['account_sid', 'date', 'period', 'completed', 'busy', 'inbound', 'outbound', 'total_duration', 'total_price', 'price_unit'], callStats);
  writeCsv('organizations.csv', ['sid', 'friendly_name', 'status', 'date_created', 'date_updated'], organizations);
  writeCsv('usage_records.csv', ['account_sid', 'category', 'description', 'start_date', 'end_date', 'count', 'count_unit', 'price', 'price_unit', 'usage_unit'], usageRecords);
  writeCsv('exports.csv', ['sid', 'status', 'resource_type', 'start_day', 'end_day', 'url', 'date_created', 'date_updated'], exports);
  writeCsv('verify_services.csv', ['sid', 'friendly_name', 'code_length', 'lookup_enabled', 'psd2_enabled', 'status', 'date_created', 'date_updated'], verifyServices);
  writeCsv('verify_verifications.csv', ['sid', 'service_sid', 'account_sid', 'to', 'channel', 'status', 'valid', 'date_created', 'date_updated'], verifyVerifications);
  writeCsv('conversations.csv', ['sid', 'account_sid', 'friendly_name', 'state', 'date_created', 'date_updated'], conversations);

  fs.writeFileSync(path.join(dataDir, 'metadata.json'), JSON.stringify({ account_sid: accountSid }, null, 2), 'utf8');

  // Update Postman collection variables and resolve baseUrl placeholders
  const collectionBaseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const postmanPath = path.join(__dirname, '..', 'postman', 'twilio-dummy-api.postman_collection.json');
  const collection = JSON.parse(fs.readFileSync(postmanPath, 'utf8'));

  function normalizeRequestUrl(request) {
    if (!request || !request.url) return;
    if (typeof request.url.raw === 'string') {
      request.url.raw = request.url.raw.replace(/\{\{baseUrl\}\}/g, collectionBaseUrl);
    }
    if (Array.isArray(request.url.host)) {
      request.url.host = request.url.host.map((part) => part.replace(/\{\{baseUrl\}\}/g, collectionBaseUrl));
    }
  }

  function walkItems(items) {
    items.forEach((item) => {
      if (item.request) {
        normalizeRequestUrl(item.request);
      }
      if (Array.isArray(item.item)) {
        walkItems(item.item);
      }
    });
  }

  // Read generated SIDs
  const incomingPhoneNumbersCsv = fs.readFileSync(path.join(dataDir, 'incoming_phone_numbers.csv'), 'utf8').trim().split('\n');
  const incomingPhoneNumberSid = incomingPhoneNumbersCsv[1].split(',')[0]; // first data row, sid

  const messagingServicesCsv = fs.readFileSync(path.join(dataDir, 'messaging_services.csv'), 'utf8').trim().split('\n');
  const messagingServiceSid = messagingServicesCsv[1].split(',')[0];

  const brandsCsv = fs.readFileSync(path.join(dataDir, 'brands.csv'), 'utf8').trim().split('\n');
  const brandSid = brandsCsv[1].split(',')[0];

  const campaignsCsv = fs.readFileSync(path.join(dataDir, 'campaigns.csv'), 'utf8').trim().split('\n');
  const campaignSid = campaignsCsv[1].split(',')[0];

  const messagesCsv = fs.readFileSync(path.join(dataDir, 'messages.csv'), 'utf8').trim().split('\n');
  const messageSid = messagesCsv[1].split(',')[0];

  const callsCsv = fs.readFileSync(path.join(dataDir, 'calls.csv'), 'utf8').trim().split('\n');
  const callSid = callsCsv[1].split(',')[0];

  const exportsCsv = fs.readFileSync(path.join(dataDir, 'exports.csv'), 'utf8').trim().split('\n');
  const exportSid = exportsCsv[1].split(',')[0];

  const organizationsCsv = fs.readFileSync(path.join(dataDir, 'organizations.csv'), 'utf8').trim().split('\n');
  const organizationSid = organizationsCsv[1].split(',')[0];

  const verifyServicesCsv = fs.readFileSync(path.join(dataDir, 'verify_services.csv'), 'utf8').trim().split('\n');
  const serviceSid = verifyServicesCsv[1].split(',')[0];

  const conversationsCsv = fs.readFileSync(path.join(dataDir, 'conversations.csv'), 'utf8').trim().split('\n');
  const conversationSid = conversationsCsv[1].split(',')[0];

  // Update variables
  collection.variable = [
    { key: 'baseUrl', value: collectionBaseUrl },
    { key: 'accountSid', value: accountSid },
    { key: 'brandSid', value: brandSid },
    { key: 'campaignSid', value: campaignSid },
    { key: 'incomingPhoneNumberSid', value: incomingPhoneNumberSid },
    { key: 'messagingServiceSid', value: messagingServiceSid },
    { key: 'messageSid', value: messageSid },
    { key: 'callSid', value: callSid },
    { key: 'exportSid', value: exportSid },
    { key: 'organizationSid', value: organizationSid },
    { key: 'serviceSid', value: serviceSid },
    { key: 'conversationSid', value: conversationSid }
  ];

  // Update walkItems function to normalize URLs
  walkItems(collection.item || []);

  fs.writeFileSync(postmanPath, JSON.stringify(collection, null, 2), 'utf8');

  console.log('Generated dummy Twilio CSV data in', dataDir);
  console.log('Account SID:', accountSid);
  console.log('Auth Token:', authToken);
  console.log('Updated Postman collection variables');
  console.log('');
  console.log('Data Summary:');
  console.log('- Phone Numbers:', phonePackage.all.length);
  console.log('- Messages:', history.messages.length);
  console.log('- Calls:', history.calls.length);
  console.log('- Messaging Services:', services.length);
  console.log('- Brands:', brandPackage.brands.length);
  console.log('- Campaigns:', brandPackage.campaigns.length);
  console.log('- Organizations:', organizations.length);
  console.log('- Usage Records:', usageRecords.length);
  console.log('- Exports:', exports.length);
  console.log('- Verify Services:', verifyServices.length);
  console.log('- Verifications:', verifyVerifications.length);
  console.log('- Conversations:', conversations.length);
}

function ensureDataFiles() {
  const required = [
    'account.csv',
    'incoming_phone_numbers.csv',
    'short_codes.csv',
    'available_phone_numbers.csv',
    'messaging_services.csv',
    'brands.csv',
    'campaigns.csv',
    'service_numbers.csv',
    'messages.csv',
    'calls.csv',
    'billings.csv',
    'message_stats.csv',
    'call_stats.csv',
    'organizations.csv',
    'usage_records.csv',
    'exports.csv',
    'verify_services.csv',
    'verify_verifications.csv',
    'conversations.csv'
  ];
  const missing = required.filter((file) => !fs.existsSync(path.join(dataDir, file)));
  if (missing.length) {
    generateCsvData();
  }
}

if (require.main === module) {
  generateCsvData();
} else {
  module.exports = { ensureDataFiles, dataDir };
}
