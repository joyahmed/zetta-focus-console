/**
 * One line of the settings drawer: what it is, what it does, and the control.
 *
 * There were eight section files before this, and between them they wrote the
 * same row three different ways — `bg-zetta-panel` in one, an inline
 * `var(--bg-primary)` in the next, a `glass-panel` with a hand-set border in
 * the third. Two of those were wrong rather than merely different:
 * `--bg-primary` is the *page*, so a row painted with it inside a drawer is the
 * flat sheet the light theme was fixed to stop being.
 *
 * A row with an `onClick` is a button rather than a div, because a row you can
 * press has to be reachable by keyboard and announce itself as pressable.
 */
const SettingRow = ({
	title,
	description,
	icon,
	control,
	below,
	onClick,
	danger = false
}: SettingRowProps) => {
	const line = (
		<div className='w-full flex items-center justify-between gap-3'>
			<div className='flex items-center gap-3 text-left'>
				{icon && (
					<span className='text-zetta-text-muted shrink-0'>{icon}</span>
				)}
				<div>
					<div
						className={`text-sm text-zetta-text ${danger ? 'group-hover:text-zetta-danger transition-colors' : ''}`}
					>
						{title}
					</div>
					{description && (
						<div className='text-xs mt-0.5 text-zetta-text-muted'>
							{description}
						</div>
					)}
				</div>
			</div>
			{control}
		</div>
	);

	const shape =
		'w-full p-3 rounded-lg border border-zetta-border bg-zetta-panel';

	if (onClick) {
		return (
			<button
				onClick={onClick}
				className={`${shape} group text-left transition-colors hover:border-zetta-text-muted/40`}
			>
				{line}
			</button>
		);
	}

	return (
		<div className={shape}>
			{line}
			{below && <div className='mt-3'>{below}</div>}
		</div>
	);
};

export default SettingRow;
