const { createMockMiddleware } = require('./middleware');

/**
 * Vite插件，在开发服务器中集成mock API
 * @param {Object} options - 插件配置
 * @param {boolean} options.enable - 是否启用插件
 * @param {string} options.mockDir - mock文件目录
 * @param {string} options.prefix - API路径前缀
 * @returns {Object} Vite插件对象
 */
function mockPlugin(options = {}) {
  const {
    enable = true,
    mockDir = './mocks',
    prefix = '/api'
  } = options;

  return {
    name: 'vite-plugin-api-mocker-lite',

    configureServer(server) {
      if (!enable) {
        return;
      }

      const middleware = createMockMiddleware({
        mockDir,
        prefix,
        enable
      });

      // 将mock中间件添加到Vite开发服务器
      server.middlewares.use(middleware);

      console.log('\n✓ API Mock plugin enabled');
      console.log(`  Mock Dir: ${mockDir}`);
      console.log(`  Prefix: ${prefix}\n`);
    }
  };
}

module.exports = {
  mockPlugin
};
