
# Twilio API Data

A Node.js project. Runs a local server which clones the endpoints for common Twilio APIs, and provides mock account data.

See `/postman` for a file containing a Postman collection including all endpoints.

Access application at http://localhost:3000/ for a UI that is based on the Postman collection.

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

## Local Twilio Clone Features

The server exposes Twilio-compatible endpoints under `/2010-04-01` and `/v1`, allowing you to test Twilio API integrations locally.

### Account & Phone Numbers

- `GET /2010-04-01/Accounts/:AccountSid.json` — Get account details
- `GET /2010-04-01/Accounts/:AccountSid/IncomingPhoneNumbers.json` — List incoming phone numbers
- `GET /2010-04-01/Accounts/:AccountSid/IncomingPhoneNumbers/:Sid.json` — Get a specific phone number
- `GET /2010-04-01/Accounts/:AccountSid/AvailablePhoneNumbers/US/Local.json` — Search available local numbers
- `GET /2010-04-01/Accounts/:AccountSid/AvailablePhoneNumbers/US/TollFree.json` — Search available toll-free numbers

### Messages & Calls

- `GET /2010-04-01/Accounts/:AccountSid/Messages.json` — List SMS messages
- `GET /2010-04-01/Accounts/:AccountSid/Messages/:Sid.json` — Get a specific message
- `GET /2010-04-01/Accounts/:AccountSid/Calls.json` — List voice calls
- `GET /2010-04-01/Accounts/:AccountSid/Calls/:Sid.json` — Get a specific call

### Reports API

- `GET /2010-04-01/Accounts/:AccountSid/Messages/Stats.json` — Message statistics (sent, delivered, failed counts)
  - Query params: `StartDate`, `EndDate`, `PageSize`, `Page`
- `GET /2010-04-01/Accounts/:AccountSid/Calls/Stats.json` — Call statistics (completed, busy counts, duration)
  - Query params: `StartDate`, `EndDate`, `PageSize`, `Page`

### Messaging Services & Brands

- `GET /2010-04-01/Accounts/:AccountSid/Messaging/Services.json` — List messaging services
- `GET /2010-04-01/Accounts/:AccountSid/Messaging/Services/:Sid.json` — Get a specific service
- `GET /2010-04-01/Accounts/:AccountSid/Messaging/Services/:Sid/PhoneNumbers.json` — Get phone numbers assigned to a service
- `GET /v1/Brands.json` — List brands
- `GET /v1/Brands/:BrandSid/Campaigns.json` — List campaigns for a brand
- `GET /v1/Brands/:BrandSid/Campaigns/:Sid.json` — Get a specific campaign

## Dummy Dataset

The generated dummy account includes:

- **Phone Numbers:**
  - 10 verified toll-free numbers
  - 2 unverified toll-free numbers
  - 500 local US numbers
  - 2 short codes

- **Messaging Services & Campaigns:**
  - 5 messaging services with assigned numbers
  - 1 primary brand with 5 campaigns (3 approved, 2 rejected)
  - Each campaign associated with a messaging service

- **Usage History (3 years):**
  - 1,200 SMS messages with varied statuses (sent, delivered, failed)
  - 600 voice calls with varied statuses (completed, busy)
  - Daily aggregated statistics for both messages and calls
  - Billing records for all messages and calls

## Data Storage

All dummy account data is stored in CSV format under the `data/` directory:

- `account.csv` — Account information
- `incoming_phone_numbers.csv` — Owned phone numbers
- `short_codes.csv` — Short codes
- `available_phone_numbers.csv` — Available numbers for purchase
- `messaging_services.csv` — Messaging service configurations
- `brands.csv` — Brands
- `campaigns.csv` — Campaigns
- `service_numbers.csv` — Mapping of numbers to services
- `messages.csv` — SMS message history
- `calls.csv` — Call history
- `message_stats.csv` — Daily message statistics
- `call_stats.csv` — Daily call statistics
- `billings.csv` — Billing records

## Running the Server

```bash
npm start
```

The server runs on `http://localhost:3000` by default. Set the `PORT` environment variable to use a different port.

## Testing

All endpoints support standard Twilio API parameters like pagination (`PageSize`, `Page`), filtering, and date range queries.

Example:
```bash
curl "http://localhost:3000/2010-04-01/Accounts/AC.../Messages/Stats.json?StartDate=2024-01-01&EndDate=2024-12-31"
```
