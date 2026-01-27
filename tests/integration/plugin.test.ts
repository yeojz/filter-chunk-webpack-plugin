import path from "node:path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { describe, expect, it } from "vitest";
import webpack from "webpack";
import { FilterChunkWebpackPlugin } from "../../src";

function runWebpack(
	fixture: string,
	plugins: webpack.WebpackPluginInstance[] = [],
): Promise<{ assets: string[]; stats: webpack.Stats }> {
	return new Promise((resolve, reject) => {
		const compiler = webpack({
			mode: "production",
			entry: path.resolve(__dirname, `../../fixtures/${fixture}/index.js`),
			output: {
				path: path.resolve(__dirname, `../../.spec_output/${fixture}`),
				filename: "[name].js",
				clean: true,
			},
			module: {
				rules: [
					{
						test: /\.css$/,
						use: [MiniCssExtractPlugin.loader, "css-loader"],
					},
					{
						test: /\.(png|svg)$/,
						type: "asset/resource",
						generator: {
							filename: "assets/[name][ext]",
						},
					},
				],
			},
			plugins: [new MiniCssExtractPlugin(), ...plugins],
			devtool: "source-map",
		});

		compiler.run((err, stats) => {
			if (err) return reject(err);
			if (!stats) return reject(new Error("No stats"));
			if (stats.hasErrors()) return reject(new Error(stats.toString()));

			const assets = Object.keys(stats.compilation.assets);
			resolve({ assets, stats });
		});
	});
}

describe("FilterChunkWebpackPlugin Integration", () => {
	it("outputs all assets when no rules provided", async () => {
		const { assets } = await runWebpack("basic", [new FilterChunkWebpackPlugin()]);

		expect(assets).toContain("main.js");
		expect(assets).toContain("main.js.map");
	});

	it("filters source maps with glob pattern", async () => {
		const { assets } = await runWebpack("basic", [
			new FilterChunkWebpackPlugin({
				rules: [{ patterns: "*.map" }],
			}),
		]);

		expect(assets).toContain("main.js");
		expect(assets).not.toContain("main.js.map");
	});

	it("filters source maps with regex pattern", async () => {
		const { assets } = await runWebpack("basic", [
			new FilterChunkWebpackPlugin({
				rules: [{ patterns: /\.map$/ }],
			}),
		]);

		expect(assets).toContain("main.js");
		expect(assets).not.toContain("main.js.map");
	});

	it("filters with function pattern", async () => {
		const { assets } = await runWebpack("basic", [
			new FilterChunkWebpackPlugin({
				rules: [{ patterns: (name) => name.endsWith(".map") }],
			}),
		]);

		expect(assets).toContain("main.js");
		expect(assets).not.toContain("main.js.map");
	});

	it("filters CSS and source maps with multiple rules", async () => {
		const { assets } = await runWebpack("with-css", [
			new FilterChunkWebpackPlugin({
				rules: [{ patterns: "*.map" }, { patterns: "*.css" }],
			}),
		]);

		expect(assets).toContain("main.js");
		expect(assets).not.toContain("main.js.map");
		expect(assets).not.toContain("main.css");
		expect(assets).not.toContain("main.css.map");
	});

	it("filters assets with scoped test option", async () => {
		const { assets } = await runWebpack("with-css", [
			new FilterChunkWebpackPlugin({
				rules: [{ patterns: "*.map", test: /\.css/ }],
			}),
		]);

		expect(assets).toContain("main.js");
		expect(assets).toContain("main.js.map");
		expect(assets).toContain("main.css");
		expect(assets).not.toContain("main.css.map");
	});

	it("filters image assets", async () => {
		const { assets } = await runWebpack("with-assets", [
			new FilterChunkWebpackPlugin({
				rules: [{ patterns: "**/*.{png,svg}" }],
			}),
		]);

		expect(assets).toContain("main.js");
		expect(assets).toContain("main.css");
		expect(assets.some((a) => a.endsWith(".png"))).toBe(false);
		expect(assets.some((a) => a.endsWith(".svg"))).toBe(false);
	});
});
