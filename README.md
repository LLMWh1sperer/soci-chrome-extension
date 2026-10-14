# SOCi Support Helper

A small Chrome extension for SOCi support workflows. It opens commonly used internal pages, builds admin URLs, and makes captured session credentials available to copy when needed.

This is an independently maintained support utility, not an official SOCi product. The internal pages require appropriate access.

## Install

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome and turn on **Developer mode**.
3. Click **Load unpacked** and select this repository's folder (the one containing `manifest.json`).
4. Pin **SOCi Support Helper** from Chrome's Extensions menu if you want it on the toolbar.

After pulling updates, click **Reload** for the extension on `chrome://extensions`.

## Use

- Enter a Zendesk ticket number or an `SO-` Jira key in **ZD/Jira Ticket**, then press Enter to open it.
- The **Tenant**, **Account ID**, and optional **Project ID** fields build an admin URL. The popup fills these from the active SOCi admin tab when possible. **Go** opens the previewed URL in a new tab. The Tenant field also accepts a supported `local-app.<tenant>.com` admin URL and converts it to the corresponding SOCi admin URL.
- **Listings Tools** and **Search Projects by Network** open the corresponding internal pages for the selected tenant.
- **Kick Listings Publishing** opens the account-specific internal page. It is enabled once an Account ID is entered.
- **Apple Maps API Get** opens the internal Apple Maps API Get page on `app.meetsoci.com`.
- **Listing Status** opens the account-specific status page using the selected **Network**. The Network field defaults to `gmb`, suggests common network slugs, and accepts free text. Listing Status is enabled once an Account ID is entered.

## Credentials

While the extension is enabled, its background worker observes outgoing requests to SOCi tenant sites and `meetsoci.zendesk.com`. It captures `PHPSESSID` and `request_token` for each tenant, plus the full Zendesk `Cookie` header. The popup enables each copy button only after it has captured a value. If a value is missing, visit the relevant site and make a normal request, then reopen the popup.

Captured values are kept in Chrome extension session storage and copied to your clipboard only when you click a button. Treat them as live session credentials: use this extension only in an authorized support environment, and do not paste the values into issues, logs, or this repository.

## Project files

- `manifest.json` declares the extension permissions and popup.
- `popup.html`, `popup.css`, and `popup.js` provide the interface and shortcuts.
- `background.js` captures credentials from matching requests.
- `icons/` contains the extension icons.

There is no build step or package installation.
