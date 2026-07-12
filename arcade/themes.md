---
title: Cryptography Arcade Theme Specimens
description: Original visual themes, semantic token specimens, accessibility overrides, and licensing records for Cryptography Arcade.
permalink: /arcade/themes/
---
<section class="arcade-page-intro">
  <p class="arcade-kicker">One rules engine, multiple presentations</p>
  <h1>Theme specimen gallery</h1>
  <p>Paper Lab and Classic Cabinet are the first shipped presentations. The five later bundles below are planned original art directions. Theme, layout, sound, motion, contrast, and text preferences are presentation only: they never enter a seed, action log, score, replay, or cryptographic claim.</p>
</section>

<section aria-labelledby="theme-shipped-title">
  <div class="arcade-section-heading">
    <div><p class="arcade-kicker">T0-T2 reference surfaces</p><h2 id="theme-shipped-title">Shipped theme contracts</h2></div>
    <p>Use the presentation-settings panel above to switch this page without navigation.</p>
  </div>
  <div class="arcade-grid arcade-grid--featured">
    {% assign shipped_themes = site.data.arcade_themes | where: 'status', 'shipped' %}
    {% for theme in shipped_themes %}
      <article class="arcade-card" data-arcade-theme-specimen="{{ theme.id | escape }}">
        <div class="arcade-card__badges"><span class="arcade-badge">{{ theme.status }}</span><span class="arcade-badge">{{ theme.layout_preset | replace: '-', ' ' }}</span></div>
        <h3>{{ theme.name | escape }}</h3>
        <p>{{ theme.direction | escape }}</p>
        <dl class="arcade-fact-list">
          <div><dt>Assets</dt><dd>{{ theme.asset_pack.assets | size }} external assets</dd></div>
          <div><dt>Audio</dt><dd>{{ theme.audio_pack.status | escape }}; {{ theme.audio_pack.cues | size }} cues</dd></div>
          <div><dt>Review</dt><dd>{{ theme.review_status | replace: '-', ' ' }}</dd></div>
          <div><dt>License</dt><dd>{{ theme.license.id | escape }}</dd></div>
        </dl>
      </article>
    {% endfor %}
  </div>
</section>

<section aria-labelledby="theme-semantics-title">
  <div class="arcade-section-heading">
    <div><p class="arcade-kicker">Meaning survives color</p><h2 id="theme-semantics-title">Semantic state specimen</h2></div>
    <p>Every state keeps a text label, border/pattern cue, and semantic DOM state in both themes.</p>
  </div>
  <div class="arcade-theme-semantic-specimen" role="list" aria-label="Semantic theme states">
    <div role="listitem" data-risk="safe"><strong>Safe / verified</strong><span>Invariant currently holds.</span></div>
    <div role="listitem" data-risk="warning"><strong>Warning / unknown</strong><span>Headroom is narrow or evidence is incomplete.</span></div>
    <div role="listitem" data-risk="danger"><strong>Danger / tampered</strong><span>A declared failure or invalid state occurred.</span></div>
    <div role="listitem" data-risk="offline"><strong>Offline / unavailable</strong><span>Availability changed; this does not imply erasure.</span></div>
  </div>
</section>

<section aria-labelledby="theme-controls-title">
  <div class="arcade-section-heading">
    <div><p class="arcade-kicker">Control and content stress test</p><h2 id="theme-controls-title">Long labels, actions, and empty states</h2></div>
  </div>
  <div class="arcade-profile-grid">
    <section>
      <h2>Interactive states</h2>
      <p><a class="arcade-action" href="#theme-future-title">Primary action</a> <a class="arcade-action arcade-action--secondary" href="{{ '/arcade/accessibility/' | relative_url }}">Accessibility contract</a></p>
      <p><label for="theme-specimen-select"><strong>Example setting with a deliberately long accessible label</strong></label><br><select id="theme-specimen-select"><option>Canonical cryptographic terminology remains visible</option></select></p>
    </section>
    <section>
      <h2>Empty and error copy</h2>
      <p class="arcade-notice"><strong>No replay selected.</strong> The page remains useful, keyboard reachable, and readable without decorative assets or audio.</p>
    </section>
  </div>
</section>

<section aria-labelledby="theme-future-title">
  <div class="arcade-section-heading">
    <div><p class="arcade-kicker">Planned presentation waves</p><h2 id="theme-future-title">Five later original bundles</h2></div>
    <p>Planning records are not selectable until their art, licensing, accessibility, and visual gates pass.</p>
  </div>
  <div class="arcade-grid">
    {% assign planned_themes = site.data.arcade_themes | where: 'status', 'planned' %}
    {% for theme in planned_themes %}
      <article class="arcade-card" data-arcade-theme-plan="{{ theme.id | escape }}">
        <div class="arcade-card__badges"><span class="arcade-badge arcade-badge--status">planned</span></div>
        <h3>{{ theme.name | escape }}</h3>
        <p>{{ theme.direction | escape }}</p>
        <p class="arcade-card__source">{{ theme.originality | escape }}</p>
      </article>
    {% endfor %}
  </div>
</section>

<section class="arcade-limitations" aria-labelledby="theme-rights-title">
  <p class="arcade-kicker">Rights and safety boundary</p>
  <h2 id="theme-rights-title">Original assets only</h2>
  <p>The initial themes use system fonts and CSS-rendered surfaces with no third-party visual or audio assets. Later theme manifests must identify every asset, author, license, and attribution before release. Broad genre inspiration never authorizes copying characters, logos, music, proprietary interfaces, distinctive glyph streams, or trade dress.</p>
</section>
