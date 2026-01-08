// Express中间件集成示例

const express = require('express');
const { createMockMiddleware } = require('../src/middleware');

const app = express();
const PORT = 3001;

// 添加mock中间件
app.use(createMockMiddleware({
  mockDir: '../mocks',
  prefix: '/api',
  enable: process.env.NODE_ENV !== 'production'
}));

// 你的其他路由
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send(`
    <h1>Express + API Mocker Lite</h1>
    <h2>Mock API Endpoints:</h2>
    <ul>
      <li><a href="/api/users">GET /api/users</a></li>
      <li><a href="/api/user/123">GET /api/user/123</a></li>
      <li><a href="/api/products/list">GET /api/products/list</a></li>
      <li><a href="/api/search?q=test">GET /api/search?q=test</a></li>
    </ul>
    <h2>Other Endpoints:</h2>
    <ul>
      <li><a href="/health">GET /health</a></li>
    </ul>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
