const { startMockServer } = require('../src/server');

async function test() {
  console.log('Starting mock server for testing...\n');

  try {
    const { server } = await startMockServer({
      port: 3000,
      mockDir: './mocks',
      watch: false
    });

    console.log('\nServer started successfully!');
    console.log('\nYou can now test the API:');
    console.log('  GET  http://localhost:3000/api/users');
    console.log('  GET  http://localhost:3000/api/user/123');
    console.log('  GET  http://localhost:3000/api/products/list');
    console.log('  GET  http://localhost:3000/api/search?q=test');
    console.log('\nPress Ctrl+C to stop the server\n');

    // Keep the server running
    process.on('SIGINT', () => {
      console.log('\nShutting down server...');
      server.close(() => {
        console.log('Server stopped');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

test();
