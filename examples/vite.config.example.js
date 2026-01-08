// Vite插件集成示例
// 将此文件重命名为 vite.config.js 并在Vite项目中使用

import { defineConfig } from 'vite';
import { mockPlugin } from 'api-mocker-lite/vite';

export default defineConfig({
  plugins: [
    mockPlugin({
      // 仅在开发环境启用
      enable: process.env.NODE_ENV === 'development',
      // mock文件目录
      mockDir: './mocks',
      // API路径前缀
      prefix: '/api'
    })
  ],
  server: {
    port: 5173
  }
});
