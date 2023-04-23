const paths = require("./paths");
const { merge } = require("webpack-merge");
const common = require("./common");
const path = require("path");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const ESBuild = require("esbuild");
const { ESBuildMinifyPlugin } = require("esbuild-loader");
const CopyPlugin = require('copy-webpack-plugin');
// 定义压缩文件类型
const productionGzipExtensions = ["js", "css"];
module.exports = merge(common, {
  mode: 'production',
  entry: {
    index: paths.entry,
  },
  devtool: false,
  output: {
    path: paths.build,
    filename: 'static/js/[name].[contenthash:8].js', // 每个输出js的名称
    chunkFilename: 'static/js/[name].js',
    publicPath: './',
    clean: true,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new ESBuildMinifyPlugin({
        target: 'es2015',
        legalComments: 'none', // 去除注释
        css: true, // 压缩 css
        implementation: ESBuild, // 自定义 esbuild instance 实现
      }),
    ],
    splitChunks: {
      chunks: 'all',
      minSize: 20000, // 如果模块大小小于这个值，则不会被分割 20k
      minRemainingSize: 0, // 最小可保存大小，开发模式下为 0，其他情况下等于 minSize，一般不用手动配置
      minChunks: 1, // 如果模块被引用次数小于这个值，则不会被分割
      maxAsyncRequests: 30, // 异步模块，一次最多被加载的次数
      maxInitialRequests: 30, // 入口模块最多被加载的次数
      enforceSizeThreshold: 50000, // 强制分割的大小阈值 50k
      cacheGroups: {
        // 缓存组
        // 打包第三方库
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/, // 正则匹配第三方库文件
          priority: -10, // 优先级
          reuseExistingChunk: true, // 如果一个模块已经被打包过了，那么这个模块也不会被打包
          name: 'vendors', // 打包后的文件名
        },
        // 打包公共模块
        default: {
          minChunks: 2, // 被超过两个模块引用，才会被打包
          priority: -20, // 优先级
          reuseExistingChunk: true, // 如果一个模块已经被打包过了，那么这个模块也不会被打包
          name: 'common', // 打包后的文件名
        },
      },
    },
  },
  plugins: [
    // 复制文件插件
    // public文件一般为静态资源可直接绝对逻辑狗映入不需要解释直接放进构件文件中
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../public'), // 复制public下文件
          to: path.resolve(__dirname, '../build'), // 复制到build目录中
          filter: source => {
            return !source.includes('index.html'); // 忽略index.html
          },
        },
      ],
    }),
    new CompressionWebpackPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
      threshold: 10240,
      minRatio: 0.8,
    }),
  ],
});
