const SOCI_PATTERN = /^https?:\/\/([^.]+)\.meetsoci\.com\/admin\/account\/(\d+)(?:\/office\/\d+\/project\/(\d+))?/;
const SOCI_HOST_PATTERN = /^https?:\/\/([^.]+)\.meetsoci\.com\//;

const tenantInput = document.getElementById('tenant');
const accountInput = document.getElementById('account');
const projectInput = document.getElementById('project');
const networkInput = document.getElementById('network');

// Known SOCi listing network slugs, ordered by support frequency.
// Free text is still allowed — this list only drives the autocomplete suggestions.
// Add slugs here as new networks appear.
const NETWORKS = [
  'gmb',
  'facebook',
  'bing',
  'yelp',
  'apple_maps',
  'foursquare',
  'yellowpages',
  'localeze',
  'factual',
  'here',
  'navmii',
  'tomtom',
  'waze',
  'iglobal',
  'opendi',
  'n49',
];

const networkOptions = document.getElementById('network-options');
networkOptions.append(...NETWORKS.map(slug => {
  const opt = document.createElement('option');
  opt.value = slug;
  return opt;
}));
const goBtn = document.getElementById('go');
const preview = document.getElementById('preview');
const notSoci = document.getElementById('not-soci');
const DEFAULT_TENANT = 'moz';

function buildAdminUrlFromTenantInput(input) {
  try {
    const url = new URL(input.trim());
    const localAppMatch = url.hostname.match(/^local-app\.([^.]+)\.com$/);
    const pathMatch = url.pathname.match(/^\/admin\/account\/\d+(?:\/office\/\d+\/project\/\d+)?(\/|$)/);
    const tenant = localAppMatch?.[1];

    if (!tenant || !pathMatch) return null;

    const path = url.pathname.replace(/\/$/, '');
    return `https://${tenant}.meetsoci.com${path}`;
  } catch {
    return null;
  }
}

function getTenant() {
  return tenantInput.value.trim() || DEFAULT_TENANT;
}

function getAccountId() {
  return accountInput.value.trim();
}

function getNetwork() {
  return (networkInput.value.trim() || 'gmb').toLowerCase();
}

function getAuditNetwork() {
  const network = getNetwork();
  return network === 'gmb' ? 'google_maps' : network;
}

function openUrl(url) {
  chrome.tabs.create({ url });
}

function buildUrl(tenant, accountId, projectId) {
  const adminUrl = buildAdminUrlFromTenantInput(tenant);
  if (adminUrl) return adminUrl;

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
    const hostMatch = tab.url.match(SOCI_HOST_PATTERN);
    if (hostMatch) {
      tenantInput.value = hostMatch[1];
    } else {
      notSoci.classList.remove('hidden');
      tenantInput.value = DEFAULT_TENANT;
    }
  }
  updatePreview();
  updateAccountButtons();
  refreshCreds();
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
const kickListingsLegacyBtn = document.getElementById('kick-listings-legacy');
const superBoBtn = document.getElementById('super-bo');
const listingStatusBtn = document.getElementById('listing-status');
const listingImagesStatusBtn = document.getElementById('listing-images-status');
const gmbTokenHealthBtn = document.getElementById('gmb-token-health');
const publishProjectsBtn = document.getElementById('publish-projects');
const porNetworkStatusBtn = document.getElementById('por-network-status');
const localezeConflictsBtn = document.getElementById('localeze-conflicts');
const auditPublishBtn = document.getElementById('audit-publish');

function updateAccountButtons() {
  const hasAccount = !!getAccountId();
  kickListingsLegacyBtn.disabled = !hasAccount;
  listingStatusBtn.disabled = !hasAccount;
  listingImagesStatusBtn.disabled = !hasAccount;
  gmbTokenHealthBtn.disabled = !hasAccount;
  porNetworkStatusBtn.disabled = !hasAccount;
  localezeConflictsBtn.disabled = !hasAccount;
  auditPublishBtn.disabled = !hasAccount;
}

listingsToolsBtn.addEventListener('click', () => {
  openUrl(`https://${getTenant()}.meetsoci.com/internal/listings/`);
});

kickListingsBtn.addEventListener('click', () => {
  openUrl(`https://${getTenant()}.meetsoci.com/internal/listings/search_projects_by_network.php`);
});

kickListingsLegacyBtn.addEventListener('click', () => {
  const a = getAccountId();
  if (!a) return;
  openUrl(`https://${getTenant()}.meetsoci.com/internal/listings/kick_listings_publishing.php?account_id=${a}`);
});

superBoBtn.addEventListener('click', () => {
  openUrl(`https://${getTenant()}.meetsoci.com/admin/super/0/backoffice`);
});

listingStatusBtn.addEventListener('click', () => {
  const a = getAccountId();
  if (!a) return;
  openUrl(`https://${getTenant()}.meetsoci.com/internal/listings/listings_status.php?account_id=${a}&network=${getNetwork()}`);
});

listingImagesStatusBtn.addEventListener('click', () => {
  const a = getAccountId();
  if (!a) return;
  openUrl(`https://${getTenant()}.meetsoci.com/internal/listings/listings_images_status.php?account_id=${a}`);
});

gmbTokenHealthBtn.addEventListener('click', () => {
  const a = getAccountId();
  if (!a) return;
  openUrl(`https://${getTenant()}.meetsoci.com/internal/listings/account_gmb_groups.php?account_id=${a}`);
});

document.getElementById('super-duper-bo').addEventListener('click', () => {
  openUrl(`https://${getTenant()}.meetsoci.com/internal/platform/index.php`);
});

publishProjectsBtn.addEventListener('click', () => {
  openUrl(`https://${getTenant()}.meetsoci.com/internal/listings/publish_projects_by_network.php`);
});

porNetworkStatusBtn.addEventListener('click', () => {
  const a = getAccountId();
  if (!a) return;
  openUrl(`https://${getTenant()}.meetsoci.com/internal/listings/por_location_network_statuses.php?account_id=${a}&network=${getNetwork()}`);
});

localezeConflictsBtn.addEventListener('click', () => {
  const a = getAccountId();
  if (!a) return;
  openUrl(`https://${getTenant()}.meetsoci.com/internal/listings/localeze_ownership_conflicts.php?search_type=account&search_value=${a}`);
});

auditPublishBtn.addEventListener('click', () => {
  const t = getTenant();
  const a = getAccountId();
  const network = getAuditNetwork();
  if (!a) return;

  const confirmed = confirm(`Run account-level audit publish?\n\nTenant: ${t}\nAccount: ${a}\nNetwork: ${network}`);
  if (!confirmed) return;

  openUrl(`https://${t}.meetsoci.com/internal/listings/audit_network_dashboard.php?network=${network}&account_id=${a}&publish=1`);
});

accountInput.addEventListener('input', updateAccountButtons);

// Credentials captured by the background worker from SOCi network requests
const copyPhpsessidBtn = document.getElementById('copy-phpsessid');
const copyRequestTokenBtn = document.getElementById('copy-request-token');
const credsStatus = document.getElementById('creds-status');

function credsHost() {
  return `${getTenant()}.meetsoci.com`;
}

function refreshCreds() {
  const host = credsHost();
  chrome.storage.session.get(host, (data) => {
    const creds = data[host] || {};
    copyPhpsessidBtn.disabled = !creds.phpsessid;
    copyRequestTokenBtn.disabled = !creds.request_token;
    if (creds.phpsessid || creds.request_token) {
      credsStatus.textContent = `captured for ${host}`;
    } else {
      credsStatus.textContent = `none yet for ${host}`;
    }
  });
}

function copyCred(field, btn) {
  const host = credsHost();
  chrome.storage.session.get(host, (data) => {
    const value = (data[host] || {})[field];
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      const original = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(() => { btn.textContent = original; }, 1200);
    });
  });
}

copyPhpsessidBtn.addEventListener('click', () => copyCred('phpsessid', copyPhpsessidBtn));
copyRequestTokenBtn.addEventListener('click', () => copyCred('request_token', copyRequestTokenBtn));
tenantInput.addEventListener('input', refreshCreds);
refreshCreds();

const ticketInput = document.getElementById('ticket');

// Auto-focus the ticket box when the popup opens
ticketInput.focus();

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
