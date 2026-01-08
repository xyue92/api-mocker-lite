# api-mocker-lite Project Summary

## Project Overview

api-mocker-lite is a lightweight API mock tool designed to solve the problem of frontend developers waiting for backend APIs. Through simple file naming conventions, frontend developers can quickly create mock API responses.

## Core Features

### 1. Zero Configuration Startup
- No configuration files needed
- Run `npx mock-api` to start
- Default port 3000, default directory ./mocks

### 2. File Naming Conventions
- `users.json` → GET /api/users
- `users.POST.json` → POST /api/users
- `user-[id].json` → GET /api/user/:id
- Supports nested directory structures

### 3. Dynamic Data Templates
- `{{$params.id}}` - Path parameters
- `{{$query.keyword}}` - Query parameters
- `{{$body.name}}` - Request body data
- `{{$now}}` - Current timestamp
- `{{$random.*}}` - Various random data (names, emails, phone numbers, etc.)

### 4. Response Configuration
```json
{
  "$config": {
    "delay": 500,    // Response delay
    "status": 201    // HTTP status code
  },
  "data": {...}
}
```

### 5. Multiple Usage Modes
- CLI tool: Run standalone
- Express middleware: Integrate into existing Express apps
- Vite plugin: Seamlessly integrate into Vite projects

## Project Structure

```
api-mocker-lite/
├── src/
│   ├── cli.js              # CLI entry point, handles command-line args
│   ├── server.js           # Express server core
│   ├── loader.js           # File scanning and route mapping logic
│   ├── renderer.js         # Template syntax parsing and rendering
│   ├── middleware.js       # Express middleware export
│   ├── vite-plugin.js      # Vite plugin implementation
│   └── utils.js            # Utility functions
├── mocks/                  # Example mock files
│   └── api/
│       ├── users.json
│       ├── users.POST.json
│       ├── user-[id].json
│       ├── user-[id].DELETE.json
│       ├── search.json
│       └── products/
│           └── list.json
├── test/                   # Test files
│   ├── quick-test.js       # Quick functionality tests
│   └── test-server.js      # Server tests
├── examples/               # Usage examples
│   ├── express-integration.js
│   ├── vite.config.example.js
│   └── package.json.example
├── package.json
├── README.md               # Complete documentation
├── TESTING.md              # Testing documentation
└── .gitignore
```

## Core Module Descriptions

### utils.js
Provides basic utility functions:
- `getAllFiles()` - Recursively get all .json files
- `extractMethod()` - Extract HTTP method from filename
- `filePathToUrlPath()` - Convert file path to URL path
- `readJsonFile()` - Safely read JSON files
- `deepClone()` - Deep clone objects
- `normalizePrefix()` - Normalize path prefix

### loader.js
Responsible for loading and parsing mock files:
- `loadRoutes()` - Scan directory and generate route configurations
- `loadMockData()` - Load mock data and parse $config

### renderer.js
Template rendering engine:
- `renderData()` - Recursively render all templates in data
- `resolveTemplate()` - Parse single template string
- `createContext()` - Create rendering context
- Integrates Faker.js for random data generation

### server.js
Express server core:
- `createMockServer()` - Create server instance
- `startMockServer()` - Start server
- Auto-register routes
- Request logging middleware
- File watching and hot reload (optional)

### cli.js
Command-line tool:
- Uses Commander to parse arguments
- Supports custom port, directory, prefix
- Supports file watch mode
- Colorful output (chalk)

### middleware.js
Express middleware:
- Can be integrated into existing Express apps
- Supports conditional enabling
- Route matching and parameter parsing

### vite-plugin.js
Vite plugin:
- Integrates mock functionality in Vite dev server
- No separate mock server needed

## Technical Implementation Highlights

### 1. Smart Route Sorting
Routes are sorted by path depth and whether they contain dynamic parameters, ensuring more specific routes match first:
```javascript
routes.sort((a, b) => {
  const aDepth = a.path.split('/').length;
  const bDepth = b.path.split('/').length;
  if (aDepth !== bDepth) return bDepth - aDepth;

  const aHasParam = a.path.includes(':');
  const bHasParam = b.path.includes(':');
  if (aHasParam !== bHasParam) return aHasParam ? 1 : -1;

  return 0;
});
```

### 2. Safe Template Rendering
No arbitrary JavaScript code execution, only predefined template variables supported:
```javascript
template.replace(/\{\{(.+?)\}\}/g, (match, expression) => {
  // Only handle predefined variable types
  if (expr === '$now') return new Date().toISOString();
  if (expr.startsWith('$random.')) return randomGenerator();
  // ...
});
```

### 3. Hot Reload Implementation
Uses chokidar to watch file changes and dynamically update routes:
```javascript
watcher.on('all', (event, filePath) => {
  loadAllRoutes();  // Reload all routes
  console.log('Routes reloaded');
});
```

### 4. Deep Clone to Avoid Data Pollution
Deep clone original data before each render to avoid permanent template variable replacement.

## Use Cases

### Case 1: Backend APIs Not Ready
Frontend developers can quickly create mock data based on API documentation without waiting for backend development to complete.

### Case 2: Rapid Prototyping
Quickly build interactive prototypes during requirements discussion phase.

### Case 3: Frontend Unit Testing
Provide stable, controllable API responses for frontend testing.

### Case 4: Demos and Presentations
Demo frontend functionality anytime, anywhere without depending on real backend.

## Tested Features

✅ All REST methods (GET/POST/PUT/DELETE/PATCH)
✅ Static routes
✅ Dynamic path parameters
✅ Query parameters
✅ Request body data
✅ Template variable substitution
✅ Random data generation
✅ Response delay
✅ Custom status codes
✅ CORS support
✅ Request logging
✅ CLI commands
✅ File hot reload
✅ Express middleware
✅ Vite plugin

## Performance Characteristics

- Lightweight: Core code under 1000 lines
- Fast startup: Usually starts within 1 second
- Low memory footprint: Suitable for long-running in dev environment
- Supports many routes: Tested with 100+ routes without performance issues

## Future Improvements

1. **TypeScript Support**
   - Provide complete type definitions
   - Support .ts config files

2. **Advanced Template Syntax**
   - Conditional rendering: `{{#if condition}}...{{/if}}`
   - Loops: `{{#each items}}...{{/each}}`
   - Custom functions

3. **Response Recording**
   - Record real API responses
   - Auto-generate mock files

4. **Request Validation**
   - Validate request parameters
   - Return validation errors

5. **Mock Data Management UI**
   - Web UI to view and edit mock data
   - Visual route management

6. **Multi-Environment Support**
   - Support different environment mock data
   - Environment switching

7. **GraphQL Support**
   - Support GraphQL query mocks

## Dependencies

### Runtime Dependencies
- `express` - HTTP server framework
- `cors` - CORS middleware
- `commander` - CLI argument parsing
- `chalk` - Colorful command-line output
- `chokidar` - File watching
- `@faker-js/faker` - Random data generation

### Characteristics
- No compilation needed, pure Node.js implementation
- Minimum Node.js version: 14.0.0
- All dependencies are popular, stable libraries

## Development Guide

### Local Development
```bash
# Clone project
git clone <repo-url>

# Install dependencies
npm install

# Run tests
node test/quick-test.js

# Start test server
node test/test-server.js
```

### Add New Random Data Types

In `src/renderer.js` add to `getRandomGenerators()` function:

```javascript
function getRandomGenerators() {
  return {
    // Existing...
    customType: () => faker.xxx.yyy(),
  };
}
```

### Add New Built-in Variables

In `src/renderer.js` add to `resolveTemplate()` function:

```javascript
if (expr === '$myVariable') {
  return computeMyVariable();
}
```

## Contributing Guidelines

Contributions of code, bug reports, and new feature suggestions are welcome!

1. Fork the project
2. Create a feature branch
3. Commit your code
4. Create a Pull Request

## License

MIT License - Free to use in commercial and non-commercial projects

## Summary

api-mocker-lite is a simple yet powerful API mock tool that uses convention over configuration design principles to enable frontend developers to quickly set up mock services. The project code is clean, easy to understand and extend, making it suitable as a reference for learning Express, CLI tool development, and template engine implementation.
