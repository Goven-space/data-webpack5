const paths = require("./paths");
const common = require("./common");
const { merge } = require("webpack-merge");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const port = 8083;

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-source-map',
  devServer: {
    client: {
      overlay: false,
    },
    compress: true,
    historyApiFallback: true,
    hot: true,
    open: false,
    port,
    host: '0.0.0.0',
  },
  plugins: [
    new FriendlyErrorsWebpackPlugin({
      compilationSuccessInfo: {
        messages: ['Project is running at:', `Local: http://localhost:${port}/`, `Network:  http://${require('ip').address()}:${port}/`],
      },
    }),
    new HtmlWebpackPlugin({
      template: `${paths.public}/index.html`,
      filename: 'index.html',
    }),
    new ReactRefreshWebpackPlugin(), // 添加热更新插件 ,不需要刷新浏览器的前提下模块热更新,优于devserver
  ],
});
