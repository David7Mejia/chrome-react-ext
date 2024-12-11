const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: "development",
  // devtool: "cheap-module-source-map",
  entry: {
    popup: path.resolve(__dirname, "src/popup/popup.jsx"),
    options: path.resolve(__dirname, "src/options/options.jsx"),
    background: path.resolve(__dirname, "src/background/background.js"),
    contentScript: path.resolve(__dirname, "src/contentScript/contentScript.js"),
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|woff|woff2)$/,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve("src/static"),
          to: path.resolve("dist"),
        },
        { from: "src/static/icon.png", to: "." },
      ],
    }),
    ...getHtmlPlugins(["popup", "options"]),
  ],
  resolve: {
    extensions: [".js", ".jsx"],
  },
  output: {
    filename: "[name].js",
    path: path.resolve("dist"),
  },
};

function getHtmlPlugins(chunks) {
  return chunks.map(
    chunk =>
      new HtmlPlugin({
        title: "wp ext",
        filename: `${chunk}.html`,
        chunks: [chunk],
      })
  );
}
