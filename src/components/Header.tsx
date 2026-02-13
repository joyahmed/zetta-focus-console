interface HeaderProps {
  activeProfileName: string;
  devMode: boolean;
}

export function Header({ activeProfileName, devMode }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-zetta-border bg-zetta-card">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Zetta Focus Console
        </h1>
        {devMode && (
          <span className="px-2 py-0.5 text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded">
            DEV
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">
          Profile: <span className="text-white">{activeProfileName}</span>
        </span>
        <div className="flex gap-2">
          <button className="p-1.5 text-gray-400 hover:text-white transition-colors" title="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
