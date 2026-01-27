import { beforeEach, describe, expect, it, vi } from "vitest";
import { Logger } from "../../src/logger";

describe("Logger", () => {
	let consoleSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
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
