const express = require('express');
const cors = require('cors');
const chalk = require('chalk');
const chokidar = require('chokidar');
const path = require('path');
const { loadRoutes, loadMockData } = require('./loader');
const { renderData, createContext } = require('./renderer');
const { normalizePrefix } = require('./utils');

/**
 * 创建Mock服务器
 * @param {Object} options - 服务器配置
 * @param {string} options.mockDir - mock文件目录
 * @param {string} options.prefix - URL前缀
 * @param {number} options.port - 端口号
 * @param {boolean} options.watch - 是否监听文件变化
 * @returns {Object} - { app, server, reload }
 */
function createMockServer(options = {}) {
  const {
    mockDir = './mocks',
    prefix = '',
    port = 3000,
    watch = false
  } = options;

  const app = express();
  const normalizedPrefix = normalizePrefix(prefix);

  // 中间件
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 请求日志中间件
  app.use((req, res, next) => {
    const startTime = Date.now();

    // 记录响应
    const originalSend = res.send;
    res.send = function (data) {
      const duration = Date.now() - startTime;
      const statusColor = res.statusCode >= 400 ? 'red' : 'green';

      console.log(
        chalk.gray(`[${new Date().toLocaleTimeString()}]`),
        chalk.cyan(req.method.padEnd(6)),
        chalk.white(req.path),
        chalk[statusColor](res.statusCode),
        chalk.gray(`${duration}ms`)
      );

      originalSend.call(this, data);
    };

    next();
  });

  let routes = [];

  /**
   * 加载或重新加载路由
   */
  function loadAllRoutes() {
    // 清除所有现有路由（除了中间件）
    app._router.stack = app._router.stack.filter(
      (layer) => !layer.route
    );

    // 加载新路由
    routes = loadRoutes(mockDir, normalizedPrefix);

    // 注册路由
    routes.forEach((route) => {
      const { method, path, filePath } = route;

      app[method.toLowerCase()](path, async (req, res) => {
        try {
          // 加载mock数据
          const { data, config } = loadMockData(filePath);

          // 创建渲染上下文
          const context = createContext(req);

          // 渲染数据
          const renderedData = renderData(data, context);

          // 应用配置
          const delay = config.delay || 0;
          const status = config.status || 200;

          // 模拟延迟
          if (delay > 0) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }

          // 发送响应
          res.status(status).json(renderedData);
        } catch (error) {
          console.error(chalk.red('Error handling request:'), error);
          res.status(500).json({
            error: 'Internal server error',
            message: error.message
          });
        }
      });
    });

    // 404处理
    app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        availableRoutes: routes.map(r => `${r.method} ${r.path}`)
      });
    });

    return routes;
  }

  // 初始加载
  const initialRoutes = loadAllRoutes();

  // 打印路由信息
  function printRoutes() {
    console.log(chalk.bold.green('\n✓ Mock server routes loaded:\n'));

    if (routes.length === 0) {
      console.log(chalk.yellow('  No mock files found in'), chalk.cyan(mockDir));
      console.log(chalk.gray('  Create .json files to define mock APIs\n'));
      return;
    }

    const methodColors = {
      GET: 'green',
      POST: 'yellow',
      PUT: 'blue',
      DELETE: 'red',
      PATCH: 'magenta'
    };

    routes.forEach((route) => {
      const methodColor = methodColors[route.method] || 'white';
      console.log(
        '  ',
        chalk[methodColor](route.method.padEnd(6)),
        chalk.cyan(route.path),
        chalk.gray(`→ ${path.relative(process.cwd(), route.filePath)}`)
      );
    });
    console.log();
  }

  printRoutes();

  // 文件监听
  if (watch) {
    const absoluteMockDir = path.resolve(process.cwd(), mockDir);
    const watcher = chokidar.watch(`${absoluteMockDir}/**/*.json`, {
      ignoreInitial: true,
      persistent: true
    });

    watcher.on('all', (event, filePath) => {
      console.log(chalk.yellow(`\n⟳ File ${event}: ${path.relative(process.cwd(), filePath)}`));
      loadAllRoutes();
      console.log(chalk.green('✓ Routes reloaded\n'));
    });

    console.log(chalk.blue('👀 Watching for file changes...\n'));
  }

  return {
    app,
    routes: initialRoutes,
    reload: loadAllRoutes,
    printRoutes
  };
}

/**
 * 启动Mock服务器
 * @param {Object} options - 服务器配置
 * @returns {Promise<Object>} - { app, server, url }
 */
function startMockServer(options = {}) {
  return new Promise((resolve, reject) => {
    const { port = 3000 } = options;
    const { app, routes, reload, printRoutes } = createMockServer(options);

    const server = app.listen(port, () => {
      const url = `http://localhost:${port}`;

      console.log(chalk.bold.cyan('\n🚀 Mock API Server Started!\n'));
      console.log(chalk.white('  Local:   '), chalk.cyan(url));
      console.log(chalk.white('  Mock Dir:'), chalk.cyan(options.mockDir || './mocks'));
      if (options.prefix) {
        console.log(chalk.white('  Prefix:  '), chalk.cyan(options.prefix));
      }
      console.log();

      resolve({ app, server, url, routes, reload, printRoutes });
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(chalk.red(`\n✗ Port ${port} is already in use\n`));
      } else {
        console.error(chalk.red('\n✗ Server error:'), error);
      }
      reject(error);
    });
  });
}

module.exports = {
  createMockServer,
  startMockServer
};
