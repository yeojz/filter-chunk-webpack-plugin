import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Logger } from "../../src/logger";

describe("Logger", () => {
	let consoleSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("filtered", () => {
		it("does not log when debug is false", () => {
			const logger = new Logger(false);
			logger.filtered("main.js.map", "sourcemaps");

			expect(consoleSpy).not.toHaveBeenCalled();
		});

		it("logs with label when debug is true", () => {
			const logger = new Logger(true);
			logger.filtered("main.js.map", "sourcemaps");

			expect(consoleSpy).toHaveBeenCalledWith(
				"[FilterChunk] Filtered: main.js.map (label: sourcemaps)",
			);
		});

		it("logs with index fallback when no label", () => {
			const logger = new Logger(true);
			logger.filtered("main.js.map", "[0]");

			expect(consoleSpy).toHaveBeenCalledWith("[FilterChunk] Filtered: main.js.map (label: [0])");
		});
	});

	describe("kept", () => {
		it("does not log when debug is false", () => {
			const logger = new Logger(false);
			logger.kept("main.js", "scripts");

			expect(consoleSpy).not.toHaveBeenCalled();
		});

		it("logs with label when debug is true", () => {
			const logger = new Logger(true);
			logger.kept("main.js", "scripts");

			expect(consoleSpy).toHaveBeenCalledWith("[FilterChunk] Kept: main.js (label: scripts)");
		});
	});

	describe("summary", () => {
		it("does not log summary when debug is false and no webpack logger", () => {
			const logger = new Logger(false);
			logger.summary(5, 2);

			expect(consoleSpy).not.toHaveBeenCalled();
		});

		it("logs summary when debug is true", () => {
			const logger = new Logger(true);
			logger.filtered("a.map", "maps");
			logger.filtered("b.map", "maps");
			logger.summary(5, 2);

			expect(consoleSpy).toHaveBeenCalledWith("[FilterChunk] Filtered 2 of 5 assets (3 remaining)");
		});

		it("logs grouped files by label when debug is true", () => {
			const logger = new Logger(true);
			logger.filtered("a.map", "sourcemaps");
			logger.filtered("b.map", "sourcemaps");
			logger.filtered("c.LICENSE.txt", "licenses");
			logger.summary(5, 3);

			expect(consoleSpy).toHaveBeenCalledWith("[FilterChunk] Filtered assets:");
			expect(consoleSpy).toHaveBeenCalledWith("  sourcemaps:");
			expect(consoleSpy).toHaveBeenCalledWith("    - a.map");
			expect(consoleSpy).toHaveBeenCalledWith("    - b.map");
			expect(consoleSpy).toHaveBeenCalledWith("  licenses:");
			expect(consoleSpy).toHaveBeenCalledWith("    - c.LICENSE.txt");
		});

		it("logs include mode summary when debug is true", () => {
			const logger = new Logger(true);
			logger.kept("main.js", "scripts");
			logger.kept("vendor.js", "scripts");
			logger.summary(5, 3, true);

			expect(consoleSpy).toHaveBeenCalledWith("[FilterChunk] Kept 2 of 5 assets (3 removed)");
		});

		it("logs grouped kept files by label in include mode", () => {
			const logger = new Logger(true);
			logger.kept("main.js", "scripts");
			logger.kept("vendor.js", "scripts");
			logger.kept("style.css", "styles");
			logger.summary(5, 2, true);

			expect(consoleSpy).toHaveBeenCalledWith("[FilterChunk] Kept assets:");
			expect(consoleSpy).toHaveBeenCalledWith("  scripts:");
			expect(consoleSpy).toHaveBeenCalledWith("    - main.js");
			expect(consoleSpy).toHaveBeenCalledWith("    - vendor.js");
			expect(consoleSpy).toHaveBeenCalledWith("  styles:");
			expect(consoleSpy).toHaveBeenCalledWith("    - style.css");
		});

		it("does not log filtered assets list when none filtered in exclude mode", () => {
			const logger = new Logger(true);
			logger.summary(5, 0);

			expect(consoleSpy).toHaveBeenCalledWith("[FilterChunk] Filtered 0 of 5 assets (5 remaining)");
			expect(consoleSpy).not.toHaveBeenCalledWith("[FilterChunk] Filtered assets:");
		});

		it("does not log kept assets list when none kept in include mode", () => {
			const logger = new Logger(true);
			logger.summary(5, 5, true);

			expect(consoleSpy).toHaveBeenCalledWith("[FilterChunk] Kept 0 of 5 assets (5 removed)");
			expect(consoleSpy).not.toHaveBeenCalledWith("[FilterChunk] Kept assets:");
		});
	});

	describe("webpack logger integration", () => {
		it("logs to webpack logger when provided", () => {
			const webpackLogger = {
				info: vi.fn(),
			};
			const logger = new Logger(false);
			logger.setWebpackLogger(
				webpackLogger as unknown as ReturnType<typeof Logger.prototype.setWebpackLogger>,
			);
			logger.summary(5, 2);

			expect(webpackLogger.info).toHaveBeenCalledWith("Filtered 2 of 5 assets (3 remaining)");
		});
	});
});
