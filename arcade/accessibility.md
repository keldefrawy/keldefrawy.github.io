---
title: Cryptography Arcade Accessibility
description: Accessibility contract and input adaptations for Cryptography Arcade.
permalink: /arcade/accessibility/
---
<section class="arcade-page-intro">
  <p class="arcade-kicker">A rules requirement</p>
  <h1>Accessibility</h1>
  <p>Accessibility is part of every cabinet's game contract, not a visual polish pass.</p>
</section>

## Platform commitments

- Keyboard, pointer, and touch paths for every playable action.
- Synchronized text summaries for canvas and SVG state.
- Labels, shapes, patterns, or icons in addition to color.
- Pause and adjustable or step-based timing when reaction speed matters.
- Reduced-motion behavior that stops nonessential motion without removing information.
- Logical source and focus order across every supported layout.
- Responsive operation at narrow widths and enlarged text.

## Current status

The existing Outrefresh prototype is characterized by automated desktop/mobile browser, focus, ARIA, reduced-motion, canvas-summary, and axe checks. Dedicated game pages and shared settings arrive in later implementation phases. See the [master execution ledger]({{ '/docs/cryptography-arcade-master-plan.html#101-mandatory-phase-and-regression-gate-ledger' | relative_url }}) for current evidence.

If you encounter an accessibility barrier, use the contact details on the main site and include the cabinet, browser, input method, and action you were attempting.
