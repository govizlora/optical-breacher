const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = (env) => ({
  mode: !!env.production ? 'production' : 'development',
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /(\.jpg|tesseract-core\.wasm\.js|worker\.min\.js|\.woff2)$/i,
        loader: 'file-loader',
        options: {
          name: 'lib/[name].[contenthash].[ext]',
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      favicon: 'assets/favicon.svg',
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'lib/cyber.traineddata.gz',
          to: 'lib/cyber.traineddata.gz',
        },
        {
          from: 'src/manifest.webmanifest',
          to: 'manifest.webmanifest',
        },
        {
          from: 'assets/app-icon.png',
          to: 'lib/app-icon.png'
        },
        {
          from: 'assets/app-icon-maskable.png',
          to: 'lib/app-icon-maskable.png'
        }
      ],
    }),
    new WorkboxPlugin.GenerateSW({
      // these options encourage the ServiceWorkers to get in there fast
      // and not allow any straggling "old" SWs to hang around
      clientsClaim: true,
      skipWaiting: true,
      maximumFileSizeToCacheInBytes: 4096 * 1024,
      additionalManifestEntries: [
        { url: 'index.html', revision: `${Date.now()}` },
      ],
    }),
  ],
  devServer: {
    port: 1234,
    historyApiFallback: true,
    host: 'localhost'
    // useLocalIp: true,
    // http2: true,
    // Accessing camera requires HTTPS
    // https: true,
  },
})
