//根目录创建config-overrides.js, 修改默认配置
const { override, fixBabelImports, addWebpackAlias } = require('customize-cra')
const { resolve } = require('path')

module.exports = override(
  fixBabelImports('import', {
    //antd按需加载
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: 'css',
  }),
  addWebpackAlias({
    ['@']: resolve('src'),
  })
)
