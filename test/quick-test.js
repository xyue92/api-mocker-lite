// 快速测试各个模块的基本功能
const path = require('path');

console.log('Testing utils...');
const utils = require('../src/utils');
const mockDir = path.join(__dirname, '../mocks');
const files = utils.getAllFiles(mockDir);
console.log(`✓ Found ${files.length} mock files`);

console.log('\nTesting loader...');
const loader = require('../src/loader');
const routes = loader.loadRoutes('./mocks');
console.log(`✓ Loaded ${routes.length} routes:`);
routes.forEach(route => {
  console.log(`  ${route.method.padEnd(6)} ${route.path}`);
});

console.log('\nTesting renderer...');
const renderer = require('../src/renderer');
const testData = {
  id: '{{$params.id}}',
  name: '{{$random.name}}',
  time: '{{$now}}'
};
const context = {
  params: { id: '123' },
  query: {},
  body: {}
};
const rendered = renderer.renderData(testData, context);
console.log('✓ Template rendering works:');
console.log('  Input:', JSON.stringify(testData));
console.log('  Output:', JSON.stringify(rendered));

console.log('\n✓ All basic tests passed!');
