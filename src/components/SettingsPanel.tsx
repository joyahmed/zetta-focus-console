interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  devMode: boolean;
  onDevModeToggle: () => void;
  ambienceEnabled: boolean;
  onAmbienceToggle: () => void;
}

export function SettingsPanel({ isOpen, onClose, devMode, onDevModeToggle, ambienceEnabled, onAmbienceToggle }: SettingsPanelProps) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-80 bg-zetta-card border-l border-zetta-border z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-zetta-border">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-6">
          <section>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              Visual
            </h3>
            <div className="flex items-center justify-between p-3 bg-zetta-bg rounded-lg border border-zetta-border">
              <div>
                <span className="text-sm text-gray-300">Ambient Animations</span>
                <div className="text-xs text-gray-500 mt-0.5">Seasonal visual effects</div>
              </div>
              <button
                onClick={onAmbienceToggle}
                className={`relative w-11 h-6 rounded-full transition-colors ${ambienceEnabled ? 'bg-blue-500' : 'bg-gray-600'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${ambienceEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              Background Mode
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-zetta-bg rounded-lg border border-zetta-border cursor-pointer hover:border-gray-500 transition-colors">
                <input type="radio" name="bg" defaultChecked className="accent-blue-500" />
                <span className="text-sm text-gray-300">Gradient Theme</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-zetta-bg rounded-lg border border-zetta-border cursor-pointer hover:border-gray-500 transition-colors">
                <input type="radio" name="bg" className="accent-blue-500" />
                <span className="text-sm text-gray-300">Subtle Particles</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-zetta-bg rounded-lg border border-zetta-border cursor-pointer hover:border-gray-500 transition-colors opacity-50">
                <input type="radio" name="bg" disabled className="accent-blue-500" />
                <span className="text-sm text-gray-300">Custom Image (Coming Soon)</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-zetta-bg rounded-lg border border-zetta-border cursor-pointer hover:border-gray-500 transition-colors opacity-50">
                <input type="radio" name="bg" disabled className="accent-blue-500" />
                <span className="text-sm text-gray-300">Custom Video (Coming Soon)</span>
              </label>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              Developer
            </h3>
            <div className="flex items-center justify-between p-3 bg-zetta-bg rounded-lg border border-zetta-border">
              <span className="text-sm text-gray-300">Developer Mode</span>
              <button
                onClick={onDevModeToggle}
                className={`relative w-11 h-6 rounded-full transition-colors ${devMode ? 'bg-blue-500' : 'bg-gray-600'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${devMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              Data
            </h3>
            <button className="w-full p-3 bg-zetta-bg rounded-lg border border-zetta-border text-left hover:border-red-500/50 transition-colors group">
              <div className="text-sm text-gray-300 group-hover:text-red-400">Reset Settings</div>
              <div className="text-xs text-gray-500 mt-0.5">Restore default configuration</div>
            </button>
          </section>

          <section className="pt-4 border-t border-zetta-border">
            <div className="text-xs text-gray-500">
              Zetta Focus Console v1.0.0
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
