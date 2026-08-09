import { TrashIcon } from './icons';

/**
 * One profile in Quick Switch.
 *
 * Two controls in one pill, not a button inside a button: the name switches to
 * the profile and the bin deletes it. The bin is only ever handed to a custom
 * profile, and Quick Switch never lists the active one — which happens to be
 * exactly the pair of refusals the engine makes, so the interface cannot offer
 * a delete the engine will turn down.
 */
const ProfileChip = ({ profile, onSwitch, onDelete }: ProfileChipProps) => (
	<div className='flex items-center rounded border border-zetta-border bg-zetta-panel overflow-hidden transition-colors hover:border-zetta-neon/50'>
		<button
			onClick={onSwitch}
			className='px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs text-zetta-text-secondary hover:text-zetta-text transition-colors'
		>
			{profile.name}
		</button>

		{onDelete && (
			<button
				onClick={onDelete}
				title={`Delete ${profile.name}`}
				aria-label={`Delete ${profile.name}`}
				className='pl-0.5 pr-1.5 py-1 text-zetta-text-muted hover:text-zetta-danger transition-colors'
			>
				<TrashIcon className='h-3 w-3' />
			</button>
		)}
	</div>
);

export default ProfileChip;
