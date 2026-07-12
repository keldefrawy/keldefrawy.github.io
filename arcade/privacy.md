---
title: Cryptography Arcade Privacy
description: Local data, telemetry, and privacy policy for Cryptography Arcade.
permalink: /arcade/privacy/
---
<section class="arcade-page-intro">
  <p class="arcade-kicker">Local-first by default</p>
  <h1>Privacy and saved data</h1>
  <p>The initial Arcade is a static client-side section. It has no accounts, public leaderboard, or gameplay submission service.</p>
</section>

## Current behavior

The catalog stores nothing and requires no JavaScript. The existing homepage prototype does not send gameplay requests or use browser storage; that behavior remains covered by the Gate 0 regression suite.

The Phase 2 dedicated Outrefresh page can keep one versioned local autosave under `cryptoArcade:v1:save:outrefresh-mobile-adversary:autosave`. The save contains the seed, deterministic action history, and toy-model state. It remains on the device, is validated before use, pauses rather than resumes real-time playback after restoration, and can be replaced or removed through browser site-data controls. Gameplay does not transmit the save or make score-submission requests.

## Planned local saves

Later phases may store settings, tutorial progress, local scores, and explicitly saved runs in versioned browser storage. Stored data will be validated as untrusted input, remain on the device, and have clear per-game and global deletion controls.

Seeds, action histories, save payloads, accessibility preferences, free text, and research-interest profiles will not be transmitted by default. Any future analytics proposal requires a separate documented decision and privacy review.

## Site-wide note

The broader website contains a conditional analytics integration in its shared layout. That must be audited independently before any claim is made about production network requests on Arcade routes.
