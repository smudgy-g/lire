// Where the Lire app runs. Change to your Vercel URL (and keep it in manifest host_permissions).
const API_BASE = 'https://lire.adamgriff.dev';

// Toolbar click toggles click-to-translate on the current tab.
chrome.action.onClicked.addListener(async (tab) => {
	const [{ result: isOn }] = await chrome.scripting.executeScript({
		target: { tabId: tab.id },
		files: ['content.js']
	});

	chrome.action.setBadgeText({ tabId: tab.id, text: isOn ? 'ON' : '' });
});

// The page's CORS rules don't apply here, so the content script asks us to fetch.
chrome.runtime.onMessage.addListener(({ word, lang }, _sender, sendResponse) => {
	const query = new URLSearchParams({ lang, word, form: word });

	fetch(`${API_BASE}/api/define?${query}`)
		.then((response) => response.json())
		.then(({ gloss }) => sendResponse({ gloss }))
		.catch(() => sendResponse({ error: true }));

	return true;
});
