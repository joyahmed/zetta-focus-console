import { useSoundControl } from '../hooks/use-sound-control';

export default function SoundControl({
	isPlaying,
	isMuted,
	volume,
	currentSound
}: SoundControlProps) {
	const {
		localVolume,
		handleVolumeChange,
		handleMuteToggle,
		handlePlayStop
	} = useSoundControl({ isPlaying, volume });

	return (
		<div className='flex items-center gap-3 bg-zetta-bg/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-zetta-border/50 shadow-lg'>
			{/* Play/Stop Button */}
			<button
				onClick={handlePlayStop}
				className='p-2 rounded-md hover:bg-zetta-glow/20 transition-colors'
				title={
					isPlaying ? 'Stop ambient sound' : 'Play ambient sound'
				}
			>
				{isPlaying ? (
					<svg
						className='w-5 h-5 text-zetta-glow'
						fill='currentColor'
						viewBox='0 0 20 20'
					>
						<path
							fillRule='evenodd'
							d='M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z'
							clipRule='evenodd'
						/>
					</svg>
				) : (
					<svg
						className='w-5 h-5 text-gray-400 hover:text-zetta-glow'
						fill='currentColor'
						viewBox='0 0 20 20'
					>
						<path
							fillRule='evenodd'
							d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
							clipRule='evenodd'
						/>
					</svg>
				)}
			</button>

			{/* Mute Button */}
			<button
				onClick={handleMuteToggle}
				className='p-2 rounded-md hover:bg-zetta-glow/20 transition-colors'
				title={isMuted ? 'Unmute' : 'Mute'}
			>
				{isMuted ? (
					<svg
						className='w-5 h-5 text-gray-500'
						fill='currentColor'
						viewBox='0 0 20 20'
					>
						<path
							fillRule='evenodd'
							d='M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z'
							clipRule='evenodd'
						/>
					</svg>
				) : (
					<svg
						className='w-5 h-5 text-zetta-glow'
						fill='currentColor'
						viewBox='0 0 20 20'
					>
						<path
							fillRule='evenodd'
							d='M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z'
							clipRule='evenodd'
						/>
					</svg>
				)}
			</button>

			{/* Volume Slider */}
			<div className='flex items-center gap-2'>
				<svg
					className='w-4 h-4 text-gray-400'
					fill='currentColor'
					viewBox='0 0 20 20'
				>
					<path d='M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z' />
				</svg>
				<input
					type='range'
					min='0'
					max='100'
					value={localVolume}
					onChange={handleVolumeChange}
					className='w-24 h-2 bg-zetta-border rounded-lg appearance-none cursor-pointer accent-zetta-glow [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zetta-glow [&::-webkit-slider-thumb]:cursor-pointer'
				/>
				<span className='text-xs text-gray-400 w-8 text-right'>
					{localVolume}%
				</span>
			</div>

			{/* Current Sound Indicator */}
			{currentSound && (
				<span className='text-xs text-gray-400 hidden md:inline capitalize'>
					{currentSound.replace('.mp3', '').replace('_', ' ')}
				</span>
			)}
		</div>
	);
}
