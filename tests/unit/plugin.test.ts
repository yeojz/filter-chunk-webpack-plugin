import { describe, expect, it } from "vitest";
import { FilterChunkWebpackPlugin } from "../../src/plugin";

describe("FilterChunkWebpackPlugin", () => {
	describe("constructor", () => {
		it("creates plugin with default options", () => {
			const plugin = new FilterChunkWebpackPlugin();
			expect(plugin).toBeInstanceOf(FilterChunkWebpackPlugin);
		});

		it("creates plugin with custom rules", () => {
			const plugin = new FilterChunkWebpackPlugin({
				rules: [{ patterns: "*.map" }],
			});
			expect(plugin).toBeInstanceOf(FilterChunkWebpackPlugin);
		});

		it("creates plugin with debug enabled", () => {
			const plugin = new FilterChunkWebpackPlugin({
				debug: true,
			});
			expect(plugin).toBeInstanceOf(FilterChunkWebpackPlugin);
		});

		it("throws if rules is not an array", () => {
			expect(() => {
				new FilterChunkWebpackPlugin({
					rules: "*.map" as unknown as [],
				});
			}).toThrow("rules must be an array");
		});

		it("throws if rule patterns is missing", () => {
			expect(() => {
				new FilterChunkWebpackPlugin({
					rules: [{}] as unknown as [],
				});
			}).toThrow("each rule must have patterns");
		});
	});
});
