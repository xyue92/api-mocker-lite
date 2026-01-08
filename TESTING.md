# Testing Documentation

## Quick Test

Run all basic functionality tests:

```bash
node test/quick-test.js
```

## Start Test Server

```bash
node test/test-server.js
```

Or use CLI command:

```bash
node src/cli.js
```

## Manual Endpoint Testing

### 1. GET Request - Static Data

```bash
curl http://localhost:3000/api/users
```

Expected response:
```json
[
  {"id": 1, "name": "John Doe", "email": "john@example.com", "role": "admin"},
  {"id": 2, "name": "Jane Smith", "email": "jane@example.com", "role": "user"},
  {"id": 3, "name": "Bob Johnson", "email": "bob@example.com", "role": "user"}
]
```

### 2. GET Request - Dynamic Path Parameters

```bash
curl http://localhost:3000/api/user/123
```

Expected response:
```json
{
  "code": 0,
  "data": {
    "id": "123",  // From path parameter
    "name": "Random Name",  // Different each time
    "email": "random@example.com",
    "avatar": "https://...",
    "phone": "xxx-xxx-xxxx",
    "company": "Random Company",
    "address": "Random Address",
    "city": "Random City",
    "createdAt": "2024-01-08T..."
  }
}
```

### 3. GET Request - Query Parameters

```bash
curl "http://localhost:3000/api/search?q=hello"
```

Expected response:
```json
{
  "code": 0,
  "data": {
    "keyword": "hello",  // From query parameter
    "results": [
      {
        "id": "uuid",
        "title": "Random text",
        "description": "Random paragraph"
      }
    ]
  }
}
```

### 4. POST Request - Request Body Data

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'
```

Expected response (with 500ms delay, status 201):
```json
{
  "code": 0,
  "message": "User created successfully",
  "data": {
    "id": "uuid",  // Randomly generated
    "name": "Test User",  // From request body
    "email": "test@example.com",  // From request body
    "role": "user",
    "createdAt": "2024-01-08T..."
  }
}
```

### 5. DELETE Request

```bash
curl -X DELETE http://localhost:3000/api/user/456
```

Expected response:
```json
{
  "code": 0,
  "message": "User deleted successfully",
  "data": {
    "id": "456"  // From path parameter
  }
}
```

### 6. GET Request - Nested Path

```bash
curl http://localhost:3000/api/products/list
```

Expected response:
```json
{
  "code": 0,
  "data": {
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "items": [...]
  }
}
```

## CLI Parameter Testing

### Custom Port

```bash
node src/cli.js -p 8080
```

### Custom Directory

```bash
node src/cli.js -d ./custom-mocks
```

### Add Prefix

```bash
node src/cli.js --prefix /v1
```

Visit: `http://localhost:3000/v1/api/users`

### Hot Reload Mode

```bash
node src/cli.js -w
```

Routes will auto-reload when mock files change.

### Combined Usage

```bash
node src/cli.js -p 8080 -d ./mocks --prefix /api/v1 -w
```

## Feature Verification Checklist

- [x] GET/POST/PUT/DELETE/PATCH method support
- [x] Static routes
- [x] Dynamic path parameters (:id)
- [x] Query parameters (?q=xxx)
- [x] Request body data
- [x] Template variable substitution
  - [x] {{$params.xxx}}
  - [x] {{$query.xxx}}
  - [x] {{$body.xxx}}
  - [x] {{$now}}
  - [x] {{$random.uuid}}
  - [x] {{$random.name}}
  - [x] {{$random.email}}
  - [x] Other random data types
- [x] $config configuration
  - [x] delay - Response delay
  - [x] status - HTTP status code
- [x] CORS support
- [x] Request logging
- [x] CLI commands
- [x] File hot reload (-w parameter)
- [x] Express middleware
- [x] Vite plugin

## Known Limitations

1. Multiple mock directories not supported in current version
2. Files must be in .json format
3. Template syntax only supports predefined variables, not custom JavaScript expressions

## Performance Testing

Use Apache Bench for simple performance testing:

```bash
# Start server after installing dependencies
npm start

# Run in another terminal
ab -n 1000 -c 10 http://localhost:3000/api/users
```

## Error Handling Testing

### 404 Error

Access non-existent route:
```bash
curl http://localhost:3000/api/notfound
```

Expected response:
```json
{
  "error": "Not Found",
  "message": "Route GET /api/notfound not found",
  "availableRoutes": [...]
}
```

### Invalid JSON File

Create a malformed JSON file, server should:
1. Display error in console
2. Return 500 error with error message

## Integration Testing

### Express Middleware Integration

```javascript
const express = require('express');
const { createMockMiddleware } = require('api-mocker-lite');

const app = express();
app.use(createMockMiddleware({ mockDir: './mocks', prefix: '/api' }));

// Test with supertest
const request = require('supertest');

describe('Mock API', () => {
  it('should return users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
```

### Vite Plugin Integration

```javascript
// vite.config.test.js
import { defineConfig } from 'vite';
import { mockPlugin } from 'api-mocker-lite/vite';

export default defineConfig({
  plugins: [mockPlugin({ enable: true, mockDir: './mocks' })]
});
```

## Test Coverage

- **Unit Tests**: Core modules (utils, loader, renderer)
- **Integration Tests**: Server, middleware, plugin
- **End-to-End Tests**: CLI commands, API endpoints
- **Performance Tests**: Response time, concurrent requests

## Continuous Testing

For development with hot reload:

```bash
# Terminal 1: Start server with watch mode
npx mock-api -w

# Terminal 2: Run tests or manual curl commands
curl http://localhost:3000/api/users

# Modify mock files and test again without restart
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
npx mock-api -p 8080
```

### Mock Files Not Found

Ensure mock directory exists and contains .json files:

```bash
ls -la mocks/api/
```

### Template Not Rendering

Check console for warnings about unknown template expressions.

### CORS Issues

CORS is enabled by default. If issues persist, check browser console for specific errors.
