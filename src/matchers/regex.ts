export function createRegexMatcher(pattern: RegExp): (filename: string) => boolean {
	return (filename: string) => pattern.test(filename);
}
