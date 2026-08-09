import { VolumeOnIcon, VolumeOffIcon } from './icons';


const VolumeControl = ({
	volume,
	isMuted,
	onVolumeChange,
	onMuteToggle
}: VolumeControlProps) => (
	<div className='group/volume relative flex items-center bg-zetta-bg/50 rounded-lg hover:bg-zetta-bg transition-all duration-300 border border-transparent hover:border-zetta-border'>
		<button
			onClick={onMuteToggle}
			className='p-2 text-zetta-text-muted hover:text-zetta-text transition-colors relative z-10'
		>
			{isMuted || volume === 0 ? (
				<VolumeOffIcon className='h-4 w-4' />
			) : (
				<VolumeOnIcon className='h-4 w-4' />
			)}
		</button>

		<div className='w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 ease-out flex items-center pr-0 group-hover/volume:pr-2'>
			<input
				type='range'
				min='0'
				max='100'
				value={isMuted ? 0 : volume}
				onChange={(e) => onVolumeChange(parseInt(e.target.value))}
				className='w-full h-1 bg-zetta-border rounded-full appearance-none cursor-pointer
					[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zetta-text [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(var(--color-text-primary-rgb),0.5)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110'
			/>
		</div>
	</div>
);

export default VolumeControl;
