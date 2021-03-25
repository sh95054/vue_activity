const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const fs = require('fs');

const config = {
  entry: {
    vendors: ['vue', 'axios']
  },
  output: {
    filename: `js/[name].js`
  },
  resolve: {
    alias: {
        'vue$': 'vue/dist/vue.esm.js', // 'vue/dist/vue.common.js' for webpack 1
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.ts(x)?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.svg$/,
        use: 'file-loader'
      },
      {
        test: /\.png$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              mimetype: 'image/png'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: `css/[name].css`,
    }),
    new CleanWebpackPlugin()
  ],
  resolve: {
    extensions: [
      '.tsx',
      '.ts',
      '.js'
    ]
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};

// module.exports = config;

module.exports = (env, argv) => {
  const activePath = `/activity/${argv.name}/`;
  const fileList = fs.readdirSync(__dirname + activePath + '/src/template/');

  fileList.forEach(fileItem => {
    const filename = fileItem.replace('.html', '');

    //拷贝静态html
    if(/static\.(.*)\.html$/.test(fileItem)){
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: `.${activePath}src/template/${fileItem}`,
              to: path.resolve(__dirname + activePath)
            },
          ],
        }),
      )
    }else if (/.*\.html$/.test(fileItem)) {
      config.entry[filename] = `.${activePath}src/js/${filename}.ts`;
      config.output.path = path.resolve(__dirname + activePath, 'dist');
      config.plugins.push(
        new HtmlWebpackPlugin({
          template: './' + activePath + 'src/template/' + fileItem,
          filename: '../' + fileItem,
          inject: 'body',
          scriptLoading: 'blocking',
          cache: true,
          chunks: ['vendors', filename]
        })
      )
    }
  })
  return config;
}