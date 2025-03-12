// Background script for Lo-Fi Timer extension

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getTrackDuration") {
    // If we need to get track duration in the future
    // This could be used to set a maximum timer value
    sendResponse({ success: true });
  }
});

// When the extension is installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // First time installation
    console.log("Lo-Fi Timer extension installed.");

    // Initialize default settings if needed
    chrome.storage.local.set({
      lastTrack: "track1",
      defaultDuration: 30 * 60, // 30 minutes in seconds
    });
  } else if (details.reason === "update") {
    // Extension update
    console.log("Lo-Fi Timer extension updated.");
  }
});
