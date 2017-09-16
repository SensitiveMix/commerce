var webpack = require('webpack')
var path = require('path')
var Ex = require('extract-text-webpack-plugin')

var publicPath = 'http://localhost:3000/'
var hotMiddlewareScript = 'webpack-hot-middleware/client?reload=true'

var devConfig = {
  entry: {
    public_js_build: ['./public/js/', hotMiddlewareScript],
    public_web_build: ['./public/js/jquery.gridly.js', hotMiddlewareScript],
    public_cookie_build: ['./public/js/web/jquery.cookie.js', hotMiddlewareScript],
    public_css_build: ['./public/stylesheets/', hotMiddlewareScript]
  },
  output: {
    filename: './[name]/bundle.js',
    path: path.resolve(__dirname, './public'),
    publicPath: publicPath
  },
  externals: {
    jquery: 'jQuery'
  },
  devtool: 'eval-source-map',
  module: {
    loaders: [{
      test: /\.(png|jpg|gif)$/,
      loader: 'url-loader?limit=8192&context=public&name=[path][name].[ext]'
    }, {
      test: /\.scss$/,
      loader: 'style-loader!css?sourceMap!resolve-url!sass?sourceMap'
    }, {
      test: /\.json$/,
      loader: 'json'
    }, {
      test: /\.(png|woff|woff2|eot|ttf|svg)$/,
      loader: 'url-loader?limit=100000&name=icons/[name].[ext]'
    }, {
      test: /\.css$/,
      loader: ['style-loader', 'css-loader', 'resolve-url-loader']
    }, {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'url-loader?limit=10000&mimetype=application/font-woff&name=icons/[name].[ext]'
    }, {
      test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file-loader?name=icons/[name].[ext]'
    }]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new Ex('public_css_build/styles.css'),
    new webpack.NoErrorsPlugin()
  ]
}

module.exports = devConfig
