# Settings Enforcer for Obsidian
An Obsidian plugin that allows settings to be persisted in a way that allows `app.json` to be ignored in Git.

## Problem This Plugin Solves
`app.json` is a volatile file, that should be ignored when using Git as source control. However, key configuration (such as new note locations) are stored in `app.json`.

This plugin allows settings to be persisted in a way that can be stored in Git.

## Enforced Settings

Currently, the following settings are persisted (the ones that I needed):

- New file location
- New file folder path
- Attachment folder path

Each of these settings are configured in the same way as the Obsidian settings.

## Configuration
- **Enable enforcement**
    - Set: settings will be set at startup
    - Unset: settings will not be set at startup

- **New file location**
    - Select where new files are created (copies the dropdown from editor)
- **New file folder path**
    - The folder path that new files will be created in
- **Attachment folder path**
    - The folder path for attachments relative to the note

## Usage
### Automatic Enforcement
If:
- The plugin is enabled
- Enable enforcement is enabled

The settings will be set on startup

### Manual Enforcement
You can also manually enforce the settings using the command palette:
`"Settings Enforcer: Enforce settings now"`

## Future Plans
It is my intention to make the configuration completely dynamic so that users can change any setting they see fit.