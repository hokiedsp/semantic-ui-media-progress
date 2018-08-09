// webpack v4
// webpack v4

const merge = require("webpack-merge");
const common = require("./webpack.common.js");

const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin"); //if want to minify CSS in prod
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = merge(common, {
  mode: "production",
  optimization: {
    minimize: true,
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true // set to true if you want JS source maps
      }),
      new OptimizeCssAssetsPlugin({})
    ]
  }
});
