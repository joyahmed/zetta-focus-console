import Toggle from './Toggle';

const PlayIcon = () => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className='h-4 w-4'
		fill='none'
		viewBox='0 0 24 24'
		stroke='currentColor'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z'
		/>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
		/>
	</svg>
);

const StopIcon = () => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className='h-4 w-4'
		fill='none'
		viewBox='0 0 24 24'
		stroke='currentColor'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
		/>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z'
		/>
	</svg>
);

interface SoundSectionProps {
	soundVolume: number;
	onVolumeChange: (volume: number) => void;
	isMuted: boolean;
	onMuteToggle: () => void;
	playAmbientSound: boolean;
	onSoundPlay: () => void;
	onSoundStop: () => void;
	isLight: boolean;
}

const SoundSection = ({
	soundVolume,
	onVolumeChange,
	isMuted,
	onMuteToggle,
	playAmbientSound,
	onSoundPlay,
	onSoundStop,
	isLight
}: SoundSectionProps) => (
	<section>
		<h3
			className='text-sm font-medium uppercase tracking-wider mb-3'
			style={{
				color: 'var(--text-secondary)'
			}}
		>
			Sound
		</h3>
		<div
			className='space-y-3 p-2 rounded-lg'
			style={{
				backgroundColor: 'var(--bg-primary)',
				borderColor: 'var(--border-color)'
			}}
		>
			<div
				className='p-3 rounded-lg border glass-panel backdrop-blur-xl'
				style={{
					borderColor: 'var(--border-color)'
				}}
			>
				<div className='flex items-center justify-between mb-2'>
					<span
						className='text-sm'
						style={{ color: 'var(--text-primary)' }}
					>
						Volume
					</span>
					<span
						className='text-xs'
						style={{ color: 'var(--text-muted)' }}
					>
						{soundVolume}%
					</span>
				</div>
				<input
					type='range'
					min='0'
					max='100'
					value={soundVolume}
					onChange={e => onVolumeChange(parseInt(e.target.value))}
					className='w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-500'
					style={{
						background: `linear-gradient(to right,
      var(--accent-neon-secondary) 0%,
      var(--accent-neon-secondary) ${soundVolume}%,
      ${isLight ? '#d1d5db' : '#374151'} ${soundVolume}%,
      ${isLight ? '#d1d5db' : '#374151'} 100%)`
					}}
				/>
			</div>

			<div
				className='flex items-center justify-between p-3 rounded-lg border glass-panel glass-panel backdrop-blur-xl'
				style={{
					borderColor: 'var(--border-color)'
				}}
			>
				<div>
					<span
						className='text-sm'
						style={{ color: 'var(--text-primary)' }}
					>
						Mute
					</span>
					<div
						className='text-xs mt-0.5'
						style={{ color: 'var(--text-muted)' }}
					>
						Silence ambient sound
					</div>
				</div>
				<Toggle
					{...{
						enabled: isMuted,
						onChange: onMuteToggle,
						isLight
					}}
				/>
			</div>

			<button
				onClick={playAmbientSound ? onSoundStop : onSoundPlay}
				className={`w-full p-3 rounded-lg border transition-colors glass-panel  backdrop-blur-xl ${
					playAmbientSound
						? 'bg-red-500/10 border-red-500/30 text-red-400'
						: 'border-opacity-50'
				}`}
				style={{
					borderColor: playAmbientSound ? undefined : 'var(--border-color)',
					color: playAmbientSound ? undefined : 'var(--text-primary)'
				}}
			>
				<div className='flex items-center justify-center gap-2'>
					{playAmbientSound ? <StopIcon /> : <PlayIcon />}
					<span className='text-sm'>
						{playAmbientSound
							? 'Stop Ambient Sound'
							: 'Play Ambient Sound'}
					</span>
				</div>
			</button>
		</div>
	</section>
);

export default SoundSection;
