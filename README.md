
# Twilio API Data

A Node.js Express server that provides a full-featured mock implementation of Twilio APIs for local development and testing. Features a modern browser-based UI with Twilio branding, comprehensive API coverage, and 3 years of realistic dummy data.

## Features

- **Complete API Coverage**: Mocks all major Twilio APIs including Phone Numbers, Messages, Calls, Messaging Services, Brands/Campaigns, Verify, Lookup, Conversations, Bulk Exports, Organizations, and Usage Records
- **Modern UI**: Browser-based interface at http://localhost:3000 with official Twilio branding (colors, fonts, design patterns)
- **Realistic Data**: Auto-generates 3 years of historical data including 10,000+ messages, 5,000+ calls, and 31,000+ usage records
- **Pagination Support**: List endpoints include "Load More" functionality for testing paginated responses
- **Postman Collection**: Import `/postman/twilio-dummy-api.postman_collection.json` for API testing

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Generate dummy Twilio CSV data (optional; generated automatically when the server starts):
   ```bash
   npm run generate
   ```
3. Start the local Twilio clone server:
   ```bash
   npm start
   ```

## API Endpoints

The server exposes Twilio-compatible endpoints under `/2010-04-01`, `/v1`, and `/v2` paths.

### Account & Phone Numbers

- `GET /2010-04-01/Accounts/:AccountSid.json` — Get account details
- `GET /2010-04-01/Accounts/:AccountSid/IncomingPhoneNumbers.json` — List incoming phone numbers
- `GET /2010-04-01/Accounts/:AccountSid/IncomingPhoneNumbers/:Sid.json` — Get a specific phone number
- `GET /2010-04-01/Accounts/:AccountSid/AvailablePhoneNumbers/US/Local.json` — Search available local numbers
- `GET /2010-04-01/Accounts/:AccountSid/AvailablePhoneNumbers/US/TollFree.json` — Search available toll-free numbers

### Messages & Calls

- `GET /2010-04-01/Accounts/:AccountSid/Messages.json` — List SMS messages
- `GET /2010-04-01/Accounts/:AccountSid/Messages/:Sid.json` — Get a specific message
- `GET /2010-04-01/Accounts/:AccountSid/Messages/Stats.json` — Message statistics (sent, delivered, failed counts)
- `GET /2010-04-01/Accounts/:AccountSid/Calls.json` — List voice calls
- `GET /2010-04-01/Accounts/:AccountSid/Calls/:Sid.json` — Get a specific call
- `GET /2010-04-01/Accounts/:AccountSid/Calls/Stats.json` — Call statistics (completed, busy counts, duration)

### Messaging Services & A2P 10DLC

- `GET /2010-04-01/Accounts/:AccountSid/Messaging/Services.json` — List messaging services
- `GET /2010-04-01/Accounts/:AccountSid/Messaging/Services/:Sid.json` — Get a specific service
- `GET /2010-04-01/Accounts/:AccountSid/Messaging/Services/:Sid/PhoneNumbers.json` — Get phone numbers assigned to a service
- `GET /v1/Brands.json` — List brands
- `GET /v1/Brands/:Sid.json` — Get a specific brand
- `GET /v1/Brands/:BrandSid/Campaigns.json` — List campaigns for a brand
- `GET /v1/Brands/:BrandSid/Campaigns/:Sid.json` — Get a specific campaign

### Usage Records & Billing

- `GET /2010-04-01/Accounts/:AccountSid/Usage/Records.json` — List usage records
- `GET /2010-04-01/Accounts/:AccountSid/Usage/Records/Daily.json` — Daily usage records
- `GET /2010-04-01/Accounts/:AccountSid/Usage/Records/Monthly.json` — Monthly usage records

### Organizations & Bulk Export

- `GET /v1/Organizations.json` — List organizations
- `GET /v1/Organizations/:Sid.json` — Get a specific organization
- `GET /v1/Exports.json` — List bulk exports
- `GET /v1/Exports/:Sid.json` — Get a specific export

### Verify API

- `GET /v2/Services.json` — List verify services
- `GET /v2/Services/:Sid.json` — Get a specific verify service
- `GET /v2/Services/:ServiceSid/Verifications.json` — List verifications for a service

### Lookup API

- `GET /v1/PhoneNumbers/:PhoneNumber.json` — Lookup phone number information

### Conversations API

- `GET /v1/Conversations.json` — List conversations
- `GET /v1/Conversations/:Sid.json` — Get a specific conversation

## Generated Data

The server auto-generates realistic dummy data on first startup. Data spans 3 years of history and includes:

- **Phone Numbers (508 total):**
  - 10 verified toll-free numbers
  - 2 unverified toll-free numbers
  - 500 local US numbers
  - 2 short codes

- **Messaging Services & A2P 10DLC:**
  - 15 messaging services with assigned numbers
  - 5 brands with realistic company information
  - 15 campaigns (mix of approved, pending, rejected statuses)
  - Each campaign linked to a messaging service and brand

- **Communication History:**
  - **10,000 SMS messages** with varied statuses (sent, delivered, failed, queued)
  - **5,000 voice calls** with varied statuses (completed, busy, no-answer, failed)
  - Daily aggregated statistics for both messages and calls
  - Billing records for all messages and calls

- **Usage Records:**
  - **31,755 usage records** with daily granularity over 3 years
  - 29 categories including calls (inbound/outbound, local/toll-free), SMS/MMS (longcode/shortcode), phone numbers, recordings, transcriptions, verify, lookups, conversations

- **Other Services:**
  - 20 organizations
  - 36 bulk exports (quarterly over 3 years)
  - 10 verify services with 2,400+ verifications
  - 150 conversations with varied states

## Data Storage

All dummy account data is stored in CSV format under the `data/` directory:

- `account.csv` — Account information (SID, auth token, status)
- `incoming_phone_numbers.csv` — Owned phone numbers
- `short_codes.csv` — Short codes
- `available_phone_numbers.csv` — Available numbers for purchase
- `messaging_services.csv` — Messaging service configurations
- `brands.csv` — A2P 10DLC brands
- `campaigns.csv` — A2P 10DLC campaigns
- `service_numbers.csv` — Mapping of phone numbers to messaging services
- `messages.csv` — SMS/MMS message history
- `calls.csv` — Voice call history
- `message_stats.csv` — Daily aggregated message statistics
- `call_stats.csv` — Daily aggregated call statistics
- `billings.csv` — Billing records for messages and calls
- `usage_records.csv` — Daily usage records across 29 categories
- `organizations.csv` — Organizations
- `exports.csv` — Bulk export jobs
- `verify_services.csv` — Verify services
- `verify_verifications.csv` — Phone verification records
- `conversations.csv` — Conversations
- `metadata.json` — Generated account SID and metadata

## Project Structure

```
twilio-api-data/
├── data/                  # Auto-generated CSV data files
├── lib/
│   ├── data.js           # Loads CSV files and exports data objects
│   └── utils.js          # Pagination, filtering, validation utilities
├── routes/               # Express route modules (one per API)
│   ├── account.js
│   ├── phone-numbers.js
│   ├── messages.js
│   ├── calls.js
│   ├── messaging-services.js
│   ├── brands.js
│   ├── campaigns.js
│   ├── organizations.js
│   ├── usage-records.js
│   ├── exports.js
│   ├── verify.js
│   ├── lookup.js
│   └── conversations.js
├── scripts/
│   └── generate-data.js  # Data generation script
├── public/               # Frontend HTML, CSS, and JavaScript
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── [api-pages].html
├── postman/              # Postman collection
└── index.js              # Main Express server
```

## Running the Server

```bash
npm start
```

The server runs on `http://localhost:3000` by default. Set the `PORT` environment variable to use a different port.

On first startup, the server automatically generates data files if they don't exist in the `data/` directory. To regenerate data manually, run:

```bash
npm run generate
```

**⚠️ Important**: The server caches all CSV data at startup. If you regenerate data while the server is running, you must restart the server to load the new data and AccountSid. The regeneration script will update the Postman collection automatically, but the running server won't pick up changes until restart.

## Browser UI

Navigate to http://localhost:3000 to access the browser-based interface. Features include:

- **Alphabetically organized navigation menu** for easy access to all API sections
- **Twilio branding** with official colors (#F22F46 red, #0263E0 blue, #0D111B navy) and Inter font family
- **Interactive API testing** - click "Send" to execute requests and view JSON responses
- **Load More pagination** - automatically detects list endpoints and provides a button to load additional pages
- **Visual response display** - formatted JSON with metadata showing total records loaded

## Testing with cURL

All endpoints support standard Twilio API parameters like pagination (`PageSize`, `Page`), filtering, and date range queries.

Examples:
```bash
# Get account details
curl "http://localhost:3000/2010-04-01/Accounts/AC.../json"

# List messages with pagination
curl "http://localhost:3000/2010-04-01/Accounts/AC.../Messages.json?PageSize=50"

# Get message statistics for date range
curl "http://localhost:3000/2010-04-01/Accounts/AC.../Messages/Stats.json?StartDate=2024-01-01&EndDate=2024-12-31"

# List usage records by category
curl "http://localhost:3000/2010-04-01/Accounts/AC.../Usage/Records.json?Category=calls"
```

## Postman Collection

Import the Postman collection from `/postman/twilio-dummy-api.postman_collection.json` for complete API documentation and testing. The collection includes:

- Pre-configured variables (AccountSid, baseUrl, resource SIDs)
- All endpoint definitions organized by API section
- Request descriptions and example responses
