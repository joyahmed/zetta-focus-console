/** Seconds -> "12:05". The clock inside the ring. */
export const formatTime = (seconds: number): string => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/** Seconds -> "12:05", without the leading zero on the minutes. */
export const formatClock = (totalSeconds: number): string => {
	const safe = Math.max(0, totalSeconds);
	const minutes = Math.floor(safe / 60);
	const seconds = safe % 60;
	return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

/** Seconds -> "25m", trimming a trailing ".00" but keeping "0.5m". */
export const formatMinutes = (seconds: number): string =>
	`${Number((seconds / 60).toFixed(2))}m`;

export const secondsToMinutes = (seconds: number): number =>
	Number((seconds / 60).toFixed(2));

/**
 * Unix seconds -> "2h 14m".
 *
 * The engine records when it started, not how long it has run, so the elapsed
 * time is derived rather than ticked.
 */
export const formatUptime = (startedAtUnixSeconds?: number): string => {
	if (!startedAtUnixSeconds) return '--';

	const seconds = Math.max(
		0,
		Math.floor(Date.now() / 1000) - startedAtUnixSeconds
	);
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	if (hours > 0) return `${hours}h ${minutes}m`;
	if (minutes > 0) return `${minutes}m`;
	return `${seconds}s`;
};

/**
 * "fireplace.ogg" -> "fireplace".
 *
 * Any extension, not just .ogg: profiles saved before the switch to Vorbis
 * still name a .mp3 and must still resolve to the same sound.
 */
export const stripExtension = (filename: string): string =>
	filename.replace(/\.[^.]+$/, '');

/**
 * What someone typed into the clock, as an argument the engine understands.
 *
 * The `timer` command takes "25m" or "90s", but nobody editing a clock reading
 * 25:00 types either of those — they type 25, or 5:30, or occasionally 90s.
 * All four forms are accepted and normalised to seconds; a bare number is
 * minutes, because that is what the field is showing.
 *
 * Returns null for anything unparseable or out of the engine's 5s–180m range,
 * which is the signal to leave the timer alone.
 */
export const parseDurationInput = (text: string): string | null => {
	const trimmed = text.trim().toLowerCase();
	if (!trimmed) return null;

	const clock = trimmed.match(/^(\d{1,3}):([0-5]?\d)$/);
	const suffixed = trimmed.match(/^(\d+(?:\.\d+)?)\s*(m|min|s|sec)?$/);

	let seconds: number;

	if (clock) {
		seconds = Number(clock[1]) * 60 + Number(clock[2]);
	} else if (suffixed) {
		const value = Number(suffixed[1]);
		const isSeconds = suffixed[2] === 's' || suffixed[2] === 'sec';
		seconds = Math.round(isSeconds ? value : value * 60);
	} else {
		return null;
	}

	if (seconds < 5 || seconds > 10800) return null;

	return `${seconds}s`;
};
