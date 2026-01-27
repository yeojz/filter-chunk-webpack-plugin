interface WebpackLogger {
  info(message: string): void;
}

interface FilteredEntry {
  filename: string;
  label: string;
}

export class Logger {
  private debug: boolean;
  private webpackLogger: WebpackLogger | null = null;
  private filteredEntries: FilteredEntry[] = [];

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

  summary(total: number, removed: number): void {
    const kept = total - removed;
    const message = `Filtered ${removed} of ${total} assets (${kept} remaining)`;

    if (this.webpackLogger) {
      this.webpackLogger.info(message);
    }

    if (this.debug) {
      console.log(`[FilterChunk] ${message}`);

      if (this.filteredEntries.length > 0) {
        console.log("[FilterChunk] Filtered assets:");

        const grouped = this.groupByLabel();
        for (const [label, files] of Object.entries(grouped)) {
          console.log(`  ${label}:`);
          for (const file of files) {
            console.log(`    - ${file}`);
          }
        }
      }
    }
  }

  private groupByLabel(): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};
    for (const entry of this.filteredEntries) {
      if (!grouped[entry.label]) {
        grouped[entry.label] = [];
      }
      grouped[entry.label].push(entry.filename);
    }
    return grouped;
  }
}
