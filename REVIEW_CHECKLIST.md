# Kershaw Law website review

Prepared October 5, 2026. This is a design and factual-content review, not a State Bar approval or legal compliance certification.

## Completed

- [x] Retain the existing Austin skyline photograph and use it prominently in the homepage and informational page introductions.
- [x] Replace decorative icon tiles, translucent panels, and repeated boxes with typography, open sections, and divider lines.
- [x] Apply one responsive visual system across all existing desktop and mobile routes. Preserve existing filenames and the homepage device redirect.
- [x] Add locally hosted, licensed fonts, a restrained wordmark, visible keyboard focus, a skip link, reduced-motion styling, and native FAQ disclosures.
- [x] Replace unsupported experience, expertise, fee, staffing, affiliation, rating, and performance claims with process-based descriptions.
- [x] Add primary government resources for the H-2A and H-2B programs. Avoid fixed cap numbers, fees, or processing-time claims.
- [x] Remove invented privacy/security promises and template text. Use fixed revision dates in the website privacy notice and terms.
- [x] Add initial-inquiry notices without disclaiming duties that may apply to prospective clients.
- [x] Fix the desktop footer links that pointed to nonexistent privacy, terms, and sitemap routes.
- [x] Verify unchanged contact/intake form DOM, all four submission scripts, Cloudflare scripts/widgets/email protection, and edge assets against original commit `0fdd0608772a61544109b5975d75f1728b107b52`.

## Verified presentation

- [x] All 16 HTML routes checked at 1440, 768, 390, and 320 pixels (64 combinations), plus 24 targeted final checks. No document overflow, runtime errors, local HTTP failures, or used-font errors.
- [x] FAQ pointer/keyboard toggles, visible keyboard focus, phone formatting, contact character count, no-JavaScript content, and reduced motion checked. No form submissions performed.
- [x] All 15 local JavaScript files pass syntax checks. Integration preservation passes 24 checks; 320 local references resolve.
- [x] All six local WOFF2 assets validate and match their licensed source packages.

[Desktop preview](docs/desktop-preview.jpg) · [Mobile preview](docs/mobile-preview.jpg) · [Verification summary](docs/verification-summary.json)

## Attorney and firm confirmation before publication

- [ ] Confirm the lawyer responsible for website advertising and approve the displayed primary practice location. The footer identifies Robert Davidson Kershaw Jr., Austin, based on the official Bar profile matching the firm and phone number. His responsibility for this advertisement needs firm confirmation.
- [ ] Resolve the office-address discrepancy. Existing site: **3355 Bee Caves Rd, Suite 307, Austin, TX 78746**. Bar profile: **2028 E Ben White Blvd, Suite 405, Austin, TX 78741-6966**. The redesign preserves the site's existing contact/address and map details; it does not assume which address is current.
- [ ] Confirm that every described service is offered and that the engagement-language description matches the firm's actual process.
- [ ] Approve the rewritten privacy notice and website terms against actual server-side data handling, vendors, retention, disclosures, and applicable law. Frontend code alone cannot establish those practices.
- [ ] Determine the filing/exemption requirements for the revised homepage and any advertising review submission. Do not treat the design review as approval to publish legally reviewed advertising.
- [ ] Confirm the existing Google review and map links point to the correct current firm listing.
- [ ] Confirm rights to use the existing Austin photograph. Its provenance/license is not included in this repository.

## Protected integration discrepancy

The repository's `getstarted_desktop.js` waits briefly, then displays success without making a submission request. `getstarted_mobile.js` posts to `send_consultation_request.php`. Contact scripts post to `send_contact_email.php`. Backend PHP files are not present in this repository.

The user reports working live forms and expressly requested preserving submissions and Cloudflare. These scripts, field names, option values, endpoint settings, widgets, tokens, and email-protection markup were therefore preserved. **Compare the repository with the working production files before deploying**, so a visual release does not replace a working desktop submission script with this repository copy. Do not infer live delivery from local success messaging.

## Governing-source review

Texas Rules 7.01 and 7.02 govern truthful service/qualification claims and lawyer identification. Rule 1.18 addresses duties to prospective clients. Rules 7.04 and 7.05 address advertising filing and exemptions. The lawyer should assess whether this substantive redesign needs a new filing; website filing guidance generally focuses on the homepage, while substantive rules apply throughout the website.

- [Current Texas Disciplinary Rules of Professional Conduct](https://www.texasbar.com/tdrpc)
- [State Bar Advertising Review guidance](https://www.texasbar.com/AM/Template.cfm?Section=Advertising_Review)
- [Official attorney profile](https://www.texasbar.com/AM/Template.cfm?ContactID=218206&Section=Find_A_Lawyer&template=/Customsource/MemberDirectory/MemberDirectoryDetail.cfm)
- [DOL H-2A program](https://www.dol.gov/agencies/eta/foreign-labor/programs/h-2a)
- [DOL H-2B program](https://www.dol.gov/agencies/eta/foreign-labor/programs/h-2b)
- [DOL H-2B employment requirements](https://www.dol.gov/agencies/whd/immigration/h2b)
- [Department of State temporary worker visa guidance](https://travel.state.gov/content/travel/en/us-visas/employment/temporary-worker-visas.html)

## Verification limits

Local previews exercise presentation, navigation, keyboard behavior, FAQ interaction, and non-submitting form helpers. External requests and submissions are blocked during those checks. They do not verify production delivery, Cloudflare challenges, email decoding on the live edge, server-side processing, or legal approval. The redesign remains on a separate review branch until the production-file discrepancy and firm confirmations above are resolved.
