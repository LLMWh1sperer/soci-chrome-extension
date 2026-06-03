const SOCI_PATTERN = /^https?:\/\/([^.]+)\.meetsoci\.com\/admin\/account\/(\d+)(?:\/office\/\d+\/project\/(\d+))?/;

const tenantInput = document.getElementById('tenant');
const accountInput = document.getElementById('account');
const projectInput = document.getElementById('project');
const goBtn = document.getElementById('go');
const preview = document.getElementById('preview');
const notSoci = document.getElementById('not-soci');
const DEFAULT_TENANT = 'moz';

function buildUrl(tenant, accountId, projectId) {
  const t = tenant.trim() || DEFAULT_TENANT;
  const a = accountId.trim();
  const p = projectId.trim();
  if (!a) return null;
  const base = `https://${t}.meetsoci.com/admin/account/${a}`;
  return p ? `${base}/office/0/project/${p}` : base;
}

function updatePreview() {
  const url = buildUrl(tenantInput.value, accountInput.value, projectInput.value);
  preview.textContent = url || '';
}

// Populate from current tab if it's a SOCi URL
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (!tab?.url) return;
  const match = tab.url.match(SOCI_PATTERN);
  if (match) {
    tenantInput.value = match[1];
    accountInput.value = match[2];
    if (match[3]) projectInput.value = match[3];
  } else {
    notSoci.classList.remove('hidden');
    tenantInput.value = DEFAULT_TENANT;
  }
  updatePreview();
  updateAccountButtons();
});

tenantInput.addEventListener('input', updatePreview);
accountInput.addEventListener('input', updatePreview);
projectInput.addEventListener('input', updatePreview);

goBtn.addEventListener('click', () => {
  const url = buildUrl(tenantInput.value, accountInput.value, projectInput.value);
  if (!url) return;
  chrome.tabs.create({ url });
});

// Allow Enter key to trigger Go
[tenantInput, accountInput, projectInput].forEach(el => {
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
  const t = tenantInput.value.trim() || DEFAULT_TENANT;
  chrome.tabs.create({ url: `https://${t}.meetsoci.com/internal/listings/` });
});

kickListingsBtn.addEventListener('click', () => {
  const t = tenantInput.value.trim() || DEFAULT_TENANT;
  chrome.tabs.create({ url: `https://${t}.meetsoci.com/internal/listings/search_projects_by_network.php` });
});

superBoBtn.addEventListener('click', () => {
  const t = tenantInput.value.trim() || DEFAULT_TENANT;
  chrome.tabs.create({ url: `https://${t}.meetsoci.com/admin/super/0/backoffice` });
});

listingStatusBtn.addEventListener('click', () => {
  const t = tenantInput.value.trim() || DEFAULT_TENANT;
  const a = accountInput.value.trim();
  if (!a) return;
  chrome.tabs.create({ url: `https://${t}.meetsoci.com/internal/listings/listings_status.php?account_id=${a}` });
});

gmbTokenHealthBtn.addEventListener('click', () => {
  const t = tenantInput.value.trim() || DEFAULT_TENANT;
  const a = accountInput.value.trim();
  if (!a) return;
  chrome.tabs.create({ url: `https://${t}.meetsoci.com/internal/listings/account_gmb_groups.php?account_id=${a}` });
});

document.getElementById('super-duper-bo').addEventListener('click', () => {
  const t = tenantInput.value.trim() || DEFAULT_TENANT;
  chrome.tabs.create({ url: `https://${t}.meetsoci.com/internal/platform/index.php` });
});

accountInput.addEventListener('input', updateAccountButtons);

const ticketInput = document.getElementById('ticket');

ticketInput.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const raw = ticketInput.value.trim();
  if (!raw) return;
  if (/^SO-\d+$/i.test(raw)) {
    chrome.tabs.create({ url: `https://meetsoci.atlassian.net/browse/${raw.toUpperCase()}` });
  } else {
    chrome.tabs.create({ url: `https://meetsoci.zendesk.com/agent/tickets/${raw}` });
  }
});
