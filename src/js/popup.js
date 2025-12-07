const rulesContainer = document.getElementById('rulesContainer');
const addRuleBtn = document.getElementById('addRuleBtn');
const statusMessage = document.getElementById('statusMessage');
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
	
	ruleElements.forEach(ruleEl => {
		const baseUri = ruleEl.querySelector('.base-uri-input').value.trim();
		const suffixInputs = ruleEl.querySelectorAll('.suffix-input');
		
		if (baseUri) {
			const suffixes = [];
			suffixInputs.forEach(input => {
				const suffix = input.value.trim();
				if (suffix) {
				    suffixes.push(suffix);
				}
			});
			
			if (suffixes.length > 0) {
				newRules.push({ base_uri: baseUri, suffixes: suffixes });
			}
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
	
	const suffixesContainer = div.querySelector('.suffixes-container');
	rule.suffixes.forEach(suffix => {
		suffixesContainer.appendChild(createSuffixInput(suffix));
	});

	div.querySelector('.add-suffix-btn').addEventListener('click', () => {
    		suffixesContainer.appendChild(createSuffixInput(''));
    		saveRules(); 
    		renderRules(); 
	});

	div.querySelector('.remove-rule-btn').addEventListener('click', () => {
    		rules.splice(index, 1);
    		saveRules(); 
    		renderRules();
	});
	return div;
}

// Creates the HTML element for a single suffix input field
function createSuffixInput(value) {
  const suffixTemplate = document.getElementById('suffix-input-template');
	const itemDiv = suffixTemplate.content.firstElementChild.cloneNode(true);
	
	itemDiv.querySelector('.suffix-input').value = value;

	itemDiv.querySelector('.remove-suffix-btn').addEventListener('click', () => {
	itemDiv.remove();
	saveRules();
	renderRules();
	});
	return itemDiv;
}

addRuleBtn.addEventListener('click', () => {
	// Add a temporary new rule structure for the renderer
	rules.push({ base_uri: '', suffixes: [''] });
	renderRules();
});

// Load the initial rules when the popup opens
loadRules();
