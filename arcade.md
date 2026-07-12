---
layout: arcade-hub
arcade_page: true
title: Cryptography Arcade
description: Playable ideas from cryptography, privacy, networks, and secure systems, including games based on Karim Eldefrawy's research.
permalink: /arcade/
---
{% assign featured_games = site.data.arcade_games | where: 'featured', true %}
{% assign classic_games = site.data.arcade_games | where: 'category', 'classic' %}
{% assign research_games = site.data.arcade_games | where: 'category', 'research' %}
{% assign security_game_count = 0 %}
{% for arcade_game in site.data.arcade_games %}{% if arcade_game.category contains 'security' or arcade_game.category == 'experimental' %}{% assign security_game_count = security_game_count | plus: 1 %}{% endif %}{% endfor %}

<section class="arcade-hero" aria-labelledby="arcade-lobby-title">
  <p class="arcade-kicker">Mechanism before metaphor</p>
  <h1 id="arcade-lobby-title">Research you can play</h1>
  <p>Cryptography Arcade turns formal security ideas into short, honest decision games. Every paper-derived cabinet names its sources and simplifications; every generic classic is labeled separately.</p>
  <div class="arcade-hero__actions">
    <a class="arcade-action" href="#featured-cabinets">Explore featured cabinets</a>
    <a class="arcade-action arcade-action--secondary" href="{{ '/arcade/about/' | relative_url }}">How the Arcade is built</a>
  </div>
  <noscript><p class="arcade-notice">The complete catalog and every source trail below work without JavaScript. Playable simulations identify JavaScript requirements individually.</p></noscript>
</section>

<section id="featured-cabinets" aria-labelledby="featured-cabinets-title">
  <div class="arcade-section-heading">
    <div><p class="arcade-kicker">Featured now</p><h2 id="featured-cabinets-title">First cabinets in the build sequence</h2></div>
    <p>Playable, prototype, and planned states are deliberately different.</p>
  </div>
  <div class="arcade-grid arcade-grid--featured">
    {% for arcade_game in featured_games %}{% include arcade/game-card.html game=arcade_game %}{% endfor %}
  </div>
</section>

<section aria-labelledby="arcade-zones-title">
  <div class="arcade-section-heading">
    <div><p class="arcade-kicker">Three catalog zones</p><h2 id="arcade-zones-title">Choose the kind of idea</h2></div>
  </div>
  <div class="arcade-zone-grid">
    <a href="{{ '/arcade/classics/' | relative_url }}"><strong>Cryptography Classics</strong><span>{{ classic_games | size }} foundational cabinets</span><small>Generic games for hashes, commitments, nonces, key exchange, proofs, and more.</small></a>
    <a href="{{ '/arcade/research/' | relative_url }}"><strong>Research Arcade</strong><span>{{ research_games | size }} paper-derived cabinets</span><small>Mechanics connected explicitly to Karim Eldefrawy and collaborators' papers.</small></a>
    <a href="{{ '/arcade/security/' | relative_url }}"><strong>Security Side Arcade</strong><span>{{ security_game_count }} security and experimental cabinets</span><small>Networks, systems assurance, optimization, privacy, and experimental work.</small></a>
  </div>
</section>

<section aria-labelledby="arcade-trails-title">
  <div class="arcade-section-heading">
    <div><p class="arcade-kicker">Learning trails</p><h2 id="arcade-trails-title">Follow a connected question</h2></div>
  </div>
  <ol class="arcade-trails">
    <li><strong>Secrets over time</strong><span>Threshold Forge → Outrefresh → Restoration Station</span></li>
    <li><strong>Proof and verification</strong><span>Proof Cave → Five Rooms, One Witness → Attestation Station</span></li>
    <li><strong>Encrypted computation</strong><span>Lattice Landing → FHE Foundry → Blindfolded Search</span></li>
    <li><strong>Privacy and metadata</strong><span>Timing Ghost → Blindspot → Ghost Board → Ghost Route</span></li>
    <li><strong>Adversarial networks</strong><span>Neighborhood Watch → Filter Fall → Byzantine Switchboard</span></li>
  </ol>
</section>

<section aria-labelledby="arcade-all-title">
  <div class="arcade-section-heading">
    <div><p class="arcade-kicker">Canonical registry</p><h2 id="arcade-all-title">All planned cabinets</h2></div>
    <p>{{ site.data.arcade_games | size }} stable game records. A route does not imply that a game is already released.</p>
  </div>
  {% include arcade/catalog.html %}
</section>
