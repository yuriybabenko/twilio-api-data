# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Node.js Express server that mocks Twilio APIs for local development and testing. The server provides Twilio-compatible endpoints under `/2010-04-01` and `/v1`, serving data from CSV files in the `data/` directory. A browser-based UI at `http://localhost:3000` provides visual access to all endpoints.

## Commands

### Development
```bash
npm start          # Start the server on http://localhost:3000 (auto-generates data if missing)
npm run generate   # Manually generate dummy CSV data files
```

The server uses `PORT` environment variable if set (default: 3000).

## Architecture

### Data Layer (`lib/data.js`)
- Loads all CSV files from `data/` directory at startup
- Parses CSV into JavaScript objects with header-based keys
- Exports all datasets as module exports for use in routes
- CSV parsing handles JSON-embedded values (objects/arrays in cells)

### Route Layer (`routes/`)
Each route file registers Express endpoints for a specific Twilio API domain:
- `account.js` - Account details
- `phone-numbers.js` - Incoming/available numbers, short codes
- `messages.js` - SMS messages and message stats
- `calls.js` - Voice calls and call stats
- `messaging-services.js` - Messaging services and their assigned numbers
- `brands.js` - A2P 10DLC brands
- `campaigns.js` - A2P 10DLC campaigns
- `organizations.js` - Organizations API
- `usage-records.js` - Usage records and billing
- `exports.js` - Bulk exports
- `verify.js` - Verify API (phone verification)
- `lookup.js` - Lookup API (phone number info)
- `conversations.js` - Conversations API

All routes follow the same pattern:
1. Import data from `lib/data.js`
2. Import utilities from `lib/utils.js`
3. Define Express routes matching Twilio API paths
4. Use `accountMismatch()` to validate AccountSid
5. Apply `filterItems()` for query filters
6. Return `paginate()` for list endpoints or direct JSON for single-record endpoints

### Utilities (`lib/utils.js`)
- `paginate(req, items, collectionName)` - Returns Twilio-style paginated response with page navigation URIs
- `filterItems(items, filters)` - Filters items by query parameters (case-insensitive substring match)
- `accountMismatch(res, accountSid, expectedAccountSid)` - Validates AccountSid, sends 404 if mismatch
- `notFound(res, resourceType, id)` - Sends Twilio-formatted 404 error

### Data Generation (`scripts/generate-data.js`)
- Generates realistic dummy Twilio account data across 3 years of history
- Creates 514 phone numbers (10 verified toll-free, 2 unverified toll-free, 500 local, 2 short codes)
- Generates 5 messaging services, 1 brand, 5 campaigns
- Creates 1,200 SMS messages and 600 voice calls with varied statuses
- Outputs to CSV files in `data/` directory
- Exports `ensureDataFiles()` function called on server startup to auto-generate if missing
- Exports `dataDir` constant for data file paths

### Frontend (`public/`)
Static HTML pages that display API responses in a user-friendly format. Each HTML page corresponds to a route module and uses `app.js` to fetch and render data from the backend.

## Key Patterns

### Adding a New API Endpoint
1. Add route to appropriate file in `routes/` (or create new route file)
2. Import data from `lib/data.js`
3. Use utilities from `lib/utils.js` for common operations
4. Register route in `index.js` if creating a new route module
5. Add corresponding CSV data generation in `scripts/generate-data.js` if needed
6. Add frontend page in `public/` if UI display is required

### CSV Data Structure
All CSV files use consistent format:
- First row: headers (column names)
- Subsequent rows: data values
- JSON values (objects/arrays) stored as JSON strings in cells
- `data.js` automatically parses JSON values during CSV parsing

### Twilio API Compatibility
Endpoints replicate Twilio API structure:
- Use Twilio URL patterns (`/2010-04-01/Accounts/:AccountSid/...` and `/v1/...`)
- Return Twilio-formatted JSON responses
- Support standard query params: `PageSize`, `Page`, `StartDate`, `EndDate`
- Return Twilio-style error responses (code: 20404 for not found)

## Data Files

CSV files in `data/` directory (auto-generated on first run):
- `account.csv` - Account information (SID, auth token, status)
- `incoming_phone_numbers.csv` - Owned phone numbers
- `short_codes.csv` - Short codes
- `available_phone_numbers.csv` - Available numbers for purchase
- `messaging_services.csv` - Messaging service configurations
- `brands.csv` - A2P 10DLC brands
- `campaigns.csv` - A2P 10DLC campaigns
- `service_numbers.csv` - Phone number to messaging service mappings
- `messages.csv` - SMS message history
- `calls.csv` - Voice call history
- `message_stats.csv` - Daily aggregated message statistics
- `call_stats.csv` - Daily aggregated call statistics
- `billings.csv` - Billing records
- `organizations.csv` - Organizations
- `usage_records.csv` - Usage records
- `exports.csv` - Bulk exports
- `verify_services.csv` - Verify services
- `verify_verifications.csv` - Verify verifications
- `conversations.csv` - Conversations
- `metadata.json` - Generated data metadata (AccountSid, generation timestamp)
