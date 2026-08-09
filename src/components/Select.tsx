import { createPortal } from 'react-dom';
import { useSelect } from '../hooks/use-select';

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 20 20'
		fill='currentColor'
		className={`h-4 w-4 shrink-0 text-zetta-text-muted transition-transform duration-150 ${
			isOpen ? '-rotate-180' : ''
		}`}
	>
		<path
			fillRule='evenodd'
			d='M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'
			clipRule='evenodd'
		/>
	</svg>
);

const CheckIcon = () => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 20 20'
		fill='currentColor'
		className='h-3.5 w-3.5 shrink-0 text-zetta-neon'
	>
		<path
			fillRule='evenodd'
			d='M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.79 6.8-6.79a1 1 0 011.4 0z'
			clipRule='evenodd'
		/>
	</svg>
);

/**
 * The dropdown.
 *
 * A native `<select>` draws its list with the operating system, which is the
 * one part of this window Windows renders in its own colours: a white Win32
 * popup with the system highlight, arriving in the middle of a dark dialog and
 * ignoring the theme entirely. It also cannot show a check against the current
 * option, cannot be styled per row, and its closed state is a browser control
 * with a browser arrow that matched nothing around it.
 *
 * Everything here is the app's own tokens, and the list is a portal so it can
 * leave the scrolling dialog body it lives in — see use-select.
 */
const Select = ({
	value,
	options,
	onChange,
	labelledBy
}: SelectProps) => {
	const {
		isOpen,
		toggle,
		position,
		activeIndex,
		setActiveIndex,
		selectAt,
		selectedIndex,
		selectedOption,
		triggerRef,
		listRef,
		handleTriggerKeyDown,
		handleListKeyDown
	} = useSelect({ value, options, onChange });

	return (
		<>
			<button
				ref={triggerRef}
				type='button'
				role='combobox'
				aria-expanded={isOpen}
				aria-haspopup='listbox'
				aria-labelledby={labelledBy}
				onClick={toggle}
				onKeyDown={handleTriggerKeyDown}
				className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-zetta-inset border rounded text-sm text-zetta-text text-left transition-colors  focus:outline-none ${
					isOpen ? '' : 'border-zetta-border'
				}`}
			>
				<span className='truncate'>
					{selectedOption?.label ?? 'Select…'}
				</span>
				<ChevronIcon {...{ isOpen }} />
			</button>

			{isOpen &&
				position &&
				createPortal(
					<ul
						ref={listRef}
						role='listbox'
						tabIndex={-1}
						aria-activedescendant={
							activeIndex >= 0
								? `select-option-${options[activeIndex]?.value}`
								: undefined
						}
						onKeyDown={handleListKeyDown}
						style={{
							position: 'fixed',
							top: position.top,
							left: position.left,
							width: position.width,
							maxHeight: position.maxHeight
						}}
						className='popover-surface z-[60] overflow-y-auto custom-scrollbar py-1 rounded-md focus:outline-none'
					>
						{options.map((option, index) => (
							<li
								key={option.value}
								id={`select-option-${option.value}`}
								role='option'
								aria-selected={index === selectedIndex}
								onMouseEnter={() => setActiveIndex(index)}
								onClick={() => selectAt(index)}
								className={`flex items-center justify-between gap-2 px-3 py-2 text-sm cursor-pointer ${
									index === activeIndex
										? 'bg-zetta-panel text-zetta-text'
										: 'text-zetta-text-secondary'
								}`}
							>
								<span className='truncate'>{option.label}</span>
								{index === selectedIndex && <CheckIcon />}
							</li>
						))}
					</ul>,
					document.body
				)}
		</>
	);
};

export default Select;
