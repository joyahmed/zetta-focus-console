import { useEffect, useRef } from 'react';
import { useApp } from './app/use-app';

/**
 * Voice Cues Hook - Handles text-to-speech announcements for session events
 * Uses the Web Speech API (Speech Synthesis)
 */
export const useVoiceCues = () => {
	const { appState } = useApp();
	const prevTimerStatusRef = useRef<string>('');
	const prevSessionTypeRef = useRef<string>('');

	// Track if speech synthesis is available
	const speak = (text: string) => {
		// Check if voice is enabled and speech synthesis is available
		if (!appState?.voice_enabled) return;
		if (!('speechSynthesis' in window)) {
			console.warn('[Voice] Speech synthesis not supported');
			return;
		}

		// Cancel any ongoing speech
		window.speechSynthesis.cancel();

		const utterance = new SpeechSynthesisUtterance(text);
		// Use a calm, neutral voice
		utterance.rate = 0.9; // Slightly slower for clarity
		utterance.pitch = 1.0;
		utterance.volume = 0.8;

		// Try to find a good English voice
		const voices = window.speechSynthesis.getVoices();
		const englishVoice =
			voices.find(
				voice =>
					voice.lang.startsWith('en') && voice.name.includes('Google')
			) || voices.find(voice => voice.lang.startsWith('en'));

		if (englishVoice) {
			utterance.voice = englishVoice;
		}

		window.speechSynthesis.speak(utterance);
	};

	// Listen for timer state changes to trigger voice announcements
	useEffect(() => {
		if (!appState) return;

		const { timer, current_task } = appState;
		const currentStatus = timer.status;
		const currentSessionType = timer.session_type;

		// Check for session start
		if (
			currentStatus === 'running' &&
			prevTimerStatusRef.current !== 'running'
		) {
			// Session started
			if (timer.session_type === 'focus') {
				const taskText = current_task.title
					? `${current_task.title} ${current_task.category} session`
					: `${current_task.category} session`;
				speak(`Started ${taskText}`);
			} else if (
				timer.session_type === 'short_break' ||
				timer.session_type === 'long_break'
			) {
				speak('Break started');
			}
		}

		// Check for session completion
		if (
			prevTimerStatusRef.current === 'running' &&
			currentStatus === 'completed'
		) {
			// Session completed
			if (prevSessionTypeRef.current === 'focus') {
				const taskText = current_task.title
					? `${current_task.title} ${current_task.category} session completed`
					: 'Focus session complete';
				speak(taskText);
			} else if (
				prevSessionTypeRef.current === 'short_break' ||
				prevSessionTypeRef.current === 'long_break'
			) {
				speak('Break complete');
			}
		}

		// Update refs for next iteration
		prevTimerStatusRef.current = currentStatus;
		prevSessionTypeRef.current = currentSessionType;
	}, [appState]);
};
