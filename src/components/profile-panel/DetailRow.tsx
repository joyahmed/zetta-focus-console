/**
 * A label on the left, its value on the right.
 *
 * Season, motion intensity and background were three copies of the same six
 * lines, differing only in the two strings and whether the value wanted
 * capitalising.
 */
const DetailRow = ({ label, value, capitalize = false }: DetailRowProps) => (
	<div className='flex justify-between text-xs mb-1'>
		<span style={{ color: 'var(--text-secondary)' }}>{label}</span>
		<span
			style={{ color: 'var(--text-primary)' }}
			className={capitalize ? 'capitalize' : undefined}
		>
			{value}
		</span>
	</div>
);

export default DetailRow;
