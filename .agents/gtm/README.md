# Tag Manager: GA4 tags for the eight events that never reach GA4

`ga4-missing-tags.json` is a Tag Manager container export (exportFormatVersion 2)
holding only new items, to be merged into container **GTM-M686VJGG**. It does not
change any served page. Live container version 7 has no GA4 tag for these eight
event names the code pushes, so they never leave the browser:

| Event | Pushed by | GA4 event parameters in the file |
|---|---|---|
| page_meta | tracking.js | page_name, page_type |
| internal_link_click | tracking.js | link_type, link_url, page_name, page_type |
| essay_progress | tracking.js | essay_id, percent, page_type |
| essay_complete | tracking.js | essay_id, seconds_on_page, page_type |
| page_not_found | inline script in 404.html | missing_path, referrer_host, page_type |
| outbound_link_click | tracking.js | link_url, link_domain, link_text, page_name, page_type |
| in_page_nav | script.js (trackEvent) | target, page_type |
| copy_to_clipboard | script.js (trackEvent) | value, page_type |

What the file contains:

- 8 Custom Event triggers, `CE - <event>`, each matching `{{_event}}` equals the exact event name.
- 8 GA4 Event tags, `GA4 - <event>`, measurement ID `G-3F4CN946HC`, fired once per event by their trigger.
- 13 Data Layer Variables (version 2), `DLV - <key>`, one per parameter key, including `DLV - page_type`.

Every parameter is a key the code pushes for that event. page_type comes from
`{{DLV - page_type}}` on every tag: tracking.js pushes it with page_meta as soon
as it runs, and GTM keeps it in the data model for the rest of the page view, so
in_page_nav and copy_to_clipboard (which do not push it themselves) still carry it.

Two caveats:

- **page_not_found** is pushed by 404.html before tracking.js runs, so page_type
  is not yet set when that event is processed and GA4 gets no page_type on it.
  The tag still maps it, so it starts working if the order ever changes.
- **copy_to_clipboard** sends `value`, the copied text. On main (14b7ccb)
  `copyText()` has no caller, so the event does not fire today. Before wiring it to
  a copy button, make sure the copied text can never be an email address, phone
  number or anything else personal (GA4 must not receive personal data); if it can,
  remove the `value` row from `GA4 - copy_to_clipboard`.

## Import steps

1. Tag Manager > container GTM-M686VJGG > **Admin > Import Container**.
2. Choose `ga4-missing-tags.json`.
3. Workspace: a new workspace (for example "GA4 missing tags") or the default one.
4. Import option: **Merge**, then **Rename conflicting tags, triggers and variables**
   (never Overwrite: this file holds only the new items and Overwrite would delete
   everything else).
5. Confirm. If a variable such as `DLV - link_url` already exists with different
   settings it is imported under a new name; the imported tags point to the renamed copy.

## Same version: remove the old items

In the same workspace, before publishing, delete:

- the GA4 event tag **projects_search** (it sends up to 100 typed characters to GA4 as filter_search),
- its **Custom HTML** tag that listens to the projects search box and pushes projects_search,
- the GA4 tag **outbound_click** (script.js no longer sends outbound_click; outbound_link_click replaces it).

Remove any trigger or variable left unused by those deletions (Tag Manager lists them).

## Existing GA4 tags that should gain page_type

The import leaves existing tags untouched. In the same workspace, add the event
parameter `page_type` = `{{DLV - page_type}}` to the GA4 event tags for:
nav_click, project_card_click, feature_toggle, section_view,
recommendation_modal_open, language_change, source_link_click, theme_change,
experience_toggle, project_toggle, projects_filter_update, projects_view_change,
cta_click, mobile_nav_toggle, accordion_section_expanded, ai_widget_toggle,
ai_chat_interaction, dashboard_teaser_tab_click, dashboard_fullscreen_toggled,
dashboard_refresh_clicked, dashboard_outbound_clicked, collaboration_view_change,
collaboration_preset_preview. (These are the 23 other event names the code
pushes; the audit found GA4 tags for them in version 7, but tag names in the
container may differ.) The same list is in the notes of `DLV - page_type` in the file.

## Preview, publish, register

1. **Preview** on the live site and check in Tag Assistant that each `GA4 - <event>`
   fires on its event (an essay for essay_progress and essay_complete, a bad URL for
   page_not_found) and that the projects_search and outbound_click tags are gone.
2. **Submit** one version (for example "GA4 tags for 8 missing events, remove projects_search and outbound_click").
3. In GA4 > Admin > Custom definitions, register event-scoped custom dimensions for
   page_type, link_type, essay_id and percent (and any other parameter you want in reports).

## About the format

The file follows the exportFormatVersion 2 schema as Tag Manager exports it
(`containerVersion` with `tag`, `trigger`, `variable`; GA4 Event tag type `gaawe`
with `eventName`, `measurementIdOverride` and `eventSettingsTable`; Custom Event
triggers with a `customEventFilter` on `{{_event}}`; Data Layer Variables type `v`).
Google's own documentation does not publish this schema. It was written from
knowledge of real exports and checked against one third-party export found online,
not against an import into the live container, so the import step itself is the
real test. Account and container ids in the file are placeholders ("0"); Tag
Manager assigns its own on import.
