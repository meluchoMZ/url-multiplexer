chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'loading' && tab.url && tab.url.startsWith('http')) {
		processNavigation(tabId, tab.url);
	}
});

function computeRuteSet(rules) {
  const ruleSet = new Map();
  for (const rule of rules) {
    const baseUri = rule.base_uri;
    if (ruleSet.has(baseUri)) {
      const suffixes = ruleSet.get(baseUri);
      suffixes.push(rule.suffix);
      ruleSet.set(baseUri, suffixes);
    } else {
      ruleSet.set(baseUri, [rule.suffix]);
    }
  }
  return ruleSet;
}

function anyMatch(url, suffixes) {
  for (const suffix of suffixes) {
    if (url.endsWith(suffix)) {
      return true;
    }
  }
  return false;
}

// Function to load rules from storage and process the navigation
async function processNavigation(tabId, url) {
	const data = await chrome.storage.local.get('uriRules');
	const rules = data.uriRules;

	let tabsToOpen = [];

  const ruleSet = computeRuteSet(rules);
	
	for (const rule of rules) {
		if (rule.enabled && url.startsWith(rule.base_uri) && 
      !anyMatch(url, ruleSet.get(rule.base_uri))) {
      let fullPath = url.endsWith("/") ? url : url + "/";
      let suffixPath = rule.suffix.startsWith("/") ? 
        rule.suffix.substring(1, rule.suffix.length) : rule.suffix;
      let uriToOpen = fullPath + suffixPath;
      tabsToOpen.push(uriToOpen);
		}
	}

	if (tabsToOpen.length > 0) {
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
	
