---
title: Security Side Arcade
description: Games about systems security, networking, privacy, AI assurance, and optimization.
permalink: /arcade/security/
---
<section class="arcade-page-intro">
  <p class="arcade-kicker">Adjacent security ideas</p>
  <h1>Security Side Arcade</h1>
  <p>Network defense, program analysis, attestation, policy, optimization, privacy, and experimental assurance problems whose central mechanic is broader than cryptography alone.</p>
</section>

<div class="arcade-grid" data-arcade-catalog data-category="security-and-experimental">
  {% for arcade_game in site.data.arcade_games %}
    {% if arcade_game.category contains 'security' or arcade_game.category == 'experimental' %}
      {% include arcade/game-card.html game=arcade_game %}
    {% endif %}
  {% endfor %}
</div>
