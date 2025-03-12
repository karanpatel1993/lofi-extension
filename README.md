# Lo-Fi Timer Chrome Extension

A Chrome extension that plays built-in lo-fi tracks with a customizable timer to help with focus, study, and relaxation.

## Features

- Play built-in lo-fi tracks directly from the extension
- Set a customizable timer (hours, minutes, seconds)
- Pause and resume playback
- Visual timer with progress bar
- Continues playing even when the popup is closed

## Installation

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store page for Lo-Fi Timer
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The Lo-Fi Timer extension should now appear in your extensions list

## Usage

1. Click on the Lo-Fi Timer extension icon in your Chrome toolbar
2. Select a lo-fi track from the dropdown menu
3. Set the desired timer duration (hours, minutes, seconds)
4. Click "Play" to start playback with the timer
5. Use "Pause" and "Stop" buttons to control playback

## Adding Your Own Tracks

To add your own lo-fi tracks:

1. Place MP3 files in the `/assets/tracks/` directory
2. Update the track options in `popup.html`
3. Update the track mapping in `popup.js`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The extension includes royalty-free lo-fi tracks
- Icons and UI design inspired by modern music player interfaces
