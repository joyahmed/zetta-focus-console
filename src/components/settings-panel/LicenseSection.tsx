import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

// Types for payment data
interface PricingInfo {
	product_type: 'pro' | 'founder';
	price_usd: number;
	price_bdt: number;
	currency_symbol: string;
	is_one_time: boolean;
	features: string[];
}

interface BKashPaymentInfo {
	merchant_number: string;
	amount: number;
	instructions: string;
	contact_email: string;
}

interface CheckoutInfo {
	provider: 'lemon_squeezy' | 'bkash' | 'stripe';
	product_type: 'pro' | 'founder';
	checkout_url: string | null;
	bkash_info: BKashPaymentInfo | null;
	pricing: PricingInfo;
}

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
}: LicenseSectionProps) => {
	const [showPaymentOptions, setShowPaymentOptions] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<'pro' | 'founder'>('pro');
	const [proPricing, setProPricing] = useState<PricingInfo | null>(null);
	const [founderPricing, setFounderPricing] = useState<PricingInfo | null>(null);
	const [checkoutInfo, setCheckoutInfo] = useState<CheckoutInfo | null>(null);
	const [loading, setLoading] = useState(false);

	// Fetch payment options and pricing on mount
	useEffect(() => {
		const fetchPaymentData = async () => {
			try {
				const proPrice = await invoke<PricingInfo>('payment_get_pricing', { productType: 'pro' });
				setProPricing(proPrice);

				const founderPrice = await invoke<PricingInfo>('payment_get_pricing', { productType: 'founder' });
				setFounderPricing(founderPrice);
			} catch (error) {
				console.error('Failed to fetch payment data:', error);
			}
		};

		fetchPaymentData();
	}, []);

	// Handle checkout
	const handleCheckout = async (provider: 'lemon_squeezy' | 'bkash') => {
		setLoading(true);
		try {
			const info = await invoke<CheckoutInfo>('payment_get_checkout_info', {
				productType: selectedProduct,
				provider: provider,
				discountCode: null
			});
			setCheckoutInfo(info);

			// Open browser for Lemon Squeezy
			if (provider === 'lemon_squeezy' && info.checkout_url) {
				await invoke('payment_open_checkout', { url: info.checkout_url });
			}
		} catch (error) {
			console.error('Failed to get checkout info:', error);
		} finally {
			setLoading(false);
		}
	};

	// Check if user has Pro or Founder
	const hasPro = currentLicense === 'Pro' || currentLicense === 'Founder';

	return (
		<section>
			<h3
				className='text-sm font-medium uppercase tracking-wider mb-3'
				style={{ color: 'var(--text-secondary)' }}
			>
				License
			</h3>
	<div className='space-y-3 p-2 rounded-lg'
			style={{
					backgroundColor: 'var(--bg-primary)',
					borderColor: 'var(--border-color)'
				}}
			>
			{/* Current License Status */}
			<div
				className='p-3 rounded-lg border glass-panel bg-black/5 backdrop-blur-xl'
				style={{

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

			{/* License Key Activation */}
			<form onSubmit={handleActivateLicense} className='mb-4'>
				<div className='flex gap-2 min-w-0'>
					<input
						type='text'
						value={licenseKey}
						onChange={(e) => setLicenseKey(e.target.value)}
						placeholder='ZFC-PRO-XXXX-XXXX or ZFC-FOUNDER-XXXX-XXXX'
						className='flex-1 min-w-0 p-2 rounded-lg border text-sm glass-panel bg-black/5 backdrop-blur-xl '
						style={{
							borderColor: 'var(--border-color)',
							color: 'var(--text-primary)'
						}}
					/>
					<button
						type='submit'
						className=' px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors'
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

			{/* Upgrade Section - Only show for Free/Trial users */}
			{!hasPro && (
				<div className='mt-4'>
					<button
						onClick={() => setShowPaymentOptions(!showPaymentOptions)}
						className='w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-sm font-medium transition-all'
					>
						{showPaymentOptions ? 'Hide Upgrade Options' : 'Upgrade to Pro'}
					</button>

					{showPaymentOptions && (
						<div className='mt-4 space-y-4'>
							{/* Product Selection */}
							<div
								className='p-3 rounded-lg border'
								style={{
									backgroundColor: 'var(--bg-primary)',
									borderColor: 'var(--border-color)'
								}}
							>
								<div className='text-xs uppercase tracking-wider mb-2' style={{ color: 'var(--text-muted)' }}>
									Select License
								</div>
								<div className='grid grid-cols-2 gap-2'>
									{/* Pro Option */}
									<button
										onClick={() => setSelectedProduct('pro')}
										className={`p-3 rounded-lg border text-left transition-all ${
											selectedProduct === 'pro'
												? 'border-blue-500 ring-1 ring-blue-500'
												: 'border-gray-600'
										}`}
										style={{ backgroundColor: 'var(--bg-secondary)' }}
									>
										<div className='font-semibold' style={{ color: 'var(--text-primary)' }}>
											Pro
										</div>
										{proPricing && (
											<div className='text-sm' style={{ color: 'var(--text-muted)' }}>
												{proPricing.currency_symbol}{proPricing.price_usd} USD
											</div>
										)}
										<div className='text-xs mt-1' style={{ color: 'var(--text-muted)' }}>
											Lifetime access
										</div>
									</button>

									{/* Founder Option */}
									<button
										onClick={() => setSelectedProduct('founder')}
										className={`p-3 rounded-lg border text-left transition-all ${
											selectedProduct === 'founder'
												? 'border-purple-500 ring-1 ring-purple-500'
												: 'border-gray-600'
										}`}
										style={{ backgroundColor: 'var(--bg-secondary)' }}
									>
										<div className='font-semibold flex items-center gap-1' style={{ color: 'var(--text-primary)' }}>
											<span>Founder</span>
											<span className='text-xs px-1 py-0.5 bg-purple-600 rounded'>Limited</span>
										</div>
										{founderPricing && (
											<div className='text-sm' style={{ color: 'var(--text-muted)' }}>
												{founderPricing.currency_symbol}{founderPricing.price_usd} USD
											</div>
										)}
										<div className='text-xs mt-1' style={{ color: 'var(--text-muted)' }}>
											Early supporter
										</div>
									</button>
								</div>
							</div>

							{/* Payment Options */}
							<div
								className='p-3 rounded-lg border'
								style={{
									backgroundColor: 'var(--bg-primary)',
									borderColor: 'var(--border-color)'
								}}
							>
								<div className='text-xs uppercase tracking-wider mb-2' style={{ color: 'var(--text-muted)' }}>
									Payment Method
								</div>
								<div className='space-y-2'>
									{/* Lemon Squeezy */}
									<button
										onClick={() => handleCheckout('lemon_squeezy')}
										disabled={loading}
										className='w-full p-3 rounded-lg border border-yellow-500/50 hover:border-yellow-500 text-left transition-all disabled:opacity-50'
										style={{ backgroundColor: 'var(--bg-secondary)' }}
									>
										<div className='flex items-center justify-between'>
											<div>
												<div className='font-semibold' style={{ color: 'var(--text-primary)' }}>
													🍋 Lemon Squeezy
												</div>
												<div className='text-xs' style={{ color: 'var(--text-muted)' }}>
													Global payment - Credit card, PayPal, Apple Pay
												</div>
											</div>
											<svg
												className='w-4 h-4'
												style={{ color: 'var(--text-muted)' }}
												fill='none'
												stroke='currentColor'
												viewBox='0 0 24 24'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
												/>
											</svg>
										</div>
									</button>

									{/* bKash */}
									<button
										onClick={() => handleCheckout('bkash')}
										disabled={loading}
										className='w-full p-3 rounded-lg border border-pink-500/50 hover:border-pink-500 text-left transition-all disabled:opacity-50'
										style={{ backgroundColor: 'var(--bg-secondary)' }}
									>
										<div className='flex items-center justify-between'>
											<div>
												<div className='font-semibold' style={{ color: 'var(--text-primary)' }}>
													📱 bKash
												</div>
												<div className='text-xs' style={{ color: 'var(--text-muted)' }}>
													Bangladesh local payment - Manual key issuance
												</div>
											</div>
											<span
												className='text-xs px-2 py-1 rounded'
												style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)' }}
											>
												{selectedProduct === 'pro' ? '৳2,499' : '৳1,499'} BDT
											</span>
										</div>
									</button>
								</div>
							</div>

							{/* bKash Payment Info */}
							{checkoutInfo?.bkash_info && (
								<div
									className='p-3 rounded-lg border border-pink-500/30'
									style={{
										backgroundColor: 'var(--bg-primary)',
										borderColor: 'var(--border-color)'
									}}
								>
									<div className='text-xs uppercase tracking-wider mb-2' style={{ color: 'var(--text-muted)' }}>
										bKash Payment Instructions
									</div>
									<div className='space-y-2 text-sm' style={{ color: 'var(--text-primary)' }}>
										<div>
											<span style={{ color: 'var(--text-muted)' }}>Send to:</span>{' '}
											<span className='font-mono font-semibold'>{checkoutInfo.bkash_info.merchant_number}</span>
										</div>
										<div>
											<span style={{ color: 'var(--text-muted)' }}>Amount:</span>{' '}
											<span className='font-semibold'>৳{checkoutInfo.bkash_info.amount} BDT</span>
										</div>
										<div className='text-xs p-2 rounded' style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
											{checkoutInfo.bkash_info.instructions}
										</div>
										<div className='text-xs' style={{ color: 'var(--text-muted)' }}>
											Contact: {checkoutInfo.bkash_info.contact_email}
										</div>
									</div>
								</div>
							)}

							{/* Features List */}
							{(selectedProduct === 'pro' ? proPricing : founderPricing)?.features && (
								<div
									className='p-3 rounded-lg border'
									style={{
										backgroundColor: 'var(--bg-primary)',
										borderColor: 'var(--border-color)'
									}}
								>
									<div className='text-xs uppercase tracking-wider mb-2' style={{ color: 'var(--text-muted)' }}>
										Included Features
									</div>
									<ul className='space-y-1'>
										{(selectedProduct === 'pro' ? proPricing : founderPricing)?.features.map((feature, index) => (
											<li
												key={index}
												className='flex items-center gap-2 text-sm'
												style={{ color: 'var(--text-primary)' }}
											>
												<span style={{ color: 'var(--accent-color)' }}>✓</span>
												{feature}
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					)}
				</div>
			)}

			{/* Founder Badge */}
			{currentLicense === 'Founder' && (
				<div
					className='mt-3 p-3 rounded-lg border border-purple-500/30'
					style={{
						background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1))'
					}}
				>
					<div className='flex items-center gap-2'>
						<span className='text-lg'>🏆</span>
						<div>
							<div className='font-semibold text-purple-400'>Founder Edition</div>
							<div className='text-xs' style={{ color: 'var(--text-muted)' }}>
								Thank you for your early support!
							</div>
						</div>
					</div>
					</div>

				)}
				</div>
		</section>
	);
};

export default LicenseSection;
