import { useEffect, useRef, useState } from 'react';
import { commandGroups } from '../configs/modal-config';

/**
 * Keyboard navigation for the command list.
 *
 * The modal is a flat list drawn as groups, so the selection is an index into
 * the flattened commands and each group has to know where it starts. Both of
 * those, the arrow-key handler and the scroll-into-view all lived in the
 * component; none of it draws anything.
 */
export const useHelpModal = ({ isOpen, onClose }: UseHelpModalProps) => {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const listRef = useRef<HTMLDivElement>(null);

	const commandCount = commandGroups.reduce(
		(total, group) => total + group.commands.length,
		0
	);

	/** Where each group's first command sits in the flattened list. */
	const groupOffsets = commandGroups.map((_, index) =>
		commandGroups
			.slice(0, index)
			.reduce((total, group) => total + group.commands.length, 0)
	);

	useEffect(() => {
		if (!isOpen) setSelectedIndex(0);
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen || !listRef.current) return;

		listRef.current
			.querySelector(`[data-index="${selectedIndex}"]`)
			?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
	}, [selectedIndex, isOpen]);

	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: globalThis.KeyboardEvent) => {
			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					setSelectedIndex(prev => Math.min(prev + 1, commandCount - 1));
					break;
				case 'ArrowUp':
					e.preventDefault();
					setSelectedIndex(prev => Math.max(prev - 1, 0));
					break;
				case 'Escape':
					e.preventDefault();
					onClose();
					break;
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, onClose, commandCount]);

	return { selectedIndex, listRef, commandCount, groupOffsets };
};
