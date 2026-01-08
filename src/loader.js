const path = require('path');
const { getAllFiles, extractMethod, filePathToUrlPath, readJsonFile } = require('./utils');

/**
 * 加载mock文件并生成路由配置
 * @param {string} mockDir - mock文件目录
 * @param {string} prefix - URL前缀
 * @returns {Array} - 路由配置数组
 */
function loadRoutes(mockDir, prefix = '') {
  const absoluteMockDir = path.resolve(process.cwd(), mockDir);
  const files = getAllFiles(absoluteMockDir);

  const routes = files.map((filePath) => {
    const filename = path.basename(filePath);
    const { method } = extractMethod(filename);
    const urlPath = filePathToUrlPath(filePath, absoluteMockDir);
    const fullPath = prefix + urlPath;

    return {
      method,
      path: fullPath,
      filePath,
      urlPath
    };
  });

  // 按路径长度降序排序，确保更具体的路由优先匹配
  // 例如 /user/:id/profile 应该在 /user/:id 之前
  routes.sort((a, b) => {
    const aDepth = a.path.split('/').length;
    const bDepth = b.path.split('/').length;
    if (aDepth !== bDepth) {
      return bDepth - aDepth;
    }
    // 如果深度相同，优先匹配静态路由（不含:的）
    const aHasParam = a.path.includes(':');
    const bHasParam = b.path.includes(':');
    if (aHasParam !== bHasParam) {
      return aHasParam ? 1 : -1;
    }
    return 0;
  });

  return routes;
}

/**
 * 从mock文件加载响应数据
 * @param {string} filePath - 文件路径
 * @returns {Object} - { data, config }
 */
function loadMockData(filePath) {
  const rawData = readJsonFile(filePath);

  if (rawData === null) {
    return {
      data: { error: 'Failed to load mock data' },
      config: { status: 500 }
    };
  }

  // 检查是否是完整模式（包含$config）
  if (rawData.$config) {
    const { $config, ...data } = rawData;
    return {
      data,
      config: $config
    };
  }

  // 简单模式，直接返回数据
  return {
    data: rawData,
    config: {}
  };
}

module.exports = {
  loadRoutes,
  loadMockData
};
