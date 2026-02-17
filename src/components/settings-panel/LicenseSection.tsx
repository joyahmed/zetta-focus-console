interface LicenseSectionProps {
	currentLicense: string;
	trialDaysRemaining: number | null;
	licenseKey: string;
	setLicenseKey: (key: string) => void;
	licenseMessage: string;
	handleActivateLicense: (e: React.FormEvent) => void;
}

const LicenseSection = ({
	currentLicense,
	trialDaysRemaining,
	licenseKey,
	setLicenseKey,
	licenseMessage,
	handleActivateLicense
}: LicenseSectionProps) => (
	<section>
		<h3
			className='text-sm font-medium uppercase tracking-wider mb-3'
			style={{ color: 'var(--text-secondary)' }}
		>
			License
		</h3>
		<div
			className='p-3 rounded-lg border mb-3'
			style={{
				backgroundColor: 'var(--bg-primary)',
				borderColor: 'var(--border-color)'
			}}
		>
			<div className='text-xs' style={{ color: 'var(--text-muted)' }}>
				Current License
			</div>
			<div className='text-lg font-semibold' style={{ color: 'var(--text-primary)' }}>
				{currentLicense === 'Trial' && trialDaysRemaining !== null
					? `Trial - ${trialDaysRemaining} days left`
					: currentLicense}
			</div>
		</div>
		<form onSubmit={handleActivateLicense}>
			<div className='flex gap-2'>
				<input
					type='text'
					value={licenseKey}
					onChange={(e) => setLicenseKey(e.target.value)}
					placeholder='ZETTA-PRO-XXXX or ZETTA-FOUNDER-XXXX'
					className='flex-1 p-2 rounded-lg border text-sm'
					style={{
						backgroundColor: 'var(--bg-primary)',
						borderColor: 'var(--border-color)',
						color: 'var(--text-primary)'
					}}
				/>
				<button
					type='submit'
					className='px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors'
				>
					Activate
				</button>
			</div>
			{licenseMessage && (
				<div
					className='mt-2 text-xs p-2 rounded'
					style={{
						backgroundColor: 'var(--bg-primary)',
						color: 'var(--text-muted)'
					}}
				>
					{licenseMessage}
				</div>
			)}
		</form>
	</section>
);

export default LicenseSection;
