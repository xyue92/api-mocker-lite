const fs = require('fs');
const path = require('path');

/**
 * 递归获取目录下的所有文件
 * @param {string} dir - 目录路径
 * @param {string[]} fileList - 文件列表累加器
 * @returns {string[]} - 所有文件的绝对路径数组
 */
function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (stat.isFile() && file.endsWith('.json')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * 从文件名中提取HTTP方法
 * 文件命名规则: filename.METHOD.json 或 filename.json (默认GET)
 * @param {string} filename - 文件名
 * @returns {Object} - { method: 'GET', cleanName: 'filename' }
 */
function extractMethod(filename) {
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  const parts = filename.replace('.json', '').split('.');

  // 检查最后一部分是否是HTTP方法
  const lastPart = parts[parts.length - 1].toUpperCase();
  if (methods.includes(lastPart)) {
    return {
      method: lastPart,
      cleanName: parts.slice(0, -1).join('.')
    };
  }

  return {
    method: 'GET',
    cleanName: parts.join('.')
  };
}

/**
 * 将文件路径转换为URL路径
 * 处理动态参数: [id] -> :id
 * @param {string} filePath - 文件的绝对路径
 * @param {string} mockDir - mock文件的根目录
 * @returns {string} - URL路径
 */
function filePathToUrlPath(filePath, mockDir) {
  const relativePath = path.relative(mockDir, filePath);
  const { cleanName } = extractMethod(path.basename(filePath));
  const dirPath = path.dirname(relativePath);

  // 组合目录路径和文件名（不含扩展名）
  let urlPath = dirPath === '.' ? cleanName : path.join(dirPath, cleanName);

  // 规范化路径分隔符为 /
  urlPath = urlPath.split(path.sep).join('/');

  // 处理动态参数: user-[id] -> user/:id
  urlPath = urlPath.replace(/-\[([^\]]+)\]/g, '/:$1');

  // 确保以 / 开头
  if (!urlPath.startsWith('/')) {
    urlPath = '/' + urlPath;
  }

  return urlPath;
}

/**
 * 安全读取JSON文件
 * @param {string} filePath - 文件路径
 * @returns {any} - JSON对象或null
 */
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to read or parse ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 深度克隆对象
 * @param {any} obj - 要克隆的对象
 * @returns {any} - 克隆后的对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }

  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * 标准化路径前缀
 * @param {string} prefix - 路径前缀
 * @returns {string} - 标准化后的前缀
 */
function normalizePrefix(prefix) {
  if (!prefix) return '';

  // 确保以 / 开头
  if (!prefix.startsWith('/')) {
    prefix = '/' + prefix;
  }

  // 确保不以 / 结尾
  if (prefix.endsWith('/')) {
    prefix = prefix.slice(0, -1);
  }

  return prefix;
}

module.exports = {
  getAllFiles,
  extractMethod,
  filePathToUrlPath,
  readJsonFile,
  deepClone,
  normalizePrefix
};
