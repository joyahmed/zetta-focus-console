/**
 * What the command list shows.
 *
 * This is the list `help` opens, so it has to be the whole command set rather
 * than a sample of it — it used to be a subset written before half of these
 * existed, and it was never opened by anything, so nobody noticed it had gone
 * out of date. The grouping follows the README's, so the two read the same way
 * round.
 */
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
			{ cmd: 'status', description: 'Show current session status' },
			{
				cmd: 'sessions [1-20]',
				description: 'Set or view sessions per cycle'
			}
		]
	},
	{
		title: 'Runtime Override',
		commands: [
			{
				cmd: 'timer [duration]',
				description: 'Set focus duration (e.g. timer 50m, timer 30s)'
			},
			{
				cmd: 'break [duration]',
				description: 'Set break duration (e.g. break 10m, break 30s)'
			},
			{
				cmd: 'loop [count]',
				description: 'Run a cycle of this many sessions'
			},
			{
				cmd: 'override clear',
				description: 'Drop the override, back to profile defaults'
			}
		]
	},
	{
		title: 'Profiles',
		commands: [
			{ cmd: 'profile [id]', description: 'Switch to a profile' },
			{
				cmd: 'profile list',
				description: 'List all available profiles'
			},
			{ cmd: 'profile create', description: 'Create a custom profile' },
			{ cmd: 'profile edit [id]', description: 'Edit a custom profile' },
			{ cmd: 'profile duplicate', description: 'Copy a profile' },
			{
				cmd: 'profile delete [id]',
				description: 'Delete a custom profile'
			},
			{
				cmd: 'season [name]',
				description: 'Change season (spring/summer/autumn/winter)'
			}
		]
	},
	{
		title: 'Discipline',
		commands: [
			{
				cmd: 'strict on',
				description: 'No pausing or stopping until the session completes'
			},
			{ cmd: 'strict off', description: 'Disable Strict Mode (when idle)' },
			{
				cmd: 'task set "name"',
				description: 'Bind an intention to the session'
			}
		]
	},
	{
		title: 'Sound',
		commands: [
			{ cmd: 'sound play', description: 'Play ambient sound' },
			{ cmd: 'sound stop', description: 'Stop ambient sound' },
			{ cmd: 'sound volume [0-100]', description: 'Set volume level' },
			{ cmd: 'sound mute', description: 'Toggle mute' },
			{
				cmd: 'alarm on/off',
				description: 'Tones at session, break and cycle end'
			}
		]
	},
	{
		title: 'Appearance',
		commands: [
			{ cmd: 'ambience on/off', description: 'Show or hide the particles' },
			{ cmd: 'theme [mode]', description: 'Set theme (dark, light, system)' }
		]
	},
	{
		title: 'Configuration',
		commands: [
			{ cmd: 'config show', description: 'Show current configuration' },
			{
				cmd: 'stats',
				description: 'Statistics, and how the last seven days went'
			},
			{
				cmd: 'reset',
				description: 'Restore defaults and clear the statistics'
			}
		]
	},
	{
		title: 'Diagnostics',
		commands: [
			{ cmd: 'system', description: 'Show system information' },
			{ cmd: 'memory', description: 'Show memory usage' },
			{ cmd: 'cpu', description: 'Show CPU usage' },
			{
				cmd: 'usage',
				description: 'App usage stats (CPU, memory, uptime)'
			},
			{ cmd: 'app usage', description: 'Engine process memory' },
			{ cmd: 'engine state', description: 'Engine state inspection' },
			{ cmd: 'engine reset', description: 'Reset the engine' },
			{ cmd: 'devmode on/off', description: 'Developer diagnostics' }
		]
	},
	{
		title: 'Terminal',
		commands: [
			{ cmd: 'history', description: 'Show the commands you have run' },
			{ cmd: 'history clear', description: 'Forget them' },
			{ cmd: 'clear', description: 'Clear the terminal' },
			{ cmd: 'help', description: 'Open this list' }
		]
	}
];
