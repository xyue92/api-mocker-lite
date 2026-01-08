# Quick Start Guide

## Get Started with api-mocker-lite in 1 Minute

### Step 1: Installation

Install in your frontend project:

```bash
npm install -D api-mocker-lite
```

### Step 2: Create Mock Files

Create mock folder and your first API file in project root:

```bash
mkdir -p mocks/api
```

Create `mocks/api/users.json`:

```json
[
  { "id": 1, "name": "John Doe" },
  { "id": 2, "name": "Jane Smith" }
]
```

### Step 3: Start Mock Server

```bash
npx mock-api
```

You will see:

```
🚀 Mock API Server Started!

  Local:    http://localhost:3000
  Mock Dir: ./mocks

✓ Mock server routes loaded:

   GET    /api/users → mocks/api/users.json

Press Ctrl+C to stop the server
```

### Step 4: Test API

Open browser and visit `http://localhost:3000/api/users`, or use curl:

```bash
curl http://localhost:3000/api/users
```

Returns:

```json
[
  { "id": 1, "name": "John Doe" },
  { "id": 2, "name": "Jane Smith" }
]
```

## More Features

### Add Dynamic Parameters

Create `mocks/api/user-[id].json`:

```json
{
  "id": "{{$params.id}}",
  "name": "{{$random.name}}",
  "email": "{{$random.email}}"
}
```

Visit: `http://localhost:3000/api/user/123`

### Add POST Endpoint

Create `mocks/api/users.POST.json`:

```json
{
  "$config": {
    "status": 201,
    "delay": 500
  },
  "message": "Created successfully",
  "data": {
    "id": "{{$random.uuid}}",
    "name": "{{$body.name}}",
    "email": "{{$body.email}}"
  }
}
```

Test:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"New User","email":"new@example.com"}'
```

### Enable Hot Reload

Auto-reload when mock files change:

```bash
npx mock-api -w
```

## Integration in Your Project

### Method 1: Run Standalone (Recommended for Development)

Add to `package.json`:

```json
{
  "scripts": {
    "mock": "mock-api -w",
    "dev": "vite",
    "dev:full": "concurrently \"npm run mock\" \"npm run dev\""
  }
}
```

Run: `npm run dev:full`

### Method 2: Vite Plugin (Recommended for Integration)

`vite.config.js`:

```javascript
import { mockPlugin } from 'api-mocker-lite/vite';

export default {
  plugins: [
    mockPlugin({
      enable: true,
      mockDir: './mocks',
      prefix: '/api'
    })
  ]
};
```

Just run `npm run dev`, no separate mock server needed.

## Common Commands

```bash
# Start with defaults
npx mock-api

# Custom port
npx mock-api -p 8080

# Custom directory
npx mock-api -d ./my-mocks

# Add prefix
npx mock-api --prefix /api/v1

# Hot reload mode
npx mock-api -w

# Combined
npx mock-api -p 8080 -d ./mocks --prefix /api -w
```

## Next Steps

- Read [README.md](./README.md) for complete features
- Check [TESTING.md](./TESTING.md) for testing methods
- Refer to [examples/](./examples/) directory for samples
- Read [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for implementation details

## FAQ

**Q: How to simulate delay?**

Add `$config.delay` in mock file:

```json
{
  "$config": { "delay": 1000 },
  "data": {...}
}
```

**Q: How to return error status?**

Add `$config.status` in mock file:

```json
{
  "$config": { "status": 404 },
  "error": "Not Found"
}
```

**Q: What random data types are supported?**

20+ random data types including:
- `{{$random.name}}` - Name
- `{{$random.email}}` - Email
- `{{$random.phone}}` - Phone
- `{{$random.uuid}}` - UUID
- `{{$random.company}}` - Company name
- And more...

See [README.md](./README.md) for complete list.

---

Happy coding! Feel free to open issues if you have questions.
