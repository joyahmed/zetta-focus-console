// import Toggle from './Toggle';

interface DevModeSectionProps {
	devMode: boolean;
	onDevModeToggle: () => void;
	isLight: boolean;
}

// NOTE: Developer Mode toggle is now hidden in settings.
// The functionality is still available and controlled via backend.
// Developer Mode statistics are now shown in the Stats Panel instead.

const DevModeSection = ({
	devMode: _devMode,
	onDevModeToggle: _onDevModeToggle,
	isLight: _isLight
}: DevModeSectionProps) =>
	// Developer Mode toggle is commented out - functionality moved to Stats Panel
	// <section>
	// 	<h3
	// 		className='text-sm font-medium uppercase tracking-wider mb-3'
	// 		style={{ color: 'var(--text-secondary)' }}
	// 	>
	// 		Developer
	// 	</h3>
	// 	<div
	// 		className='flex items-center justify-between p-3 rounded-lg border'
	// 		style={{
	// 			backgroundColor: 'var(--bg-primary)',
	// 			borderColor: 'var(--border-color)'
	// 		}}
	// 	>
	// 		<span className='text-sm' style={{ color: 'var(--text-primary)' }}>
	// 			Developer Mode
	// 		</span>
	// 		<Toggle
	// 			{...{
	// 				enabled: devMode,
	// 				onChange: onDevModeToggle,
	// 				isLight
	// 			}}
	// 		/>
	// 	</div>
	// </section>
	null;

export default DevModeSection;
