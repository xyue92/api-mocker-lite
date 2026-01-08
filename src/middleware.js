const express = require('express');
const path = require('path');
const { loadRoutes, loadMockData } = require('./loader');
const { renderData, createContext } = require('./renderer');
const { normalizePrefix } = require('./utils');

/**
 * 创建Express中间件用于mock API
 * @param {Object} options - 中间件配置
 * @param {string} options.mockDir - mock文件目录，相对于项目根目录
 * @param {string} options.prefix - API路径前缀
 * @param {boolean} options.enable - 是否启用中间件
 * @returns {Function} Express中间件函数
 */
function createMockMiddleware(options = {}) {
  const {
    mockDir = './mocks',
    prefix = '',
    enable = true
  } = options;

  if (!enable) {
    return (req, res, next) => next();
  }

  const normalizedPrefix = normalizePrefix(prefix);
  const routes = loadRoutes(mockDir, normalizedPrefix);

  // 创建路由匹配函数
  function matchRoute(method, path) {
    return routes.find((route) => {
      if (route.method !== method.toUpperCase()) {
        return false;
      }

      // 将Express路由格式转换为正则表达式
      const pattern = route.path
        .replace(/\//g, '\\/')
        .replace(/:([^/]+)/g, '([^/]+)');

      const regex = new RegExp(`^${pattern}$`);
      return regex.test(path);
    });
  }

  // 解析路径参数
  function parseParams(routePath, requestPath) {
    const routeParts = routePath.split('/');
    const pathParts = requestPath.split('/');
    const params = {};

    routeParts.forEach((part, index) => {
      if (part.startsWith(':')) {
        const paramName = part.substring(1);
        params[paramName] = pathParts[index];
      }
    });

    return params;
  }

  return async (req, res, next) => {
    const route = matchRoute(req.method, req.path);

    if (!route) {
      return next();
    }

    try {
      // 解析路径参数
      req.params = parseParams(route.path, req.path);

      // 加载mock数据
      const { data, config } = loadMockData(route.filePath);

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
      console.error('Mock middleware error:', error);
      res.status(500).json({
        error: 'Mock middleware error',
        message: error.message
      });
    }
  };
}

module.exports = {
  createMockMiddleware
};
