import fs from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { FilterChunkWebpackPlugin } from "../../src";

const OUTPUT_DIR = path.resolve(__dirname, "../../.spec_output/e2e");

function runWebpack(plugins: webpack.WebpackPluginInstance[]): Promise<webpack.Stats> {
  return new Promise((resolve, reject) => {
    const compiler = webpack({
      mode: "production",
      entry: path.resolve(__dirname, "../../fixtures/with-assets/index.js"),
      output: {
        path: OUTPUT_DIR,
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
      resolve(stats);
    });
  });
}

describe("E2E: Build Output Verification", () => {
  beforeAll(async () => {
    await runWebpack([
      new FilterChunkWebpackPlugin({
        rules: [
          { label: "sourcemaps", patterns: "*.map" },
          { label: "images", patterns: "**/*.{png,svg}" },
        ],
      }),
    ]);
  });

  afterAll(() => {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  });

  it("keeps main.js on disk", () => {
    const filePath = path.join(OUTPUT_DIR, "main.js");
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, "utf-8");
    expect(content.length).toBeGreaterThan(0);
  });

  it("keeps main.css on disk", () => {
    const filePath = path.join(OUTPUT_DIR, "main.css");
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("background");
  });

  it("does NOT have main.js.map on disk", () => {
    const filePath = path.join(OUTPUT_DIR, "main.js.map");
    expect(fs.existsSync(filePath)).toBe(false);
  });

  it("does NOT have main.css.map on disk", () => {
    const filePath = path.join(OUTPUT_DIR, "main.css.map");
    expect(fs.existsSync(filePath)).toBe(false);
  });

  it("does NOT have PNG assets on disk", () => {
    const assetsDir = path.join(OUTPUT_DIR, "assets");
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      expect(files.some((f) => f.endsWith(".png"))).toBe(false);
    }
  });

  it("does NOT have SVG assets on disk", () => {
    const assetsDir = path.join(OUTPUT_DIR, "assets");
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      expect(files.some((f) => f.endsWith(".svg"))).toBe(false);
    }
  });
});
