# iperf Orchestrator

A distributed network performance testing system that orchestrates iperf3 tests across multiple nodes. The system consists of a Next.js web server for scheduling and visualization, and TypeScript client agents that execute tests.

## Features

- **Web Dashboard**: Modern UI built with Next.js, React, and Tailwind CSS
- **Distributed Testing**: Schedule and coordinate iperf3 tests across multiple nodes
- **Real-time Monitoring**: View throughput, jitter, and packet loss metrics
- **API Key Authentication**: Secure API key-based authentication for client nodes
- **Automatic Node Registration**: Nodes can register themselves with the server
- **Scheduled Tests**: Configure recurring network performance tests
- **Historical Data**: Track and visualize test results over time

## Architecture

The project is organized as a monorepo with two main components:

- **`server/`**: Next.js application providing the web UI, API endpoints, and scheduling logic
- **`client/`**: TypeScript client agents that connect to the server and execute iperf3 tests

## Prerequisites

- Node.js 18.18.0 or higher
- Yarn package manager
- iperf3 installed on client machines

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd iperf-orchestrator
```

2. Install dependencies:
```bash
yarn install
```

3. Set up the database:
```bash
cd server
cp .env.example .env
# Edit .env and set DATABASE_URL (defaults to SQLite)
```

4. Initialize Prisma:
```bash
cd server
npx prisma generate
npx prisma db push
```

## Running the Server

### Development Mode

From the root directory:
```bash
yarn dev:server
```

Or from the `server/` directory:
```bash
yarn dev
```

The server will start on `http://localhost:3000`

### Production Build

```bash
yarn build:server
yarn start:server
```

## Running Client Agents

From the root directory:
```bash
yarn dev:client
```

Or from the `client/` directory:
```bash
ts-node src/index.ts
```

## Configuration

### Server Configuration

The server uses environment variables defined in `server/.env`:

- `DATABASE_URL`: Database connection string (defaults to SQLite: `file:./prisma/dev.db`)

### Client Configuration

Client agents need to be configured with:
- Server URL (e.g., `http://localhost:3000`)
- API Key (secret key) for authentication

## API Documentation

### Authentication

All API endpoints (except `/api/poll`) require authentication via API key. You can provide the API key in two ways:

1. **Authorization Header** (recommended):
   ```
   Authorization: Bearer <your-api-key>
   ```

2. **X-API-Key Header**:
   ```
   X-API-Key: <your-api-key>
   ```

### Endpoints

#### `POST /api/poll`

Poll the server for scheduled tests. Nodes should call this endpoint periodically.

**Request Body:**
```json
{
  "secretKey": "your-api-key",
  "name": "Node Name (optional, for auto-registration)",
  "description": "Node Description (optional)"
}
```

**Response:**
```json
{
  "nodeId": "node-id",
  "pollIntervalSeconds": 300,
  "action": {
    "type": "iperf3",
    "scheduleId": "schedule-id",
    "targetHost": "target.example.com",
    "targetPort": 5201,
    "durationSeconds": 10,
    "parallelStreams": 1
  }
}
```

#### `POST /api/results`

Submit test results to the server.

**Headers:**
- `Authorization: Bearer <api-key>` or `X-API-Key: <api-key>`

**Request Body:**
```json
{
  "scheduleId": "schedule-id (optional)",
  "startedAt": "2024-01-01T00:00:00Z",
  "finishedAt": "2024-01-01T00:10:00Z",
  "success": true,
  "errorMessage": "Error message (if success is false)",
  "throughputMbps": 1000.5,
  "jitterMs": 0.5,
  "lossPercent": 0.0,
  "iperfJson": { /* raw iperf3 JSON output */ }
}
```

## Web UI

### Managing Nodes

1. **View Nodes**: Navigate to the home page to see all registered nodes
2. **Create Node**: Click "New node" to manually create a node with an API key
3. **Edit Node**: Click "Edit" on any node to modify its settings
4. **View Details**: Click "View" to see node details, API key, and test history
5. **Delete Node**: Use the "Delete" button to remove a node

### API Keys

Each node has a unique API key (secret key) that:
- Identifies the node to the server
- Authenticates API requests
- Can be regenerated from the edit page

**Important**: Keep API keys secure. If compromised, regenerate them immediately.

## Database

The server uses Prisma ORM with SQLite by default (configurable to PostgreSQL, MySQL, etc.).

### Schema

- **Node**: Represents a client agent
- **Schedule**: Defines recurring test schedules
- **TestRun**: Stores individual test execution results

### Migrations

To create a migration:
```bash
cd server
npx prisma migrate dev --name migration-name
```

## Testing

The project includes unit tests and component tests using Jest and React Testing Library.

### Running Tests

```bash
cd server

# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage report
yarn test:coverage
```

### Test Structure

- **Unit Tests**: Test utility functions and API routes
  - `lib/__tests__/` - Authentication and utility function tests
  - `app/api/__tests__/` - API endpoint tests

- **Component Tests**: Test React components
  - `app/nodes/new/__tests__/` - New node form tests
  - `app/nodes/[id]/edit/__tests__/` - Edit node form tests

See `server/README-TESTING.md` for detailed testing documentation.

## Development

### Project Structure

```
iperf-orchestrator/
├── server/                 # Next.js server application
│   ├── app/                # Next.js app directory
│   │   ├── api/           # API routes
│   │   ├── nodes/         # Node management pages
│   │   └── ...
│   ├── lib/               # Utility functions
│   ├── prisma/            # Prisma schema and migrations
│   └── ...
├── client/                 # TypeScript client agents
│   └── src/
│       └── index.ts
└── package.json           # Root workspace configuration
```

### Tech Stack

**Server:**
- Next.js 16
- React 19
- TypeScript
- Prisma ORM
- Tailwind CSS 4
- Chart.js

**Client:**
- TypeScript
- iperf3

## Troubleshooting

### Database Issues

If you encounter database errors:
1. Ensure `DATABASE_URL` is set correctly in `server/.env`
2. Run `npx prisma generate` to regenerate the Prisma client
3. Run `npx prisma db push` to sync the schema

### API Authentication Errors

- Verify the API key matches the node's secret key
- Check that headers are set correctly
- Ensure the node exists in the database

### Build Errors

- Clear `.next` directory: `rm -rf server/.next`
- Reinstall dependencies: `yarn install`
- Regenerate Prisma client: `npx prisma generate`

## License

See [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
