const path = require('path');
var webpack = require('webpack')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const FORMBUILDER_URL = "./scripts";
const SRC_URL = FORMBUILDER_URL + "/src";
const DEST_URL = FORMBUILDER_URL + "/dist";

module.exports = {
  entry: {
    app: ["babel-polyfill", SRC_URL + '/index']
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor.bundle",
          chunks: "initial"
        }
      }
    }
  },
  output: {
    path: path.resolve(DEST_URL),
    publicPath: '/',
    filename: "[name].[chunkhash].js"
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css"
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use:
          [
            {
              'loader': 'babel-loader',
              options: {
                "cacheDirectory": true,
                "presets": [
                  ["env", {
                    "targets": {
                      "browsers": "> 5%"
                    }
                  }]
                ]
              }
            },
            {
              'loader': 'ts-loader'
            }
          ]
      },
      {
        test: /\.s?css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'] //['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(svg|woff|eot|ttf)$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 50000,
          },
        },
      }
    ]
  },
  resolve: {
    modules: ['node_modules', 'scripts'],
    extensions: ['.ts', '.tsx', '.js']
  },
  node: {
    fs: "empty"
  },
  mode: 'development'
};

function isExternal(module) {
  var context = module.context;

  if (typeof context !== 'string') {
    return false;
  }

  return context.indexOf('node_modules') !== -1;
}
