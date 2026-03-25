/**
 * Tidal Mini Player – lyrics parsing utilities
 *
 * Handles both:
 *  - LRC format: `[mm:ss.xx] lyric line`
 *  - Plain multi-line text (no timestamps)
 */

export interface LyricLine {
	time: number; // seconds
	text: string;
}

/**
 * Parse an LRC/subtitle string into timed lyric lines.
 * Returns `null` if the string has no recognisable timestamps.
 */
export function parseLrc(raw: string | null | undefined): LyricLine[] | null {
	if (!raw) return null;

	const lines: LyricLine[] = [];
	// Match [mm:ss.xx] or [mm:ss:xx] patterns
	const lrcRegex = /\[(\d{1,2}):(\d{2})[.:](\d{1,3})\]\s*(.*)/g;
	let match: RegExpExecArray | null;
	let hasTimestamps = false;

	while ((match = lrcRegex.exec(raw)) !== null) {
		hasTimestamps = true;
		const minutes = parseInt(match[1], 10);
		const seconds = parseInt(match[2], 10);
		const ms = parseInt(match[3].padEnd(3, "0"), 10);
		const time = minutes * 60 + seconds + ms / 1000;
		// Strip word-level timing markers used by TIDAL's enhanced LRC format
		// e.g. "<00:10.82>Word<00:11.20> next" → "Word next"
		const text = match[4].replace(/<[^>]*>/g, "").trim();
		if (text) lines.push({ time, text });
	}

	if (!hasTimestamps) return null;

	lines.sort((a, b) => a.time - b.time);
	return lines;
}

/**
 * Find the index of the lyric line that should currently be displayed
 * given the current playback position.
 */
export function currentLyricIndex(lines: LyricLine[], currentTime: number): number {
	let idx = 0;
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].time <= currentTime) idx = i;
		else break;
	}
	return idx;
}
