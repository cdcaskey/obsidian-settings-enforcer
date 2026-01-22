import { Plugin, Notice } from 'obsidian';
import { SettingsEnforcerSettingTab } from './settings';
import { EnforcerSettings, DEFAULT_SETTINGS, ObsidianAppConfig } from './types';

export default class SettingsEnforcerPlugin extends Plugin {
	settings: EnforcerSettings;

	onload() {
		this.loadSettings().then(() => {
			// Add settings tab
			this.addSettingTab(new SettingsEnforcerSettingTab(this.app, this));
			
			// Enforce settings on startup if enabled
			if (this.settings.enabled) {
				this.enforceSettings();
			}
		});
		
		// Add command to manually enforce settings
		this.addCommand({
			id: 'enforce-settings-now',
			name: 'Enforce settings now',
			callback: () => this.enforceSettings()
		});
	}

	onunload() {
		// Plugin cleanup happens automatically
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	getCurrentCoreSettings(): ObsidianAppConfig {
		const config = (this.app.vault as unknown as { config: Record<string, unknown> }).config || {};
		return {
			newFileLocation: config.newFileLocation as 'current' | 'folder' | 'root',
			newFileFolderPath: config.newFileFolderPath as string,
			attachmentFolderPath: config.attachmentFolderPath as string
		};
	}

	async enforceSettings(): Promise<void> {
		if (!this.settings.enabled) {
			return;
		}

		try {
			const currentConfig = this.getCurrentCoreSettings();
			const configToUpdate: Partial<ObsidianAppConfig> = {};
			let hasChanges = false;

			// Check and update newFileLocation
			if (currentConfig.newFileLocation !== this.settings.newFileLocation) {
				configToUpdate.newFileLocation = this.settings.newFileLocation;
				hasChanges = true;
			}

			// Check and update newFileFolderPath
			if (currentConfig.newFileFolderPath !== this.settings.newFileFolderPath) {
				configToUpdate.newFileFolderPath = this.settings.newFileFolderPath;
				hasChanges = true;
			}

			// Check and update attachmentFolderPath
			if (currentConfig.attachmentFolderPath !== this.settings.attachmentFolderPath) {
				configToUpdate.attachmentFolderPath = this.settings.attachmentFolderPath;
				hasChanges = true;
			}

			// Apply changes if any
			if (hasChanges) {
				await this.updateVaultConfig(configToUpdate);
				new Notice('Settings enforced successfully');
			}
		} catch (error) {
			console.error('Failed to enforce settings:', error);
			new Notice('Failed to enforce settings. Check console for details.');
		}
	}

	private async updateVaultConfig(updates: Partial<ObsidianAppConfig>): Promise<void> {
		// Access the vault's config using the internal API
		const vault = this.app.vault as unknown as {
			setConfig?: (key: string, value: unknown) => Promise<void>;
			config?: Record<string, unknown>;
			trigger?: (event: string) => void;
		};
		
		if (vault.setConfig) {
			// Use the setConfig method if available (newer versions)
			for (const [key, value] of Object.entries(updates)) {
				await vault.setConfig(key, value);
			}
		} else {
			// Fallback to direct config modification
			const config = vault.config || {};
			Object.assign(config, updates);
			// Trigger a config save
			if (vault.trigger) {
				vault.trigger('config-changed');
			}
		}
	}
}