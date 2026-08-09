interface SectionHeaderProps {
	title: string;
}

const SectionHeader = ({ title }: SectionHeaderProps) => (
	<h3
		className='text-sm font-medium uppercase tracking-wider mb-3'
		style={{ color: 'var(--text-secondary)' }}
	>
		{title}
	</h3>
);

export default SectionHeader;
