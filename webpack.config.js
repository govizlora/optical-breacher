const path = require('path');
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
        test: /(\.gz|\.jpg|tesseract-core\.wasm\.js|worker\.min\.js|\.woff2)$/i,
        loader: 'file-loader',
        options: {
          name: 'lib/[name].[ext]',
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
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
    // Accessing camera requires HTTPS
    https: true,
  }
});