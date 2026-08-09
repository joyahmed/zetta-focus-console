const SELECT_STYLES =
	'profile-modal-white w-full px-3 py-2 bg-zetta-bg border border-zetta-border rounded text-sm text-zetta-text focus:outline-none focus:border-zetta-neon focus:ring-1 focus:ring-zetta-neon/30 transition-all';

/**
 * A labelled dropdown.
 *
 * The modal has three of these and they were three copies of the same label,
 * the same select and the same forty-character class string, each holding its
 * options as hand-written markup.
 */
const LabelledSelect = ({
	label,
	value,
	options,
	onChange
}: LabelledSelectProps) => (
	<div>
		<label className='block text-xs text-zetta-text-secondary mb-1.5 font-medium'>
			{label}
		</label>
		<select
			value={value}
			onChange={e => onChange(e.target.value)}
			className={SELECT_STYLES}
		>
			{options.map(option => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	</div>
);

export default LabelledSelect;
