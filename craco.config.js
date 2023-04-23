/*
 * @Author: Xiexiaoxuan
 * @Date: 2021-09-26 18:11:09
 * @LastEditors: Xiexiaoxuan
 * @LastEditTime: 2021-10-17 18:14:41
 * @Description: file content
 */

const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const CracoLessPlugin = require('craco-less');
const path = require('path');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');

module.exports = {
  webpack: {
    alias: {
      '@': path.join(__dirname, './src'),
      '@pages': path.join(__dirname, './src/pages'),
      '@img': path.join(__dirname, './src/assets'),
      '@store': path.join(__dirname, './src/store'),
      '@api': path.join(__dirname, './src/api'),
      '@components': path.join(__dirname, './src/components'),
      '@common': path.join(__dirname, './src/common'),
      '@tool': path.join(__dirname, './src/tool'),
    },
    plugins: {
      add: [
        new MonacoWebpackPlugin({
          languages: ['java'],
        }),
        new AntdDayjsWebpackPlugin(),
      ],
    },
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@primary-color': '#3A78F2',
              '@link-color': '#3A78F2',
              '@body-background': '#ececec ',
              '@font-size-base': '12px',
              '@text-color': '#666',
              '@scroll-bg-color': '#fff',
              'table-header-bg': '#f7f8fa',
              'table-header-color': '#666',
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
  devServer: {
    hot: true,
    port: 9999,
    https: false,
    hotOnly: false,
    proxy: {
      '/loc': {
        target: 'http://192.168.0.102:8000',
        changeOrigin: true,
        pathRewrite: {
          '^/loc': '',
        },
      },
    },
  },
};
