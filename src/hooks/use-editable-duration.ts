import { useEffect, useRef, useState } from 'react';
import { parseDurationInput } from '../utils/format';

/**
 * Click the clock, type a duration, press Enter.
 *
 * The quick chips beside the ring cover 5, 15, 25 and 50 minutes; this is for
 * the run that is none of those, without opening the console to type
 * `timer 40m`. It is only offered while the timer is idle, because the engine
 * refuses a duration override on a running session anyway.
 */
export const useEditableDuration = ({
	value,
	canEdit,
	onCommit
}: UseEditableDurationProps) => {
	const [isEditing, setIsEditing] = useState(false);
	const [draft, setDraft] = useState(value);
	const inputRef = useRef<HTMLInputElement>(null);

	// A session starting or finishing while the field is open would leave it
	// editing a duration that no longer applies.
	useEffect(() => {
		if (!canEdit) setIsEditing(false);
	}, [canEdit]);

	useEffect(() => {
		if (isEditing) inputRef.current?.select();
	}, [isEditing]);

	const start = () => {
		if (!canEdit) return;
		setDraft(value);
		setIsEditing(true);
	};

	const cancel = () => setIsEditing(false);

	const commit = () => {
		setIsEditing(false);

		const duration = parseDurationInput(draft);
		// Unparseable or out of range simply reverts — the clock keeps saying
		// what the timer actually holds rather than showing a rejected value.
		if (duration) onCommit(duration);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			commit();
		} else if (e.key === 'Escape') {
			// Stopped here so the Modal-style global handlers never see it;
			// Escape in this field means "leave the clock alone", not
			// "close something".
			e.preventDefault();
			e.stopPropagation();
			cancel();
		}
	};

	return {
		isEditing,
		draft,
		setDraft,
		inputRef,
		start,
		commit,
		handleKeyDown
	};
};
