const path = require('path')
let file = "index.js"

module.exports = {
  public: path.resolve(__dirname, '../public'),
  src: path.resolve(__dirname, '../src'),
  build: path.resolve(__dirname, '../build'),
  entry: path.resolve(__dirname, `../src/${file}`),
};