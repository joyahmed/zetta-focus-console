export const commandGroups: CommandGroup[] = [
	{
		title: 'Session Control',
		commands: [
			{
				cmd: 'start',
				description:
					'Start session (uses override if set, else profile defaults)'
			},
			{
				cmd: 'stop',
				description: 'Stop current session (override preserved)'
			},
			{ cmd: 'pause', description: 'Pause current session' },
			{ cmd: 'resume', description: 'Resume paused session' },
			{ cmd: 'status', description: 'Show current session status' }
		]
	},
	{
		title: 'Runtime Override',
		commands: [
			{
				cmd: 'timer [duration]',
				description: 'Set focus duration (e.g., timer 1m, timer 30s)'
			},
			{
				cmd: 'break [duration]',
				description: 'Set break duration (e.g., break 30s, break 5m)'
			},
			{ cmd: 'loop [count]', description: 'Set loop count (1-100)' },
			{ cmd: 'override clear', description: 'Clear session override' }
		]
	},
	{
		title: 'Profile Management',
		commands: [
			{ cmd: 'profile [name]', description: 'Switch to a profile' },
			{
				cmd: 'profile list',
				description: 'List all available profiles'
			},
			{
				cmd: 'season [name]',
				description: 'Change season (spring/summer/autumn/winter)'
			}
		]
	},
	{
		title: 'Configuration',
		commands: [
			{
				cmd: 'config show',
				description: 'Show current configuration'
			},
			{ cmd: 'stats', description: 'Show detailed statistics' }
		]
	},
	{
		title: 'Sound Control',
		commands: [
			{ cmd: 'sound play', description: 'Play ambient sound' },
			{ cmd: 'sound stop', description: 'Stop ambient sound' },
			{
				cmd: 'sound volume [0-100]',
				description: 'Set volume level'
			},
			{ cmd: 'sound mute', description: 'Toggle mute' }
		]
	},
	{
		title: 'Visual Settings',
		commands: [
			{
				cmd: 'ambience on/off',
				description: 'Toggle ambient visuals'
			},
			{ cmd: 'ambience', description: 'Show current ambience status' }
		]
	},
	{
		title: 'Developer',
		commands: [
			{ cmd: 'devmode on/off', description: 'Toggle developer mode' }
		]
	},
	{
		title: 'System Information',
		commands: [
			{ cmd: 'system', description: 'Show system information' },
			{ cmd: 'memory', description: 'Show memory usage' },
			{ cmd: 'cpu', description: 'Show CPU usage' }
		]
	},
	{
		title: 'Terminal',
		commands: [
			{ cmd: 'clear', description: 'Clear terminal' },
			{ cmd: 'help', description: 'Show this help message' }
		]
	}
];