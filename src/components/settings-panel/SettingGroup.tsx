/**
 * A titled run of rows.
 *
 * Every section in the drawer is this shape, and each of them used to declare
 * its own heading — three of them by copying the same `<h3>` rather than using
 * the `SectionHeader` the other three imported.
 */
const SettingGroup = ({ title, children }: SettingGroupProps) => (
	<section>
		<h3 className='text-sm font-medium uppercase tracking-wider mb-3 text-zetta-text-secondary'>
			{title}
		</h3>
		<div className='space-y-3'>{children}</div>
	</section>
);

export default SettingGroup;
