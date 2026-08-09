const ProfilePill = ({ activeProfileName }: ProfilePillProps) => (
	<div className='hidden xl:flex items-center px-3 py-1.5 rounded-full bg-zetta-bg/50 border border-zetta-border hover:bg-zetta-bg transition-colors'>
		<span className='w-1.5 h-1.5 rounded-full bg-zetta-neon mr-2 animate-pulse' />
		<span className='text-xs font-medium text-zetta-text-secondary truncate max-w-[100px]'>
			{activeProfileName}
		</span>
	</div>
);

export default ProfilePill;
