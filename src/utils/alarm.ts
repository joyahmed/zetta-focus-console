/**
 * The three end-of-timer alarms, synthesised.
 *
 * No audio files: nothing is added to the installer, nothing needs a source
 * and a licence recorded in ASSETS.md — which is the one thing still holding
 * the repository closed — and they sound identical on every machine, unlike
 * anything routed through whatever voices Windows happens to have installed.
 *
 * Each is a short run of sine partials with an exponential decay, which is
 * roughly what a struck bell does: a bright attack that falls away rather than
 * a tone that stops. Three shapes, so you can tell from the next room which
 * one you heard.
 */

type AlarmKind = 'session' | 'break' | 'cycle';

interface Note {
	/** Hz. */
	frequency: number;
	/** Seconds from the start of the alarm. */
	at: number;
	/** Seconds. */
	duration: number;
	gain: number;
}

/**
 * Session end: two notes falling a minor third, warm and unhurried. The work
 * is done; nothing is being demanded of you.
 *
 * Break end: one brighter note, alone. Short, so it reads as a nudge back to
 * the desk rather than a reward.
 *
 * Cycle end: three notes rising a major triad, longer and fuller. The only
 * one of the three that is allowed to sound pleased with itself.
 */
const ALARMS: Record<AlarmKind, Note[]> = {
	session: [
		{ frequency: 660, at: 0, duration: 0.9, gain: 0.16 },
		{ frequency: 550, at: 0.22, duration: 1.1, gain: 0.16 }
	],
	break: [{ frequency: 880, at: 0, duration: 0.55, gain: 0.13 }],
	cycle: [
		{ frequency: 523.25, at: 0, duration: 1.2, gain: 0.14 },
		{ frequency: 659.25, at: 0.18, duration: 1.2, gain: 0.14 },
		{ frequency: 783.99, at: 0.36, duration: 1.6, gain: 0.15 }
	]
};

/**
 * One context for the life of the app.
 *
 * Browsers cap how many AudioContexts a page may hold, and each carries its
 * own audio thread — creating one per alarm would leak them until playback
 * silently stopped working.
 */
let context: AudioContext | null = null;

const getContext = (): AudioContext | null => {
	if (typeof AudioContext === 'undefined') return null;
	if (!context) context = new AudioContext();
	return context;
};

/** Sound one alarm. Silent, rather than throwing, if audio is unavailable. */
export const playAlarm = async (kind: AlarmKind): Promise<void> => {
	const ctx = getContext();
	if (!ctx) return;

	// A context created before the window has been interacted with starts
	// suspended, and every note scheduled on it would be dropped without a
	// sound or an error.
	if (ctx.state === 'suspended') {
		try {
			await ctx.resume();
		} catch {
			return;
		}
	}

	const start = ctx.currentTime;

	for (const note of ALARMS[kind]) {
		const oscillator = ctx.createOscillator();
		const envelope = ctx.createGain();

		oscillator.type = 'sine';
		oscillator.frequency.value = note.frequency;

		const at = start + note.at;
		const end = at + note.duration;

		// Ramped rather than switched. A gain that jumps to its value produces
		// a click at the discontinuity, which is the one sound an alarm in a
		// focus app must not make.
		envelope.gain.setValueAtTime(0.0001, at);
		envelope.gain.exponentialRampToValueAtTime(note.gain, at + 0.015);
		envelope.gain.exponentialRampToValueAtTime(0.0001, end);

		oscillator.connect(envelope);
		envelope.connect(ctx.destination);

		oscillator.start(at);
		oscillator.stop(end + 0.05);
	}
};
