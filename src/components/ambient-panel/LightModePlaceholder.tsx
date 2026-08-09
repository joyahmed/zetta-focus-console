const LightModePlaceholder = () => (
	<div
		className='absolute inset-0 flex items-center justify-center'
		style={{
			background:
				'linear-gradient(135deg, #f3e7e9 0%, #e3eeff 50%, #f5f7fa 100%)'
		}}
	>
		<div className='text-center p-4'>
			<div className='text-4xl mb-2'>☀️</div>
			<div className='text-xs font-medium' style={{ color: '#4b5563' }}>
				Ambience disabled in light mode
			</div>
			<div className='text-[10px] mt-1' style={{ color: '#6b7280' }}>
				Switch to dark mode for ambient effects
			</div>
		</div>
	</div>
);

export default LightModePlaceholder;
