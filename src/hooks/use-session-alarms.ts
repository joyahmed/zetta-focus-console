import { listen } from '@tauri-apps/api/event';
import { useEffect, useRef } from 'react';
import { playAlarm } from '../utils/alarm';

/**
 * Sounds the alarm the engine asks for.
 *
 * Driven by an event rather than by watching the state for transitions: with
 * breaks starting themselves, a focus session rolls straight into a break
 * inside a single tick, and a frontend diffing `session_type` between renders
 * would have to guess at what happened between two states rather than being
 * told. The engine knows exactly which boundary it crossed.
 *
 * This replaces use-voice-cues, which was written, never wired up — its import
 * and its call were both commented out in App.tsx — and could not have been
 * wired up as written, because it called `useApp()` and would have stood up a
 * second copy of the root hook, with a second set of Tauri listeners and a
 * second registration of every global shortcut.
 */
export const useSessionAlarms = (enabled: boolean) => {
	// Read through a ref so the listener is registered once. Depending on
	// `enabled` would tear down and re-register the Tauri subscription every
	// time the toggle moved.
	const enabledRef = useRef(enabled);
	enabledRef.current = enabled;

	useEffect(() => {
		const unlisten = listen<string>('session-alarm', event => {
			if (!enabledRef.current) return;

			const kind = event.payload;
			if (kind === 'session' || kind === 'break' || kind === 'cycle') {
				void playAlarm(kind);
			}
		});

		return () => {
			void unlisten.then(off => off());
		};
	}, []);
};
