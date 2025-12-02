// Set to store the IDs of tabs created by the extension.
const extensionTabs = new Set();

chrome.tabs.onCreated.addListener((tab) => {
	if (tab.id !== chrome.tabs.TAB_ID_NONE) {
		extensionTabs.add(tab.id);
	}
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (extensionTabs.has(tabId) && changeInfo.status === 'complete') {
	    extensionTabs.delete(tabId);
	    return;
	}
	if (changeInfo.status === 'loading' && tab.url && tab.url.startsWith('http')) {
		processNavigation(tabId, tab.url);
	}
});

// Function to load rules from storage and process the navigation
async function processNavigation(tabId, url) {
	console.log(tabId);
	if (extensionTabs.has(tabId)) {
		return;
	}
	console.log('passing');

	const data = await chrome.storage.local.get('uriRules');
	const rules = data.uriRules || [];
	
	let tabsToOpen = [];
	let matchFound = false;
	
	for (const rule of rules) {
		if (url.startsWith(rule.base_uri)) {
			matchFound = true;
			
			let path = url.substring(rule.base_uri.length);
			for (const suffix of rule.suffixes) {
			    const newUrl = rule.base_uri + path + suffix;
			    tabsToOpen.push(newUrl);
			}
		}
	}

	if (matchFound) {
		console.log("must open tabs: ");
		console.log(tabsToOpen.length);
		for (const newUrl of tabsToOpen) {
			// Open in a new background tab
			await chrome.tabs.create({ url: newUrl, active: false });
		}
		// remove tab only if we open another (the rule matches)
		chrome.tabs.remove(tabId, () => {
			if (chrome.runtime.lastError) {
				console.log("Error closing tab: ", chrome.runtime.lastError.message);
			}
		});
	}
	matchFound = false;
}
	
