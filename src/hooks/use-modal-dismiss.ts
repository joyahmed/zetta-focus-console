import { useEffect, useId } from 'react';

/**
 * The dialogs currently open, oldest first.
 *
 * Escape is bound on `window`, because a dialog has to answer it whether or
 * not focus is inside it. That means every open dialog hears every Escape —
 * so typing `help` in the console, which opens the help list on top of it,
 * left one keypress closing both. Only the dialog on top of this stack acts.
 */
const openDialogs: string[] = [];

export const useModalDismiss = ({ isOpen, onClose }: UseModalDismissProps) => {
	const id = useId();

	useEffect(() => {
		if (!isOpen) return;

		openDialogs.push(id);
		return () => {
			const at = openDialogs.lastIndexOf(id);
			if (at !== -1) openDialogs.splice(at, 1);
		};
	}, [isOpen, id]);

	useEffect(() => {
		if (!isOpen) return;

		const onKeyDown = (e: globalThis.KeyboardEvent) => {
			if (e.key !== 'Escape') return;
			if (openDialogs[openDialogs.length - 1] !== id) return;

			e.preventDefault();
			onClose();
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [isOpen, onClose, id]);
};
