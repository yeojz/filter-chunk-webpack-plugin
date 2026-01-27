import picomatch from "picomatch";

export function createGlobMatcher(pattern: string): (filename: string) => boolean {
	const isMatch = picomatch(pattern);
	return (filename: string) => isMatch(filename);
}
