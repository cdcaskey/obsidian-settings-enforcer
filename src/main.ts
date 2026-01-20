import { Plugin, Notice } from 'obsidian';
import { SettingsEnforcerSettingTab } from './settings';
import { EnforcerSettings, DEFAULT_SETTINGS, ObsidianAppConfig } from './types';

export default class SettingsEnforcerPlugin extends Plugin {
	settings: EnforcerSettings;

	async onload() {
		console.log('Loading Settings Enforcer plugin');
		
		await this.loadSettings();
		
		// Add settings tab
		this.addSettingTab(new SettingsEnforcerSettingTab(this.app, this));
		
		// Enforce settings on startup if enabled
		if (this.settings.enabled) {
			await this.enforceSettings();
		}
		
		// Add command to manually enforce settings
		this.addCommand({
			id: 'enforce-settings-now',
			name: 'Enforce settings now',
			callback: () => this.enforceSettings()
		});
	}

	async onunload() {
		console.log('Unloading Settings Enforcer plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	getCurrentCoreSettings(): ObsidianAppConfig {
		const config = (this.app as any).vault.config || {};
		return {
			newFileLocation: config.newFileLocation,
			newFileFolderPath: config.newFileFolderPath,
			attachmentFolderPath: config.attachmentFolderPath
		};
	}

	async enforceSettings(): Promise<void> {
		if (!this.settings.enabled) {
			console.log('Settings enforcement is disabled');
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
				console.log(`Updating newFileLocation: ${currentConfig.newFileLocation} → ${this.settings.newFileLocation}`);
			}

			// Check and update newFileFolderPath
			if (currentConfig.newFileFolderPath !== this.settings.newFileFolderPath) {
				configToUpdate.newFileFolderPath = this.settings.newFileFolderPath;
				hasChanges = true;
				console.log(`Updating newFileFolderPath: ${currentConfig.newFileFolderPath} → ${this.settings.newFileFolderPath}`);
			}

			// Check and update attachmentFolderPath
			if (currentConfig.attachmentFolderPath !== this.settings.attachmentFolderPath) {
				configToUpdate.attachmentFolderPath = this.settings.attachmentFolderPath;
				hasChanges = true;
				console.log(`Updating attachmentFolderPath: ${currentConfig.attachmentFolderPath} → ${this.settings.attachmentFolderPath}`);
			}

			// Apply changes if any
			if (hasChanges) {
				await this.updateVaultConfig(configToUpdate);
				new Notice('Settings enforced successfully');
			} else {
				console.log('No settings changes needed');
			}
		} catch (error) {
			console.error('Failed to enforce settings:', error);
			new Notice('Failed to enforce settings. Check console for details.');
		}
	}

	private async updateVaultConfig(updates: Partial<ObsidianAppConfig>): Promise<void> {
		// Access the vault's config using the internal API
		const vault = this.app.vault as any;
		
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