interface WebpackLogger {
	info(message: string): void;
}

interface LogEntry {
	filename: string;
	label: string;
}

export class Logger {
	private debug: boolean;
	private webpackLogger: WebpackLogger | null = null;
	private filteredEntries: LogEntry[] = [];
	private keptEntries: LogEntry[] = [];

	constructor(debug: boolean) {
		this.debug = debug;
	}

	setWebpackLogger(logger: WebpackLogger): void {
		this.webpackLogger = logger;
	}

	filtered(filename: string, label: string): void {
		this.filteredEntries.push({ filename, label });

		if (this.debug) {
			console.log(`[FilterChunk] Filtered: ${filename} (label: ${label})`);
		}
	}

	kept(filename: string, label: string): void {
		this.keptEntries.push({ filename, label });

		if (this.debug) {
			console.log(`[FilterChunk] Kept: ${filename} (label: ${label})`);
		}
	}

	summary(total: number, removed: number, isIncludeMode = false): void {
		const kept = total - removed;

		const message = isIncludeMode
			? `Kept ${kept} of ${total} assets (${removed} removed)`
			: `Filtered ${removed} of ${total} assets (${kept} remaining)`;

		if (this.webpackLogger) {
			this.webpackLogger.info(message);
		}

		if (this.debug) {
			console.log(`[FilterChunk] ${message}`);

			if (isIncludeMode && this.keptEntries.length > 0) {
				console.log("[FilterChunk] Kept assets:");
				const grouped = this.groupByLabel(this.keptEntries);
				for (const [label, files] of Object.entries(grouped)) {
					console.log(`  ${label}:`);
					for (const file of files) {
						console.log(`    - ${file}`);
					}
				}
			} else if (!isIncludeMode && this.filteredEntries.length > 0) {
				console.log("[FilterChunk] Filtered assets:");
				const grouped = this.groupByLabel(this.filteredEntries);
				for (const [label, files] of Object.entries(grouped)) {
					console.log(`  ${label}:`);
					for (const file of files) {
						console.log(`    - ${file}`);
					}
				}
			}
		}
	}

	private groupByLabel(entries: LogEntry[]): Record<string, string[]> {
		const grouped: Record<string, string[]> = {};
		for (const entry of entries) {
			if (!grouped[entry.label]) {
				grouped[entry.label] = [];
			}
			grouped[entry.label].push(entry.filename);
		}
		return grouped;
	}
}
