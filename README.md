# PDF Tool Keys

**Keyboard shortcuts for the built-in PDF editing tools in Firefox.**

`0.7 beta` · `Windows target` · `MPL-2.0` · `Manual installation`

[한국어](README.kr.md) · English

PDF Tool Keys is an unofficial AutoConfig script for the Firefox desktop browser. It activates native PDF tools when keyboard focus is inside a top-level PDF tab. Ordinary webpages and browser controls keep their existing shortcuts.

This project is not officially associated with Mozilla or its products. It is not a WebExtension and is not installed through the add-on store.

## Shortcuts

| Shortcut | Native PDF tool |
|---|---|
| Ctrl + G | Text |
| Ctrl + D | Draw |
| Ctrl + H | Highlight |
| Ctrl + M | Comment |
| Ctrl + U | Signature |
| Ctrl + I | Image |

**Ctrl + N keeps its normal New Window behavior.**

To insert text, press **Ctrl + G**, click the desired position in the PDF, then type. Selecting the text tool does not request an empty editor at the center of the page. Repeated tool selection follows the native button's toggle behavior.

Keyboard focus is not the mouse pointer position. The six combinations also switch tools from text fields inside the PDF, but not when focus is in the address bar or another browser control. Other Ctrl combinations, plain letters, Shift+letters, and Ctrl+Alt combinations are not handled.

Unavailable tools and open modal dialogs prevent activation. The consumed PDF shortcut does not fall back to a browser command in those cases.

## Before installing

> [!WARNING]
> This script sets `general.config.sandbox_enabled=false` and runs with privileged browser access. This setting does not disable the web-content process sandbox or extension-signature checks, but it grants more authority than a normal extension. Install only code from a source you trust. See [SECURITY.md](SECURITY.md) for the detailed review in Korean.

The installation-wide AutoConfig setting can affect every profile using that Firefox installation. Tool modules are loaded only for profiles where they have been explicitly installed. Moving the profile modules out does not remove the installation-wide setting.

The Firefox scripts contain no automatic installer, remote code download, telemetry, or automatic update channel. Their diagnostics record the last matching shortcut and status locally, not a complete typing history or PDF contents. Exception messages may reveal local module paths. Separately, the repository's CI workflow downloads official GitHub actions and Node.js in its hosted test environment.

## Install on Windows

1. Download the repository using **Code → Download ZIP** and extract it.
2. Open `about:support` in Firefox and locate the current **Profile Folder**. Locate the actual Firefox installation directory, usually `C:\Program Files\Mozilla Firefox`.
3. Check `general.config.filename` in `about:config` and the installation's `defaults\pref` directory. If another AutoConfig setup exists, have its administrator integrate this script; do not overwrite it or add a competing entry point.
4. Save your PDF edits, back up any files you will replace, and fully close Firefox.
5. Copy the following files. Replace the descriptive directory names with your actual locations.

| Repository path | Destination |
|---|---|
| `program/pdf-shortcuts.cfg` | `<Firefox installation>\pdf-shortcuts.cfg` |
| `program/defaults/pref/pdf-shortcuts-prefs.js` | `<Firefox installation>\defaults\pref\pdf-shortcuts-prefs.js` |
| All four files in `profile/chrome/pdf-shortcuts/` | `<current profile>\chrome\pdf-shortcuts\` |

The profile directory must contain `chrome.manifest` and the three `PdfToolKeys*.sys.mjs` files directly. Do not add an extra nested folder. Administrator access may be needed for the installation directory. Preserve UTF-8 without BOM and LF line endings.

6. Restart Firefox. In `about:config`, check `user.pdfShortcuts.version = 0.7` and `user.pdfShortcuts.status = registered`. Focus the body of a PDF in a standalone tab and try the shortcuts. Registration alone does not prove that all tools work.

Node.js and Git are not required to use the tool. Only the six installation files listed above are loaded by Firefox.

## Update, disable, or remove

For an earlier version, fully close Firefox and replace the cfg and all four profile files together. The entry file's settings are unchanged if you have not customized them. A working 0.7 installation does not need reinstalling for these repository and documentation changes.

To disable one profile, close Firefox and move its `chrome\pdf-shortcuts` directory outside the profile. This leaves the shared AutoConfig entry and its sandbox setting in place.

For a standalone installation of this tool, close Firefox and **first move `defaults\pref\pdf-shortcuts-prefs.js` outside the installation directory**. Then remove this tool's cfg and profile module directories. Do not leave an entry pointing to a missing cfg.

If this tool was integrated into an existing AutoConfig setup, restore the backup or remove only this tool's integration. Do not delete shared configuration files. If Firefox fails to start after a file change, remove this tool's standalone entry or restore the previous configuration while Firefox is closed. Do not delete the whole profile or `prefs.js`.

## Status and limitations

Development targets Windows and references Firefox 157.0 source. One user reported normal operation on 2026-10-08; the exact OS build and Firefox version at that successful run were not independently recollected. Other Firefox versions, macOS, Linux, mobile browsers, and embedded iframe PDFs have not been validated.

The 32 Node.js mock tests pass locally. They check routing and startup models, not a running Firefox instance. A real-browser automation attempt could not start Firefox in the test environment. The included GitHub Actions workflow is configured to run the mock tests on Windows and Ubuntu; its first hosted run is pending repository upload.

See the detailed [validation record](docs/VALIDATION.md) and [troubleshooting guide](docs/TROUBLESHOOTING.md), both in Korean. Browser updates can change the internal APIs and PDF toolbar structure.

## Development and license

With Node.js 24.x, run the existing tests without installing npm packages:

```sh
node --test tests/shortcuts.test.mjs tests/startup.test.mjs
```

Use the repository's Issues templates for bug reports and feature requests. Include versions and reproduction steps, without private PDFs or personal diagnostic data. Contribution guidance is in [CONTRIBUTING.md](CONTRIBUTING.md).

Project files are available under [MPL-2.0](LICENSE). Source references and third-party license distinctions are documented in [NOTICE.md](NOTICE.md).

Firefox is a trademark of the Mozilla Foundation in the U.S. and other countries. PDF Tool Keys is not officially associated with Mozilla or its products.
