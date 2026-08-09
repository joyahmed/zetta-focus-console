import { useState } from 'react';

/**
 * Which profile is one click away from being deleted.
 *
 * A profile is gone for good — it lives in the preferences file and there is no
 * undo — so the ✕ on a chip arms the question rather than answering it. The
 * pending profile is held whole rather than by id, because the dialog names it
 * and it disappears from the list the moment the delete lands.
 */
export const useProfileDelete = ({ onProfileDelete }: UseProfileDeleteProps) => {
	const [pending, setPending] = useState<Profile | null>(null);

	const confirm = async () => {
		if (!pending) return;

		const { id } = pending;
		setPending(null);
		await onProfileDelete?.(id);
	};

	return {
		pending,
		requestDelete: setPending,
		cancelDelete: () => setPending(null),
		confirmDelete: confirm
	};
};
