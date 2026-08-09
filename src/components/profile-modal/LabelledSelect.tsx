import { useId } from 'react';
import Select from '../Select';

/**
 * A labelled dropdown.
 *
 * The label is tied to the control by `aria-labelledby` rather than `htmlFor`:
 * the control is a button now, not a form element, and a `<label for>` only
 * binds to the latter.
 */
const LabelledSelect = ({
	label,
	value,
	options,
	onChange
}: LabelledSelectProps) => {
	const labelId = useId();

	return (
		<div>
			<label
				id={labelId}
				className='block text-xs text-zetta-text-secondary mb-1.5 font-medium'
			>
				{label}
			</label>
			<Select {...{ value, options, onChange, labelledBy: labelId }} />
		</div>
	);
};

export default LabelledSelect;
