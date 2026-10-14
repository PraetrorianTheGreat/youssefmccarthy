# Workspace Rules

- Never push code to GitHub automatically. Always ask for explicit user approval before running `git push`.

## Tracking releases (dataLayer events and the Tag Manager container)

- A change that adds or renames a dataLayer event (a `dataLayer.push` with a new `event` name, or a new `trackEvent('...')` / `gtag('event', '...')` name) is merged only together with the GTM-M686VJGG container version that tags it: publish the container version first or in the same release, never "later".
- Before merging, run `python3 .agents/check-gtm-coverage.py --file <container export or gtm.js>` against the container version you are about to publish; it must exit 0.
- After the release (site deployed and container published), run `python3 .agents/check-gtm-coverage.py` against the live container. It must exit 0. If it exits 1, the change is not done: publish the missing tags or revert the event.
- Run the same live check after every container publish, including publishes made only in Tag Manager.
