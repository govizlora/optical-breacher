const path = require('path');
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = env => ({
  mode: !!env.production ? 'production' : 'development',
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      },
      {
        test: /\.(gz)$/i,
        loader: 'file-loader',
        options: {
          name: 'lib/[name].[ext]',
        },
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },
  plugins: [new HtmlWebpackPlugin({ template: 'src/index.html' })],
  devServer: {
    port: 1234,
    historyApiFallback: true,
    useLocalIp: true,
    http2: true,
    https: {
      key: fs.readFileSync('./certs/server.key'),
      cert: fs.readFileSync('./certs/server.crt'),
    }
  }
});