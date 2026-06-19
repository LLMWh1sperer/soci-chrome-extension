// Passively captures the PHPSESSID cookie and request_token CSRF token from SOCi
// network requests so the popup can offer them for copy. Both arrive on a single
// outgoing request: request_token in the URL query string, PHPSESSID in the Cookie
// header. Latest value of each is stored per tenant hostname in session storage.

const SOCI_URLS = ['*://*.meetsoci.com/*'];

function readPhpsessid(requestHeaders) {
  const cookie = (requestHeaders || []).find(h => h.name.toLowerCase() === 'cookie');
  return cookie?.value.match(/(?:^|;\s*)PHPSESSID=([^;]+)/)?.[1] || null;
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    let host;
    let token;
    try {
      const url = new URL(details.url);
      host = url.hostname;
      token = url.searchParams.get('request_token');
    } catch {
      return;
    }

    const phpsessid = readPhpsessid(details.requestHeaders);
    if (!token && !phpsessid) return;

    // Merge with what's already stored so we keep the last-seen of each field
    // independently (most requests carry the cookie but not the token).
    chrome.storage.session.get(host, (data) => {
      const current = data[host] || {};
      const next = { ...current };
      if (phpsessid) next.phpsessid = phpsessid;
      if (token) next.request_token = token;
      chrome.storage.session.set({ [host]: next });
    });
  },
  { urls: SOCI_URLS },
  ['requestHeaders', 'extraHeaders']
);
