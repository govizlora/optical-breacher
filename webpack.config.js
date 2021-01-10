const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const WebpackPwaManifest = require('webpack-pwa-manifest')

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
      ],
    }),
    new WebpackPwaManifest({
      name: 'Optical Breacher Mk.1',
      short_name: 'Optical Breacher',
      description:
        'Cyberpunk 2077 breach protocol minigame solver using camera + OCR',
      background_color: '#fcee0a', // For splash screen
      orientation: 'portrait',
      display: 'standalone',
      inject: true,
      scope: '.',
      theme_color: '#100606', // For title bar
      start_url: './index.html',
      publicPath: '.',
      icons: [
        {
          src: path.resolve('assets/app-icon-maskable.png'),
          sizes: [1024],
          destination: 'lib',
          purpose: 'maskable',
        },
        {
          src: path.resolve('assets/app-icon.png'),
          sizes: [96, 128, 192, 256, 384, 512, 1024],
          ios: true,
          destination: 'lib',
        },
      ],
      ios: {
        'apple-mobile-web-app-title': 'Optical Breacher Mk.1',
        'apple-mobile-web-app-status-bar-style': 'black-translucent',
        'apple-mobile-web-app-capable': 'yes',
      },
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
    // host: 'localhost'
    useLocalIp: true,
    http2: true,
    // Accessing camera requires HTTPS
    https: true,
  },
})
