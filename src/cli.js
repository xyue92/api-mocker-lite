#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const { startMockServer } = require('./server');
const packageJson = require('../package.json');

const program = new Command();

program
  .name('mock-api')
  .description('Lightweight local API mock tool for frontend developers')
  .version(packageJson.version)
  .option('-p, --port <number>', 'Port number', '3000')
  .option('-d, --dir <path>', 'Mock files directory', './mocks')
  .option('--prefix <path>', 'API path prefix (e.g., /api)', '')
  .option('-w, --watch', 'Watch for file changes and reload', false)
  .action(async (options) => {
    try {
      const port = parseInt(options.port, 10);

      if (isNaN(port) || port < 1 || port > 65535) {
        console.error(chalk.red('\n✗ Invalid port number. Must be between 1 and 65535\n'));
        process.exit(1);
      }

      await startMockServer({
        port,
        mockDir: options.dir,
        prefix: options.prefix,
        watch: options.watch
      });

      console.log(chalk.gray('Press Ctrl+C to stop the server\n'));
    } catch (error) {
      console.error(chalk.red('\n✗ Failed to start server:'), error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
