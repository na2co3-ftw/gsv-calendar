const path = require("path");
const webpack = require("webpack");

module.exports = {
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
		filename: "scripts.js"
	}
};
