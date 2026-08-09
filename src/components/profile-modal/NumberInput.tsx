const STEPPER_STYLES =
	'w-8 h-8 flex items-center justify-center bg-zetta-inset border border-zetta-border text-zetta-text-secondary hover:text-zetta-text hover:bg-zetta-panel transition-all disabled:opacity-40 disabled:cursor-not-allowed';

/** The minus and plus glyphs are the same 20x20 filled box; only the path
    differs, so the svg is written once. */
const StepperIcon = ({ path }: { path: string }) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className='h-3.5 w-3.5'
		viewBox='0 0 20 20'
		fill='currentColor'
	>
		<path fillRule='evenodd' d={path} clipRule='evenodd' />
	</svg>
);

const MINUS_PATH = 'M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z';
const PLUS_PATH =
	'M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z';

/** A number field with a step either side of it. */
const NumberInput = ({
	value,
	onChange,
	min,
	max,
	label,
	unit,
	step = 1,
	precision = 0
}: NumberInputProps) => {
	const clampValue = (nextValue: number) => {
		const clamped = Math.min(max, Math.max(min, nextValue));
		return Number(clamped.toFixed(precision));
	};

	const handleDecrement = () => {
		if (value > min) onChange(clampValue(value - step));
	};

	const handleIncrement = () => {
		if (value < max) onChange(clampValue(value + step));
	};

	const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;
		if (raw === '') return;

		const parsed = Number(raw);
		if (Number.isNaN(parsed)) return;

		onChange(clampValue(parsed));
	};

	return (
		<div className='flex flex-col gap-1.5'>
			{/* The unit belongs on the label: "Focus 25" reads as ambiguous
			    where "Focus (min)" does not, and three of these four fields
			    are minutes while the fourth is a count. */}
			<label className='text-xs text-zetta-text-secondary font-medium'>
				{label}
				{unit && (
					<span className='text-zetta-text-muted font-normal'>
						{' '}
						({unit})
					</span>
				)}
			</label>
			<div className='flex items-center gap-1'>
				<button
					type='button'
					onClick={handleDecrement}
					disabled={value <= min}
					className={`${STEPPER_STYLES} rounded-l`}
				>
					<StepperIcon path={MINUS_PATH} />
				</button>
				<input
					type='number'
					min={min}
					max={max}
					step={step}
					value={value}
					onChange={handleManualChange}
					className='flex-1 h-8 bg-zetta-inset border-t border-b border-zetta-border text-sm text-zetta-text font-mono font-medium text-center focus:outline-none'
				/>
				<button
					type='button'
					onClick={handleIncrement}
					disabled={value >= max}
					className={`${STEPPER_STYLES} rounded-r`}
				>
					<StepperIcon path={PLUS_PATH} />
				</button>
			</div>
		</div>
	);
};

export default NumberInput;
