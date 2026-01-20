export interface EnforcerSettings {
	enabled: boolean;
	newFileLocation: 'current' | 'folder' | 'root';
	newFileFolderPath: string;
	attachmentFolderPath: string;
}

export const DEFAULT_SETTINGS: EnforcerSettings = {
	enabled: true,
	newFileLocation: 'folder',
	newFileFolderPath: 'Unsorted Notes',
	attachmentFolderPath: './attachments'
};

export interface ObsidianAppConfig {
	newFileLocation?: 'current' | 'folder' | 'root';
	newFileFolderPath?: string;
	attachmentFolderPath?: string;
	[key: string]: any;
}
