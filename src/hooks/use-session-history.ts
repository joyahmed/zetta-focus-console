import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useCallback, useEffect, useState } from 'react';

/** How many days the strip shows. */
const WINDOW = 7;

/** A local YYYY-MM-DD, which is what the engine writes.
    `toISOString` is UTC and would name yesterday for anyone west of it. */
const localDate = (date: Date) =>
	`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * The last seven days, including the ones with nothing in them.
 *
 * The engine only writes a row for a day that had a session, which is the right
 * thing to store and the wrong thing to draw: a week with Tuesday missing
 * should show an empty Tuesday, not a six-day week. The gaps are filled here.
 */
export const useSessionHistory = () => {
	const [days, setDays] = useState<SessionDay[]>([]);

	const load = useCallback(async () => {
		try {
			const records = await invoke<DayRecord[]>('get_session_history');
			const byDate = new Map(records.map(r => [r.date, r]));

			const today = new Date();
			const filled: SessionDay[] = [];

			for (let i = WINDOW - 1; i >= 0; i--) {
				const date = new Date(today);
				date.setDate(today.getDate() - i);
				const key = localDate(date);
				const record = byDate.get(key);

				filled.push({
					date: key,
					weekday: WEEKDAYS[date.getDay()],
					sessions: record?.sessions ?? 0,
					focusMinutes: record?.focus_minutes ?? 0,
					isToday: i === 0
				});
			}

			setDays(filled);
		} catch (e) {
			console.error('Failed to load session history:', e);
		}
	}, []);

	// On mount, and again whenever a session lands — which is the only thing
	// that changes it, and the moment somebody would look.
	useEffect(() => {
		load();
		const unlisten = listen('session-complete', () => load());
		return () => {
			unlisten.then(fn => fn());
		};
	}, [load]);

	const totalMinutes = days.reduce((sum, day) => sum + day.focusMinutes, 0);
	const totalSessions = days.reduce((sum, day) => sum + day.sessions, 0);
	const peak = Math.max(...days.map(day => day.focusMinutes), 1);

	return { days, totalMinutes, totalSessions, peak };
};
