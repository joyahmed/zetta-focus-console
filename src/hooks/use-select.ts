import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/** A row is `py-2 text-sm`, so 36px, and the list carries 4px of padding at
    each end. Only used to decide which way to open — the real height comes
    from layout once the list is mounted. */
const ROW_HEIGHT = 36;
const LIST_PADDING = 8;
const MAX_LIST_HEIGHT = 240;
/** Between the trigger and the list, and between the list and the window. */
const GAP = 4;
const EDGE = 8;

/**
 * The behaviour behind the dropdown: what is open, what is highlighted, and
 * where the list goes.
 *
 * The list is rendered in a portal at the window's coordinates rather than
 * under its trigger, and that is not a style choice. Every dialog in this app
 * scrolls its own body, and the dropdowns live near the bottom of the profile
 * form — an absolutely positioned list inside a scroll container is clipped by
 * it, so the last dropdown would have opened into a 20px sliver. Fixed
 * positioning escapes the container; the price is that the position is a
 * measurement, taken when the list opens and thrown away when anything moves
 * under it, which is why a scroll or a resize closes it rather than chasing it.
 */
export const useSelect = ({ value, options, onChange }: UseSelectProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const [position, setPosition] = useState<SelectPosition | null>(null);

	const triggerRef = useRef<HTMLButtonElement>(null);
	const listRef = useRef<HTMLUListElement>(null);

	const selectedIndex = options.findIndex(option => option.value === value);
	const selectedOption = options[selectedIndex];

	const measure = useCallback(() => {
		const trigger = triggerRef.current;
		if (!trigger) return;

		const rect = trigger.getBoundingClientRect();
		const wanted = Math.min(
			MAX_LIST_HEIGHT,
			options.length * ROW_HEIGHT + LIST_PADDING
		);

		const below = window.innerHeight - rect.bottom - GAP - EDGE;
		const above = rect.top - GAP - EDGE;
		// Below unless it does not fit and there is more room the other way.
		const opensAbove = wanted > below && above > below;
		const maxHeight = Math.min(wanted, opensAbove ? above : below);

		setPosition({
			top: opensAbove ? rect.top - GAP - maxHeight : rect.bottom + GAP,
			left: rect.left,
			width: rect.width,
			maxHeight,
			placement: opensAbove ? 'above' : 'below'
		});
	}, [options.length]);

	const close = useCallback((returnFocus = true) => {
		setIsOpen(false);
		setActiveIndex(-1);
		if (returnFocus) triggerRef.current?.focus();
	}, []);

	const open = useCallback(() => {
		measure();
		// An unset selection starts at the top rather than nowhere, so the
		// first arrow press moves within the list instead of into it.
		setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
		setIsOpen(true);
	}, [measure, selectedIndex]);

	const toggle = () => (isOpen ? close() : open());

	const selectAt = (index: number) => {
		const option = options[index];
		if (!option) return;

		onChange(option.value);
		close();
	};

	// Measured before paint: the list is positioned from a rect taken in the
	// same frame it appears, so it never flashes at the origin first.
	useLayoutEffect(() => {
		if (isOpen) measure();
	}, [isOpen, measure]);

	useEffect(() => {
		if (!isOpen) return;

		listRef.current?.focus();
	}, [isOpen]);

	/** Keeps the highlighted row inside a list that is taller than its box. */
	useEffect(() => {
		if (!isOpen || activeIndex < 0) return;

		const row = listRef.current?.children[activeIndex];
		row?.scrollIntoView({ block: 'nearest' });
	}, [isOpen, activeIndex]);

	useEffect(() => {
		if (!isOpen) return;

		const onPointerDown = (e: PointerEvent) => {
			const target = e.target as Node;
			if (
				listRef.current?.contains(target) ||
				triggerRef.current?.contains(target)
			) {
				return;
			}

			// No focus return: the pointer has already chosen where to go, and
			// pulling focus back to the trigger would fight it.
			close(false);
		};

		// Capture, so a scroll inside the dialog body counts — scroll events on
		// an element do not bubble to the window. The list's own scrolling is
		// exempt: a list taller than its box scrolls the moment it opens on a
		// selection near the bottom, and that event would otherwise close it
		// before it had been seen.
		const onScrollOrResize = (e: Event) => {
			const target = e.target;
			if (target instanceof Node && listRef.current?.contains(target)) {
				return;
			}

			close(false);
		};

		window.addEventListener('pointerdown', onPointerDown, true);
		window.addEventListener('scroll', onScrollOrResize, true);
		window.addEventListener('resize', onScrollOrResize);

		return () => {
			window.removeEventListener('pointerdown', onPointerDown, true);
			window.removeEventListener('scroll', onScrollOrResize, true);
			window.removeEventListener('resize', onScrollOrResize);
		};
	}, [isOpen, close]);

	const step = (delta: number) =>
		setActiveIndex(current => {
			const next = current + delta;
			if (next < 0) return options.length - 1;
			if (next >= options.length) return 0;
			return next;
		});

	const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
		if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
			e.preventDefault();
			open();
		}
	};

	const handleListKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				step(1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				step(-1);
				break;
			case 'Home':
				e.preventDefault();
				setActiveIndex(0);
				break;
			case 'End':
				e.preventDefault();
				setActiveIndex(options.length - 1);
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				selectAt(activeIndex);
				break;
			case 'Escape':
				// Stopped here, or the dialog around the dropdown closes with
				// it: the shell binds Escape on `window`, and the list is
				// portalled to `<body>`, so the event would reach it.
				e.preventDefault();
				e.stopPropagation();
				close();
				break;
			case 'Tab':
				// Not prevented. Focus goes back to the trigger first, so the
				// browser works out the next field from there — closing without
				// it would leave focus on a removed node and send the next Tab
				// back to the top of the dialog.
				close();
				break;
		}
	};

	return {
		isOpen,
		toggle,
		close,
		position,
		activeIndex,
		setActiveIndex,
		selectAt,
		selectedIndex,
		selectedOption,
		triggerRef,
		listRef,
		handleTriggerKeyDown,
		handleListKeyDown
	};
};
