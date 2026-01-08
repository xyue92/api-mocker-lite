# api-mocker-lite

A lightweight API mock tool for frontend developers. No more waiting for backend APIs.

## Features

- **Zero Configuration** - Works out of the box, no config files needed
- **Convention over Configuration** - Auto-generate routes from file names
- **Dynamic Data Templates** - Support for path params, query params, and request body data
- **Random Data Generation** - Built-in Faker.js for various random data types
- **Hot Reload** - Automatically reload routes when files change
- **Multiple Usage Modes** - CLI tool, Express middleware, Vite plugin
- **Full REST Support** - GET/POST/PUT/DELETE/PATCH and all HTTP methods

## Quick Start

### Installation

```bash
npm install -D api-mocker-lite
```

### Basic Usage

1. Create mock files

```bash
mkdir -p mocks/api
```

2. Create a simple user list API `mocks/api/users.json`

```json
[
  { "id": 1, "name": "John Doe", "email": "john@example.com" },
  { "id": 2, "name": "Jane Smith", "email": "jane@example.com" }
]
```

3. Start mock server

```bash
npx mock-api
```

4. Test the API

```bash
curl http://localhost:3000/api/users
```

## File Naming Conventions

### Basic Rules

```
/mocks
  /api
    users.json              → GET /api/users
    users.POST.json         → POST /api/users
    user-[id].json          → GET /api/user/:id
    user-[id].DELETE.json   → DELETE /api/user/:id
    products/list.json      → GET /api/products/list
```

### HTTP Methods

- Default: `filename.json` → GET method
- Specify method: `filename.METHOD.json`
- Supported methods: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS

### Dynamic Parameters

Use `[paramName]` to define path parameters:

- `user-[id].json` → `/user/:id`
- `posts-[postId]-comments-[commentId].json` → `/posts/:postId/comments/:commentId`

## Response Data Formats

### Simple Mode

Return JSON data directly:

```json
{
  "code": 0,
  "data": { "message": "Success" }
}
```

### Full Mode

Include configuration options:

```json
{
  "$config": {
    "delay": 500,
    "status": 201
  },
  "code": 0,
  "data": { "id": 123 },
  "message": "Created successfully"
}
```

**Configuration options:**
- `delay`: Response delay time (milliseconds)
- `status`: HTTP status code

## Dynamic Data Templates

Use `{{}}` syntax to define dynamic data:

### Request Data

```json
{
  "userId": "{{$params.id}}",
  "keyword": "{{$query.keyword}}",
  "username": "{{$body.name}}"
}
```

- `{{$params.id}}` - Path parameters
- `{{$query.keyword}}` - Query parameters
- `{{$body.name}}` - Request body data

### Built-in Variables

```json
{
  "timestamp": "{{$now}}",
  "requestId": "{{$random.uuid}}"
}
```

- `{{$now}}` - Current timestamp (ISO format)

### Random Data

```json
{
  "id": "{{$random.uuid}}",
  "name": "{{$random.name}}",
  "email": "{{$random.email}}",
  "phone": "{{$random.phone}}",
  "age": "{{$random.number}}",
  "isActive": "{{$random.boolean}}",
  "avatar": "{{$random.avatar}}",
  "website": "{{$random.url}}",
  "bio": "{{$random.text}}",
  "company": "{{$random.company}}",
  "address": "{{$random.address}}",
  "city": "{{$random.city}}",
  "country": "{{$random.country}}"
}
```

### Complete Example

`mocks/api/user-[id].json`:

```json
{
  "$config": {
    "delay": 300
  },
  "code": 0,
  "data": {
    "id": "{{$params.id}}",
    "name": "{{$random.name}}",
    "email": "{{$random.email}}",
    "avatar": "{{$random.avatar}}",
    "createdAt": "{{$now}}"
  }
}
```

Accessing `GET /api/user/123` returns:

```json
{
  "code": 0,
  "data": {
    "id": "123",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "avatar": "https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/123.jpg",
    "createdAt": "2024-01-08T12:34:56.789Z"
  }
}
```

## CLI Usage

### Basic Commands

```bash
# Start with defaults (port 3000, directory ./mocks)
npx mock-api

# Specify port
npx mock-api -p 8080

# Specify mock files directory
npx mock-api -d ./mock-data

# Add path prefix
npx mock-api --prefix /api

# Enable file watching (hot reload)
npx mock-api -w

# Combined usage
npx mock-api -p 8080 -d ./mocks --prefix /api -w
```

### Configuration in package.json

```json
{
  "scripts": {
    "mock": "mock-api",
    "mock:watch": "mock-api -w",
    "dev": "vite",
    "dev:mock": "concurrently \"npm run mock\" \"npm run dev\""
  }
}
```

## Use as Express Middleware

```javascript
const express = require('express');
const { createMockMiddleware } = require('api-mocker-lite');

const app = express();

// Add mock middleware
app.use(createMockMiddleware({
  mockDir: './mocks',
  prefix: '/api',
  enable: process.env.NODE_ENV === 'development'
}));

// Your other routes...
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3000);
```

## Use as Vite Plugin

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { mockPlugin } from 'api-mocker-lite/vite';

export default defineConfig({
  plugins: [
    mockPlugin({
      enable: process.env.NODE_ENV === 'development',
      mockDir: './mocks',
      prefix: '/api'
    })
  ]
});
```

## API Reference

### CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --port <number>` | Port number | 3000 |
| `-d, --dir <path>` | Mock files directory | ./mocks |
| `--prefix <path>` | API path prefix | '' |
| `-w, --watch` | Watch for file changes | false |
| `-v, --version` | Show version number | - |
| `-h, --help` | Show help information | - |

### Middleware Options

```javascript
createMockMiddleware({
  mockDir: './mocks',  // Mock files directory
  prefix: '/api',      // API path prefix
  enable: true         // Enable/disable
})
```

### Vite Plugin Options

```javascript
mockPlugin({
  enable: true,        // Enable/disable
  mockDir: './mocks',  // Mock files directory
  prefix: '/api'       // API path prefix
})
```

## Real-World Use Cases

### 1. Quick Mock During Development

Create mock data quickly when backend APIs are not ready:

```bash
# Terminal 1: Start mock server
npm run mock:watch

# Terminal 2: Start frontend dev server
npm run dev
```

### 2. Integration with Vite Project

Seamless integration in Vite projects, no separate mock server needed:

```javascript
// vite.config.js
import { mockPlugin } from 'api-mocker-lite/vite';

export default defineConfig({
  plugins: [
    mockPlugin({
      enable: !process.env.USE_REAL_API,
      mockDir: './mocks',
      prefix: '/api'
    })
  ]
});
```

### 3. Test Different Response Scenarios

Create multiple response files for testing different scenarios:

```
/mocks
  /api
    /users
      success.json       # Success response
      error.json         # Error response
      empty.json         # Empty data
      loading.json       # Response with delay
```

## FAQ

### How to simulate network delay?

Use `$config.delay`:

```json
{
  "$config": {
    "delay": 2000
  },
  "data": {...}
}
```

### How to return error status codes?

Use `$config.status`:

```json
{
  "$config": {
    "status": 404
  },
  "error": "Not Found"
}
```

### Do I need to restart the server after file changes?

Use `-w` parameter for hot reload:

```bash
npx mock-api -w
```

### Can I use multiple mock directories?

Not supported in current version, but you can organize with subdirectories:

```
/mocks
  /api-v1
  /api-v2
  /external
```

## License

MIT

## Contributing

Issues and Pull Requests are welcome!

## Changelog

### v1.0.0

- Initial release
- Support all REST methods
- File name convention routing
- Dynamic path parameters
- Template syntax support
- Random data generation
- CLI tool
- Express middleware
- Vite plugin