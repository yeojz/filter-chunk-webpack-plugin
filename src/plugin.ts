import { Compilation as WebpackCompilation } from "webpack";
import { Logger } from "./logger";
import { createRuleMatcher } from "./matchers";
import type { Compilation, Compiler, PluginOptions, ResolvedOptions } from "./types";

const PLUGIN_NAME = "FilterChunkWebpackPlugin";

function resolveOptions(options: PluginOptions): ResolvedOptions {
	if (options.mode !== undefined && options.mode !== "exclude" && options.mode !== "include") {
		throw new Error("mode must be 'exclude' or 'include'");
	}

	if (options.rules !== undefined && !Array.isArray(options.rules)) {
		throw new Error("rules must be an array");
	}

	if (options.rules) {
		for (const rule of options.rules) {
			if (!rule.patterns) {
				throw new Error("each rule must have patterns");
			}
		}
	}

	return {
		mode: options.mode ?? "exclude",
		rules: options.rules ?? [],
		debug: options.debug ?? false,
	};
}

export class FilterChunkWebpackPlugin {
	private options: ResolvedOptions;

	constructor(options: PluginOptions = {}) {
		this.options = resolveOptions(options);
	}

	apply(compiler: Compiler): void {
		compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation: Compilation) => {
			const logger = new Logger(this.options.debug);
			logger.setWebpackLogger(compilation.getLogger(PLUGIN_NAME));

			const ruleMatchers = this.options.rules.map((rule, index) => ({
				matcher: createRuleMatcher(rule),
				label: rule.label ?? `[${index}]`,
			}));

			compilation.hooks.processAssets.tapAsync(
				{
					name: PLUGIN_NAME,
					stage: WebpackCompilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
				},
				async (assets, callback) => {
					const filenames = Object.keys(assets);
					const isIncludeMode = this.options.mode === "include";

					if (isIncludeMode) {
						// Include mode: collect matches from all rules (union), remove non-matched
						const toKeep = new Set<string>();
						const keepLabels = new Map<string, string>();

						for (const filename of filenames) {
							const asset = assets[filename];
							for (const { matcher, label } of ruleMatchers) {
								if (await matcher(filename, asset)) {
									toKeep.add(filename);
									keepLabels.set(filename, label);
									break;
								}
							}
						}

						// Remove files not in the keep set
						const toRemove: Array<{ filename: string; label: string }> = [];
						for (const filename of filenames) {
							if (!toKeep.has(filename)) {
								toRemove.push({ filename, label: "[not matched]" });
							}
						}

						for (const { filename } of toRemove) {
							compilation.deleteAsset(filename);
						}

						// Log kept files instead of removed
						for (const filename of toKeep) {
							// Label is guaranteed to exist since we set it when adding to toKeep
							const label = keepLabels.get(filename)!;
							logger.kept(filename, label);
						}

						logger.summary(filenames.length, toRemove.length, isIncludeMode);
					} else {
						// Exclude mode: pipeline, remove matches
						const toRemove: Array<{ filename: string; label: string }> = [];

						for (const filename of filenames) {
							const asset = assets[filename];
							for (const { matcher, label } of ruleMatchers) {
								if (await matcher(filename, asset)) {
									toRemove.push({ filename, label });
									break;
								}
							}
						}

						for (const { filename, label } of toRemove) {
							compilation.deleteAsset(filename);
							logger.filtered(filename, label);
						}

						logger.summary(filenames.length, toRemove.length, isIncludeMode);
					}

					callback();
				},
			);
		});
	}
}
