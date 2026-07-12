---
title: Cryptography Arcade Sources
description: Game-to-paper index for the Cryptography Arcade.
permalink: /arcade/sources/
---
<section class="arcade-page-intro">
  <p class="arcade-kicker">Game-to-paper index</p>
  <h1>Sources and research trail</h1>
  <p>Paper-derived cabinets resolve their source IDs against the website's canonical publication and knowledge-map records. Generic Classics are listed separately and will receive authoritative teaching references during their individual research phase.</p>
</section>

<div class="arcade-source-index" role="region" aria-label="Paper-derived cabinet sources" tabindex="0">
  <table>
    <thead><tr><th scope="col">Cabinet</th><th scope="col">Category</th><th scope="col">Paper trail</th><th scope="col">Review</th></tr></thead>
    <tbody>
      {% for arcade_game in site.data.arcade_games %}
        {% if arcade_game.provenance.kind == 'paper-derived' %}
          <tr>
            <th scope="row"><a href="{{ '/arcade/games/' | append: arcade_game.slug | append: '/' | relative_url }}">{{ arcade_game.title | escape }}</a></th>
            <td>{{ arcade_game.category | replace: '-', ' ' }}</td>
            <td>{% for reference in arcade_game.provenance.paper_refs %}{% assign paper_id = reference.paper_id | default: reference %}<a href="{{ '/knowledge/papers/paper-' | append: paper_id | append: '/' | relative_url }}">#{{ paper_id }}</a>{% unless forloop.last %}, {% endunless %}{% endfor %}</td>
            <td>{{ arcade_game.provenance.review_status | default: 'not recorded' | replace: '_', ' ' | replace: '-', ' ' }}</td>
          </tr>
        {% endif %}
      {% endfor %}
    </tbody>
  </table>
</div>

<p>Machine-readable consumers can use the generated <a href="{{ '/arcade/manifest.json' | relative_url }}">Arcade manifest</a>.</p>
