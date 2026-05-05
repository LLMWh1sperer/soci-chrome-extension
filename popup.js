const SOCI_PATTERN = /^https?:\/\/([^.]+)\.meetsoci\.com\/admin\/account\/(\d+)/;

const tenantInput = document.getElementById('tenant');
const accountInput = document.getElementById('account');
const goBtn = document.getElementById('go');
const preview = document.getElementById('preview');
const notSoci = document.getElementById('not-soci');

function buildUrl(tenant, accountId) {
  const t = tenant.trim() || 'app';
  const a = accountId.trim();
  if (!a) return null;
  return `https://${t}.meetsoci.com/admin/account/${a}`;
}

function updatePreview() {
  const url = buildUrl(tenantInput.value, accountInput.value);
  preview.textContent = url || '';
}

// Populate from current tab if it's a SOCi URL
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (!tab?.url) return;
  const match = tab.url.match(SOCI_PATTERN);
  if (match) {
    tenantInput.value = match[1];
    accountInput.value = match[2];
  } else {
    notSoci.classList.remove('hidden');
    tenantInput.value = 'app';
  }
  updatePreview();
  updateAccountButtons();
});

tenantInput.addEventListener('input', updatePreview);
accountInput.addEventListener('input', updatePreview);

goBtn.addEventListener('click', () => {
  const url = buildUrl(tenantInput.value, accountInput.value);
  if (!url) return;
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.update(tab.id, { url });
  });
});

// Allow Enter key to trigger Go
[tenantInput, accountInput].forEach(el => {
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter') goBtn.click();
  });
});

const listingsToolsBtn = document.getElementById('listings-tools');
const kickListingsBtn = document.getElementById('kick-listings');
const superBoBtn = document.getElementById('super-bo');
const listingStatusBtn = document.getElementById('listing-status');
const gmbTokenHealthBtn = document.getElementById('gmb-token-health');

function updateAccountButtons() {
  const hasAccount = !!accountInput.value.trim();
  listingStatusBtn.disabled = !hasAccount;
  gmbTokenHealthBtn.disabled = !hasAccount;
}

listingsToolsBtn.addEventListener('click', () => {
  const t = tenantInput.value.trim() || 'app';
  chrome.tabs.create({ url: `https://${t}.meetsoci.com/internal/listings/` });
});

kickListingsBtn.addEventListener('click', () => {
  const t = tenantInput.value.trim() || 'app';
  chrome.tabs.create({ url: `https://${t}.meetsoci.com/internal/listings/search_projects_by_network.php` });
});

superBoBtn.addEventListener('click', () => {
  const t = tenantInput.value.trim() || 'app';
  chrome.tabs.create({ url: `https://${t}.meetsoci.com/admin/super/0/backoffice` });
});

listingStatusBtn.addEventListener('click', () => {
  const t = tenantInput.value.trim() || 'app';
  const a = accountInput.value.trim();
  if (!a) return;
  chrome.tabs.create({ url: `https://${t}.meetsoci.com/internal/listings/listings_status.php?account_id=${a}` });
});

gmbTokenHealthBtn.addEventListener('click', () => {
  const t = tenantInput.value.trim() || 'app';
  const a = accountInput.value.trim();
  if (!a) return;
  chrome.tabs.create({ url: `https://${t}.meetsoci.com/internal/listings/account_gmb_groups.php?account_id=${a}` });
});

accountInput.addEventListener('input', updateAccountButtons);

const jiraInput = document.getElementById('jira');
const zdInput = document.getElementById('zd');

jiraInput.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const raw = jiraInput.value.trim();
  if (!raw) return;
  const ticket = /^\d+$/.test(raw) ? `SO-${raw}` : raw.toUpperCase();
  chrome.tabs.create({ url: `https://meetsoci.atlassian.net/browse/${ticket}` });
});

zdInput.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const num = zdInput.value.trim();
  if (!num) return;
  chrome.tabs.create({ url: `https://meetsoci.zendesk.com/agent/tickets/${num}` });
});
