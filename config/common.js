const paths = require('./paths');
const path = require('path');

const webpack = require('webpack');
const WebpackBar = require('webpackbar');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
var CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

let modifyVars = {
  'primary-color': '#3A78F2',
  'link-color': '#3A78F2',
  'font-size-base': '12px',
  'text-color': '#000000D9',
  'menu-item-font-size': '14px',
  'table-header-bg': '#f7f8fa',
  'table-header-color': '#666',
  'scroll-bg-color': '#666',
};

module.exports = {
  entry: paths.entry,
  output: {
    path: paths.build,
    filename: '[name].js',
    publicPath: '/',
    clean: true,
    crossOriginLoading: 'anonymous',
    module: true,
    environment: {
      arrowFunction: true,
      bigIntLiteral: false,
      const: true,
      destructuring: true,
      dynamicImport: false,
      forOf: true,
    },
  },
  cache: {
    type: 'memory', // 使用文件缓存,持久化缓存
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@': path.join(__dirname, '../src'),
      '@pages': path.join(__dirname, '../src/pages'),
      '@img': path.join(__dirname, '../src/assets'),
      '@store': path.join(__dirname, '../src/store'),
      '@api': path.join(__dirname, '../src/api'),
      '@components': path.join(__dirname, '../src/components'),
      '@common': path.join(__dirname, '../src/common'),
      '@tool': path.join(__dirname, '../src/tool'),
      'react/jsx-runtime': 'react/jsx-runtime.js',
    },
  },
  experiments: {
  //   topLevelAwait: true,
    outputModule: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'jsx',
          target: 'es2018',
          jsx: 'automatic',
          tsconfigRaw: {},
          // implementation: esbuild, // 自定义 esbuild 版本
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(css|less)$/i,
        use: [
          // "style-loader",
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                modifyVars: modifyVars,
                javascriptEnabled: true,
              },
            },
          },
          {
            loader: 'style-resources-loader',
            options: {
              patterns: [path.resolve('./style/index.less')],
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 1, // 图片不处理为base64
          },
        },
        generator: {
          filename: 'static/image/[hash:10][ext][query]',
        },
      },
      {
        test: /\.(ttf|woff2?|eot|mp3|mp4|avi)$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/resources/[hash:8][ext][query]',
        },
      },
    ],
  },
  plugins: [
    // 依赖包可视化
    // new BundleAnalyzerPlugin(),
    new WebpackBar(),

    new MiniCssExtractPlugin({
      filename: 'static/css/[name].css',
      chunkFilename: 'static/css/[id].css',
      ignoreOrder: true,
    }),

    new webpack.ProvidePlugin({
      React: 'react',
    }),

    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),

    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),

    new CaseSensitivePathsPlugin(),

    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html'), // 模板取定义root节点的模板
      inject: true, // 自动注入静态资源
    }),

    new MonacoWebpackPlugin({
      languages: ['java'],
    }),

    new AntdDayjsWebpackPlugin(),
  ],
};
