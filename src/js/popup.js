const rulesContainer = document.getElementById('rulesContainer');
const addRuleBtn = document.getElementById('addRuleBtn');
let rules = [];


// Load rules from storage
function loadRules() {
	chrome.storage.local.get('uriRules', (data) => {
		rules = data.uriRules || [];
		renderRules();
	});
}

// Save rules to storage
function saveRules() {
	const newRules = [];
	const ruleElements = rulesContainer.querySelectorAll('.rule-entry');
	
	ruleElements.forEach(ruleElements => {
		const baseUri = ruleElements.querySelector('.base-uri-input').value.trim();
		const suffix = ruleElements.querySelector('.suffix-input').value.trim();
		
		if (baseUri && suffix) {
		  newRules.push({ base_uri: baseUri, suffix: suffix });
		}
	});
	
	rules = newRules;
	chrome.storage.local.set({ uriRules: rules });
}


// Renders the entire list of rules based on the 'rules' array
function renderRules() {
	rulesContainer.innerHTML = ''; // Clear existing content
	rules.forEach((rule, index) => {
		rulesContainer.appendChild(createRuleEntry(rule, index));
	});
	
	if (!rulesContainer.dataset.listenerAttached) {
		rulesContainer.addEventListener('input', saveRules);
		rulesContainer.dataset.listenerAttached = true;
	}
}


// Creates the HTML element for a single Base URI + Suffixes group
function createRuleEntry(rule, index) {
  const ruleTemplate = document.getElementById('rule-entry-template');
	const div = ruleTemplate.content.firstElementChild.cloneNode(true); 
	
	div.setAttribute('data-index', index);
	div.querySelector('.base-uri-input').value = rule.base_uri;

	const addSuffixButton = document.getElementById('add-suffix-btn');
	const removeRuleButton = document.getElementById('remove-rule-btn');
	
  div.querySelector('.suffix-input').value = rule.suffix;

	div.querySelector('.remove-rule-btn').addEventListener('click', () => {
    rules.splice(index, 1);
    renderRules();
    // as rules are saved from the DOM, we have to re-render them before
    saveRules(); 
	});
	return div;
}

addRuleBtn.addEventListener('click', () => {
	// Add a temporary new rule structure for the renderer
	rules.push({ base_uri: '', suffix: '' });
	renderRules();
});

// Load the initial rules when the popup opens
loadRules();
