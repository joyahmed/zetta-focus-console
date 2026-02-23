import { SettingsIcon } from './icons';

interface SettingsButtonProps {
	onClick: () => void;
}

const SettingsButton = ({ onClick }: SettingsButtonProps) => (
	<button
		onClick={onClick}
		className='group relative p-2 rounded-lg text-zetta-text-muted hover:text-zetta-text hover:bg-zetta-bg transition-all'
	>
		<SettingsIcon className='h-4 w-4' />
		<div className='absolute top-full right-0 mt-2 px-2 py-1 bg-zetta-panel border border-zetta-border text-zetta-text text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg backdrop-blur-md'>
			Settings
		</div>
	</button>
);

export default SettingsButton;
