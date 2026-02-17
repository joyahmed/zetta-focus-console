import Logo from '../../assets/icon.png';

interface LogoBrandProps {
	devMode: boolean;
}

const LogoBrand = ({ devMode }: LogoBrandProps) => (
	<div className='flex items-center gap-4 w-1/4'>
		<div className='relative group cursor-default'>
			<img
				src={Logo}
				alt='Zetta'
				className='h-8 w-auto opacity-90 group-hover:opacity-100 transition-opacity'
			/>
			<div className='absolute inset-0 bg-purple-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
		</div>

		{devMode && (
			<span className='px-1.5 py-0.5 text-[9px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded tracking-wider'>
				DEV
			</span>
		)}
	</div>
);

export default LogoBrand;
