import { App, PluginSettingTab, Setting } from 'obsidian';
import SettingsEnforcerPlugin from './main';
import { EnforcerSettings, DEFAULT_SETTINGS } from './types';

export class SettingsEnforcerSettingTab extends PluginSettingTab {
	plugin: SettingsEnforcerPlugin;

	constructor(app: App, plugin: SettingsEnforcerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// Main heading
		new Setting(containerEl)
			.setName('Configuration')
			.setHeading();
		
		containerEl.createEl('p', { 
			text: 'This plugin enforces selected Obsidian core settings at startup. These settings will override your core app configuration when the plugin is enabled.',
			cls: 'setting-item-description'
		});

		containerEl.createEl('p', {
			text: 'Warning: Enabling enforcement will override your current core settings for the specified options.',
			cls: 'mod-warning'
		});

		// Enable/Disable enforcement
		new Setting(containerEl)
			.setName('Enable enforcement')
			.setDesc('When enabled, the plugin will enforce the settings below at startup')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enabled)
				.onChange(async (value) => {
					this.plugin.settings.enabled = value;
					await this.plugin.saveSettings();
				}));

		// New File Location
		new Setting(containerEl)
			.setName('New file location')
			.setDesc('Where new files are created (core setting: newFileLocation)')
			.addDropdown(dropdown => dropdown
				.addOption('current', 'Same folder as current file')
				.addOption('folder', 'In the folder specified below')
				.addOption('root', 'In the vault root')
				.setValue(this.plugin.settings.newFileLocation)
				.onChange(async (value: 'current' | 'folder' | 'root') => {
					this.plugin.settings.newFileLocation = value;
					await this.plugin.saveSettings();
				}));

		// New File Folder Path
		new Setting(containerEl)
			.setName('New file folder path')
			.setDesc('Folder path for new files when location is set to "folder" (core setting: newFileFolderPath)')
			.addText(text => text
				.setPlaceholder('Unsorted Notes')
				.setValue(this.plugin.settings.newFileFolderPath)
				.onChange(async (value) => {
					this.plugin.settings.newFileFolderPath = value;
					await this.plugin.saveSettings();
				}));

		// Attachment Folder Path
		new Setting(containerEl)
			.setName('Attachment folder path')
			.setDesc('Folder path for attachments, relative to each note (core setting: attachmentFolderPath)')
			.addText(text => text
				.setPlaceholder('./attachments')
				.setValue(this.plugin.settings.attachmentFolderPath)
				.onChange(async (value) => {
					this.plugin.settings.attachmentFolderPath = value;
					await this.plugin.saveSettings();
				}));

		// Reset to defaults
		new Setting(containerEl)
			.setName('Reset to defaults')
			.setDesc('Reset all settings to their default values')
			.addButton(button => button
				.setButtonText('Reset')
				.setWarning()
				.onClick(async () => {
					this.plugin.settings = { ...DEFAULT_SETTINGS };
					await this.plugin.saveSettings();
					this.display(); // Refresh the display
				}));

		// Current values display
		new Setting(containerEl)
			.setName('Current core values')
			.setHeading();
		
		const currentSettings = this.plugin.getCurrentCoreSettings();
		
		const currentDiv = containerEl.createDiv('setting-item-description');
		currentDiv.createEl('p', { text: `Current newFileLocation: ${currentSettings.newFileLocation || 'not set'}` });
		currentDiv.createEl('p', { text: `Current newFileFolderPath: ${currentSettings.newFileFolderPath || 'not set'}` });
		currentDiv.createEl('p', { text: `Current attachmentFolderPath: ${currentSettings.attachmentFolderPath || 'not set'}` });
	}
}