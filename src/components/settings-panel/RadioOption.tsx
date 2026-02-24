interface RadioOptionProps {
	name: string;
	value: string;
	checked: boolean;
	onChange: () => void;
	label: string;
	className?: string;
}

const RadioOption = ({
	name,
	value: _value,
	checked,
	onChange,
	label,
	className = ''

}: RadioOptionProps) => (
	<label
		className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${checked ? 'border-blue-500' : ''} ${className}
		 `}
		style={{
			// backgroundColor: 'var(--bg-primary)',
			borderColor: checked ? undefined : 'var(--border-color)'
		}}
	>
		<input
			type='radio'
			name={name}
			checked={checked}
			onChange={onChange}
			className='accent-blue-500'
		/>
		<span className='text-sm' style={{ color: 'var(--text-primary)' }}>
			{label}
		</span>
	</label>
);

export default RadioOption;
