const Toggle = ({ enabled, onChange, disabled = false, isLight }: ToggleProps) => {
	const baseBg = isLight ? 'bg-gray-300' : 'bg-gray-600';
	const activeBg = enabled ? (isLight ? 'bg-blue-500' : 'bg-blue-500') : baseBg;
	const thumbColor = isLight && !enabled ? '#666' : 'white';

	return (
		<button
			onClick={onChange}
			disabled={disabled}
			className={`relative w-11 h-6 rounded-full transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${activeBg}`}
		>
			<span
				className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
				style={{ backgroundColor: thumbColor }}
			/>
		</button>
	);
};

export default Toggle;
