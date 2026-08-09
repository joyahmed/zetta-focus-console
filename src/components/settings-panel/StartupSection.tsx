import {
	STARTUP_SETTINGS,
	useStartupSettings
} from '../../hooks/use-startup-settings';
import SectionHeader from './SectionHeader';
import Toggle from './Toggle';

const StartupSection = ({ isLight }: StartupSectionProps) => {
	const { values, loading, toggle } = useStartupSettings();

	if (loading) {
		return (
			<section>
				<SectionHeader title='Startup' />
				<div className='animate-pulse space-y-3'>
					{STARTUP_SETTINGS.map(setting => (
						<div
							key={setting.key}
							className='h-12 bg-zetta-panel rounded-lg'
						/>
					))}
				</div>
			</section>
		);
	}

	return (
		<section>
			<SectionHeader title='Startup' />

			<div
				className='space-y-3 p-2 rounded-lg'
				style={{
					backgroundColor: 'var(--bg-primary)',
					borderColor: 'var(--border-color)'
				}}
			>
				{STARTUP_SETTINGS.map(setting => (
					<div
						key={setting.key}
						className='flex items-center justify-between p-3 rounded-lg border glass-panel backdrop-blur-xl'
						style={{ borderColor: 'var(--border-color)' }}
					>
						<div>
							<div
								className='text-sm font-medium'
								style={{ color: 'var(--text-primary)' }}
							>
								{setting.title}
							</div>
							<div
								className='text-xs'
								style={{ color: 'var(--text-muted)' }}
							>
								{setting.description}
							</div>
						</div>
						<Toggle
							{...{
								enabled: values[setting.key],
								onChange: () => toggle(setting),
								isLight
							}}
						/>
					</div>
				))}
			</div>
		</section>
	);
};

export default StartupSection;
