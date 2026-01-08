const { faker } = require('@faker-js/faker');
const { deepClone } = require('./utils');

/**
 * 模板变量解析器
 * 支持的变量:
 * - {{$params.id}} - 路径参数
 * - {{$query.keyword}} - 查询参数
 * - {{$body.name}} - 请求体数据
 * - {{$now}} - 当前时间
 * - {{$random.uuid}} - 随机UUID
 * - {{$random.name}} - 随机姓名
 * - {{$random.email}} - 随机邮箱
 * - {{$random.phone}} - 随机电话
 * - {{$random.number}} - 随机数字
 * - {{$random.boolean}} - 随机布尔值
 */

/**
 * 获取随机数据生成器
 * @returns {Object} - 随机数据生成函数集合
 */
function getRandomGenerators() {
  return {
    uuid: () => faker.string.uuid(),
    name: () => faker.person.fullName(),
    email: () => faker.internet.email(),
    phone: () => faker.phone.number(),
    number: () => faker.number.int({ min: 1, max: 1000 }),
    boolean: () => faker.datatype.boolean(),
    avatar: () => faker.image.avatar(),
    url: () => faker.internet.url(),
    date: () => faker.date.recent().toISOString(),
    text: () => faker.lorem.sentence(),
    paragraph: () => faker.lorem.paragraph(),
    word: () => faker.lorem.word(),
    company: () => faker.company.name(),
    address: () => faker.location.streetAddress(),
    city: () => faker.location.city(),
    country: () => faker.location.country(),
    zipCode: () => faker.location.zipCode(),
    color: () => faker.color.human()
  };
}

/**
 * 解析模板变量
 * @param {string} template - 模板字符串
 * @param {Object} context - 上下文数据 { params, query, body }
 * @returns {any} - 解析后的值
 */
function resolveTemplate(template, context) {
  if (typeof template !== 'string') {
    return template;
  }

  const randomGenerators = getRandomGenerators();

  // 替换模板变量
  return template.replace(/\{\{(.+?)\}\}/g, (match, expression) => {
    const expr = expression.trim();

    // {{$now}} - 当前时间
    if (expr === '$now') {
      return new Date().toISOString();
    }

    // {{$random.xxx}} - 随机数据
    if (expr.startsWith('$random.')) {
      const randomType = expr.substring(8); // 去掉 '$random.'
      const generator = randomGenerators[randomType];
      if (generator) {
        return generator();
      }
      console.warn(`Unknown random type: ${randomType}`);
      return match;
    }

    // {{$params.xxx}} - 路径参数
    if (expr.startsWith('$params.')) {
      const key = expr.substring(8);
      return context.params?.[key] ?? match;
    }

    // {{$query.xxx}} - 查询参数
    if (expr.startsWith('$query.')) {
      const key = expr.substring(7);
      return context.query?.[key] ?? match;
    }

    // {{$body.xxx}} - 请求体数据
    if (expr.startsWith('$body.')) {
      const key = expr.substring(6);
      return context.body?.[key] ?? match;
    }

    console.warn(`Unknown template expression: ${expr}`);
    return match;
  });
}

/**
 * 递归渲染对象中的所有模板
 * @param {any} data - 要渲染的数据
 * @param {Object} context - 上下文数据
 * @returns {any} - 渲染后的数据
 */
function renderData(data, context) {
  // 深度克隆以避免修改原始数据
  const cloned = deepClone(data);

  function render(obj) {
    if (typeof obj === 'string') {
      return resolveTemplate(obj, context);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => render(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const result = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          result[key] = render(obj[key]);
        }
      }
      return result;
    }

    return obj;
  }

  return render(cloned);
}

/**
 * 创建请求上下文
 * @param {Object} req - Express request对象
 * @returns {Object} - 上下文对象
 */
function createContext(req) {
  return {
    params: req.params || {},
    query: req.query || {},
    body: req.body || {}
  };
}

module.exports = {
  renderData,
  createContext,
  resolveTemplate
};
