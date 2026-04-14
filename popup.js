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
