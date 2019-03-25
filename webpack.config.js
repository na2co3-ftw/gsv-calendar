const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = (env, argv) => {
	const PRODUCTION = argv.mode === "production";
	const plugins = [
		new HtmlWebpackPlugin({
			filename: "index.html",
			template: "app/ui/index.template.html"
		})
	];
	if (PRODUCTION) {
		plugins.push(
			new CleanWebpackPlugin()
		);
	}

	return {
		mode: "development",
		entry: [
			path.join(__dirname, "app/ui/index.tsx")
		],
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					use: ["ts-loader"]
				}
			]
		},
		resolve: {
			extensions: [".ts", ".tsx", ".js"]
		},
		output: {
			path: path.join(__dirname, "out"),
			filename: PRODUCTION ? "scripts.[chunkhash:10].js" : "scripts.js"
		},
		plugins
	};
};
