---
layout: default
title: The R&D Ratchet
description: An interactive, evidence-led series on the incentive structures behind the decline of long-horizon American R&D and the design of an AI-native public–private successor.
permalink: /rd-ratchet/
rd_series: true
image: /assets/images/rd-ratchet/rd-ratchet-hero.webp
---

{% assign rd = site.data.rd_ratchet %}
{% assign latest_composition = rd.rd_chart.composition | last %}
{% assign first_model = rd.models | first %}
{% assign first_argument = rd.argument_nodes | first %}
{% assign first_brain = rd.brain_nodes | first %}

<article class="rd-series" data-rd-series>
  <header class="rd-series-hero">
    <div class="rd-series-hero__copy">
      <p class="rd-kicker">A living research series · {{ rd.series.article_count }} articles</p>
      <h1>{{ rd.series.title }}</h1>
      <p class="rd-series-hero__subtitle">{{ rd.series.subtitle }}</p>
      <p class="rd-series-hero__intro">{{ rd.series.description }}</p>
      <div class="rd-series-hero__status" aria-label="Series status">
        <span><strong>{{ rd.series.published_count }}</strong> published</span>
        <span><strong>1</strong> in research</span>
        <span><strong>11</strong> planned</span>
        <span><strong>4</strong> evidence classes</span>
      </div>
      <nav class="rd-series-nav" aria-label="Explore this series">
        <a href="#argument">Argument map</a>
        <a href="#incentives">Incentive structures</a>
        <a href="#articles">Article arc</a>
        <a href="#successor">AI-native laboratory</a>
        <a href="#sources">Sources</a>
        <a href="{{ '/rd-ratchet/method/' | relative_url }}">Method &amp; revisions</a>
      </nav>
    </div>
    <figure class="rd-series-hero__visual">
      <img
        src="{{ '/assets/images/rd-ratchet/rd-ratchet-hero.webp' | relative_url }}"
        alt="Conceptual illustration of a continuous thread of knowledge passing from an older electronics laboratory through a cleanroom into a future human-and-AI research laboratory."
        width="1788"
        height="880"
        fetchpriority="high"
      >
    </figure>
  </header>

  <section class="rd-thesis" aria-labelledby="rd-thesis-title">
    <div>
      <p class="rd-kicker">The proposition</p>
      <h2 id="rd-thesis-title">The institutions are the evidence. The incentive structures are the subject.</h2>
    </div>
    <blockquote>
      America did not simply defund research. It replaced one institutional equilibrium with several narrower ones — quarterly corporate-like returns, finite short-term government programs, billable projects leading to ballooning administrative and non-productive work, publication metrics, patent accounting, and venture-scale exits. While each decision may look rational and may even be productive in the short term, the end result is a combined system that has consumed inherited deep-research capability faster than it has replenished it.
    </blockquote>
    <p class="rd-thesis__qualification"><strong>This is a thesis to test, not a conclusion to assume.</strong> Each article will separate scientific, technical, transition, institutional, economic, and public-value outcomes—and will state the strongest evidence against its own interpretation.</p>
  </section>

  <section class="rd-paradox" id="paradox" aria-labelledby="rd-paradox-title">
    <div class="rd-section-heading">
      <p class="rd-kicker">The spending paradox</p>
      <h2 id="rd-paradox-title">A near-trillion-dollar flow does not reveal the state of the system</h2>
      <p>National accounts measure activity far better than they measure retained teams, tacit knowledge, apprenticeships, facilities, or the ability to carry an uncertain idea across institutional borders.</p>
    </div>

    <div class="rd-paradox-grid">
      <article class="rd-flow-card">
        <p class="rd-flow-card__label">Estimated U.S. R&amp;D, 2024</p>
        <p class="rd-flow-card__number"><span>$</span>993.4<span>B</span></p>
        <div class="rd-composition" role="img" aria-label="In 2024, basic research was 14.6 percent, applied research was 18.2 percent, and experimental development was 67.3 percent of U.S. research and development expenditure.">
          <span class="rd-composition__basic" style="flex-basis: {{ latest_composition.basic }}%"><b>{{ latest_composition.basic }}%</b><small>Basic</small></span>
          <span class="rd-composition__applied" style="flex-basis: {{ latest_composition.applied }}%"><b>{{ latest_composition.applied }}%</b><small>Applied</small></span>
          <span class="rd-composition__development" style="flex-basis: {{ latest_composition.development }}%"><b>{{ latest_composition.development }}%</b><small>Development</small></span>
        </div>
        <p class="rd-source-note">Current dollars and estimated composition. <a href="#source-ncses-rd-2026">Source and qualifications</a></p>
      </article>

      <article class="rd-state-card">
        <p class="rd-flow-card__label">What the total cannot tell us</p>
        <ol>
          <li><span>01</span><p><strong>Continuity</strong> Did a capable team survive between projects?</p></li>
          <li><span>02</span><p><strong>Memory</strong> Were failed paths and experimental judgment retained?</p></li>
          <li><span>03</span><p><strong>Integration</strong> Could research cross hardware, software, product, and mission boundaries?</p></li>
          <li><span>04</span><p><strong>Transition</strong> Did anyone own the work after the prototype?</p></li>
        </ol>
      </article>
    </div>

    <figure class="rd-trend" data-rd-trend>
      <div class="rd-trend__header">
        <div>
          <h3>{{ rd.rd_chart.title }}</h3>
          <p>{{ rd.rd_chart.unit }}</p>
        </div>
        <div class="rd-trend__controls" role="group" aria-label="Choose chart series">
          {% for chart_series in rd.rd_chart.series %}
          <button type="button" data-rd-chart-toggle="{{ chart_series.id }}" aria-pressed="true" style="--series-color: {{ chart_series.color }}">
            <span aria-hidden="true"></span>{{ chart_series.label }}
          </button>
          {% endfor %}
        </div>
      </div>
      <div class="rd-trend__plot">
        <canvas data-rd-trend-canvas tabindex="0" role="img" aria-label="Line chart of inflation-adjusted U.S. basic research, applied research, and experimental development expenditures from 2000 through 2024. The accessible data table follows the chart."></canvas>
        <p class="rd-trend__readout" data-rd-trend-readout aria-live="polite">Move across the chart or focus it and use the arrow keys to inspect values.</p>
      </div>
      <figcaption>{{ rd.rd_chart.note }} <a href="#source-{{ rd.rd_chart.source_id }}">Inspect the source record.</a></figcaption>
      <details class="rd-data-table">
        <summary>View the chart data as a table</summary>
        <div class="rd-table-scroll" tabindex="0">
          <table>
            <caption>{{ rd.rd_chart.unit }}</caption>
            <thead><tr><th>Year</th>{% for chart_series in rd.rd_chart.series %}<th>{{ chart_series.label }}</th>{% endfor %}</tr></thead>
            <tbody>
              {% for point in rd.rd_chart.series[0].values %}
                {% assign point_index = forloop.index0 %}
                {% assign applied_point = rd.rd_chart.series[1].values[point_index] %}
                {% assign development_point = rd.rd_chart.series[2].values[point_index] %}
                <tr><th>{{ point.year }}</th><td>{{ point.value }}</td><td>{{ applied_point.value }}</td><td>{{ development_point.value }}</td></tr>
              {% endfor %}
            </tbody>
          </table>
        </div>
      </details>
      <script type="application/json" data-rd-trend-data>{{ rd.rd_chart | jsonify }}</script>
    </figure>
  </section>

  <section class="rd-timeline-section" id="journey" aria-labelledby="rd-timeline-title">
    <div class="rd-section-heading">
      <p class="rd-kicker">Twenty-five years inside a thirty-year transformation</p>
      <h2 id="rd-timeline-title">The route through the incentive systems</h2>
      <p>The personal record begins in 2001. The institutional arc begins with the 1996 Bell Labs split and continues through the transactions reshaping PARC and HRL.</p>
    </div>
    <div class="rd-timeline-scroll" tabindex="0" aria-label="Horizontal timeline; scroll to inspect all events">
      <ol class="rd-timeline">
        {% for event in rd.timeline %}
        <li data-kind="{{ event.kind }}">
          <time>{{ event.year }}</time>
          <span class="rd-timeline__marker" aria-hidden="true"></span>
          <article>
            <p class="rd-timeline__evidence"><span class="rd-evidence-token" data-evidence="{% if event.kind == 'memory' %}M{% else %}D{% endif %}">{% if event.kind == 'memory' %}M{% else %}D{% endif %}</span>{% if event.kind == 'memory' %}Firsthand{% else %}Documented{% endif %}</p>
            <h3>{{ event.label }}</h3>
            <p>{{ event.note }}</p>
            {% if event.source_id %}
              {% for source in rd.sources %}{% if source.id == event.source_id %}<a href="#source-{{ source.id }}">Source</a>{% endif %}{% endfor %}
            {% endif %}
          </article>
        </li>
        {% endfor %}
      </ol>
    </div>
  </section>

  <section class="rd-models" id="incentives" aria-labelledby="rd-models-title" data-rd-model-explorer>
    <div class="rd-section-heading">
      <p class="rd-kicker">Comparative institutional analysis</p>
      <h2 id="rd-models-title">Nine incentive structures, nine different bargains</h2>
      <p>Select a model for a concise reading, then use the table to compare the same variables across every regime.</p>
    </div>

    <div class="rd-model-explorer">
      <div class="rd-model-tabs" role="list" aria-label="Incentive structures">
        {% for model in rd.models %}
        <button type="button" role="listitem" data-rd-model="{{ model.id }}" aria-pressed="{% if forloop.first %}true{% else %}false{% endif %}">{{ model.short }}</button>
        {% endfor %}
      </div>
      <article class="rd-model-detail" data-rd-model-detail aria-live="polite">
        <p class="rd-model-detail__cases">{{ first_model.cases }}</p>
        <h3>{{ first_model.name }}</h3>
        <dl>
          <div><dt>Who pays</dt><dd>{{ first_model.payer }}</dd></div>
          <div><dt>Real horizon</dt><dd>{{ first_model.horizon }}</dd></div>
          <div><dt>What it preserves</dt><dd>{{ first_model.preserves }}</dd></div>
          <div><dt>Characteristic failure</dt><dd>{{ first_model.failure }}</dd></div>
        </dl>
      </article>
      <script type="application/json" data-rd-model-data>{{ rd.models | jsonify }}</script>
    </div>

    <details class="rd-comparison" open>
      <summary>Compare all incentive structures</summary>
      <div class="rd-table-scroll" tabindex="0">
        <table>
          <thead><tr><th>Model</th><th>Payer</th><th>Real horizon</th><th>Preserves</th><th>Characteristic failure</th></tr></thead>
          <tbody>
            {% for model in rd.models %}
            <tr data-rd-model-row="{{ model.id }}"><th>{{ model.name }}<small>{{ model.cases }}</small></th><td>{{ model.payer }}</td><td>{{ model.horizon }}</td><td>{{ model.preserves }}</td><td>{{ model.failure }}</td></tr>
            {% endfor %}
          </tbody>
        </table>
      </div>
    </details>
  </section>

  <section class="rd-argument" id="argument" aria-labelledby="rd-argument-title" data-rd-argument>
    <div class="rd-section-heading">
      <p class="rd-kicker">Causal argument map</p>
      <h2 id="rd-argument-title">How locally rational incentives can produce systemic capability loss</h2>
      <p>Select a node to isolate its claim, evidence classes, and causal neighborhood. Connections represent propositions the articles must substantiate—not settled facts.</p>
    </div>

    <div class="rd-argument-map" data-rd-argument-map>
      <canvas class="rd-map-lines" data-rd-argument-lines aria-hidden="true"></canvas>
      <div class="rd-argument-lanes">
        {% assign argument_lanes = rd.argument_nodes | group_by: "lane" %}
        {% for lane in argument_lanes %}
        <section>
          <h3>{{ lane.name }}</h3>
          <ul>
            {% for node in lane.items %}
            <li><button type="button" data-rd-argument-node="{{ node.id }}" aria-pressed="false"><span>{{ node.title }}</span><small>{% for evidence in node.evidence %}<b class="rd-evidence-token" data-evidence="{{ evidence }}">{{ evidence }}</b>{% endfor %}</small></button></li>
            {% endfor %}
          </ul>
        </section>
        {% endfor %}
      </div>
    </div>
    <aside class="rd-map-detail" data-rd-argument-detail aria-live="polite">
      <p class="rd-map-detail__lane">{{ first_argument.lane }}</p>
      <h3>{{ first_argument.title }}</h3>
      <p>{{ first_argument.detail }}</p>
    </aside>
    <script type="application/json" data-rd-argument-data>{"nodes":{{ rd.argument_nodes | jsonify }},"links":{{ rd.argument_links | jsonify }}}</script>
  </section>

  {% include rd-evidence-legend.html %}

  <section class="rd-articles" id="articles" aria-labelledby="rd-articles-title" data-rd-articles>
    <div class="rd-section-heading rd-section-heading--with-controls">
      <div>
        <p class="rd-kicker">Publication architecture</p>
        <h2 id="rd-articles-title">Twelve articles, added as their evidence closes</h2>
        <p>The landing page remains the map. Each published article will become a stable, separately sourced record rather than replacing this overview.</p>
      </div>
      <div class="rd-article-filters" role="group" aria-label="Filter articles by status">
        <button type="button" data-rd-article-filter="all" aria-pressed="true">All</button>
        <button type="button" data-rd-article-filter="available" aria-pressed="false">Published</button>
        <button type="button" data-rd-article-filter="researching" aria-pressed="false">In research</button>
        <button type="button" data-rd-article-filter="planned" aria-pressed="false">Planned</button>
        <button type="button" data-rd-article-filter="withdrawn" aria-pressed="false">Withdrawn</button>
      </div>
    </div>

    <ol class="rd-article-grid" data-rd-article-grid>
      {% assign rd_visible_article_count = 0 %}
      {% for article in rd.articles %}
      {% unless article.visible == false %}
      {% assign rd_visible_article_count = rd_visible_article_count | plus: 1 %}
      <li data-rd-article-card data-status="{{ article.status }}">
        <article>
          <header>
            <span class="rd-article-number">{{ article.number | prepend: '0' | slice: -2, 2 }}</span>
            <span class="rd-status" data-status="{{ article.status }}">{% if article.status == 'researching' %}In research{% elsif article.status == 'published' %}Published{% elsif article.status == 'revised' %}Revised{% elsif article.status == 'withdrawn' %}Withdrawn{% else %}Planned{% endif %}</span>
          </header>
          <p class="rd-article-case">{{ article.case }}</p>
          <h3>{{ article.title }}</h3>
          <p class="rd-article-claim">{{ article.claim }}</p>
          <details>
            <summary>Planned visual evidence</summary>
            <ul>{% for visual in article.visuals %}<li>{{ visual }}</li>{% endfor %}</ul>
          </details>
          {% if article.url %}<p class="rd-article-link"><a href="{{ article.url | relative_url }}">{% if article.status == 'withdrawn' %}View withdrawal record{% else %}Read article{% endif %}</a></p>{% endif %}
        </article>
      </li>
      {% endunless %}
      {% endfor %}
    </ol>
    <p class="rd-filter-status" data-rd-filter-status aria-live="polite">Showing all {{ rd_visible_article_count }} articles.</p>
  </section>

  <section class="rd-successor" id="successor" aria-labelledby="rd-successor-title" data-rd-brain>
    <div class="rd-section-heading">
      <p class="rd-kicker">The narrow path forward</p>
      <h2 id="rd-successor-title">An AI-native laboratory is an institution, not a model with a building</h2>
      <p>The proposed successor joins six systems that are usually funded, governed, and evaluated separately. Select a node to inspect its institutional function.</p>
    </div>

    <div class="rd-brain-layout">
      <div class="rd-brain-map" data-rd-brain-map>
        <canvas class="rd-map-lines" data-rd-brain-lines aria-hidden="true"></canvas>
        {% for node in rd.brain_nodes %}
        <button type="button" class="rd-brain-node rd-brain-node--{{ node.position }}" data-rd-brain-node="{{ node.id }}" aria-pressed="{% if forloop.first %}true{% else %}false{% endif %}">{{ node.title }}</button>
        {% endfor %}
      </div>
      <aside class="rd-brain-detail" data-rd-brain-detail aria-live="polite">
        <p class="rd-kicker">System function</p>
        <h3>{{ first_brain.title }}</h3>
        <p>{{ first_brain.detail }}</p>
        <div class="rd-successor-principle">
          <strong>Design test</strong>
          <span>Who is rewarded to preserve this capability after the founding program, administration, product cycle, or model generation ends?</span>
        </div>
      </aside>
    </div>
    <script type="application/json" data-rd-brain-data>{{ rd.brain_nodes | jsonify }}</script>

    <div class="rd-building-blocks" aria-label="Existing public policy building blocks">
      <article><span>Shared AI infrastructure</span><h3>NAIRR</h3><p>Compute, data, tools, training, and public–private resource contributions.</p><a href="#source-nairr-2026">Evidence</a></article>
      <article><span>Precompetitive technical commons</span><h3>NSTC</h3><p>Research, prototyping, commercialization, collaboration, and workforce development.</p><a href="#source-nstc">Evidence</a></article>
      <article><span>Long-term mission relationship</span><h3>FFRDCs</h3><p>Continuity, institutional memory, special access, objectivity, and public-interest obligations.</p><a href="#source-gao-ffrdc">Evidence</a></article>
      <article><span>Portfolio leadership</span><h3>DARPA</h3><p>Empowered program managers, ambitious goals, milestones, and cross-sector performer networks.</p><a href="#source-darpa-pm-model">Evidence</a></article>
    </div>
  </section>

  <section id="sources">
    {% include rd-source-list.html %}
  </section>

  <footer class="rd-series-footer">
    <p class="rd-kicker">Research posture</p>
    <p>The purpose of this series is not to prove that every old laboratory succeeded or every new institution failed. It is to discover which incentive structures preserve the ability to think, build, remember, and transition across a generation—and whether enough of that ability remains to construct a successor.</p>
    <p><time datetime="{{ rd.series.updated }}">Evidence map updated July 23, 2026.</time> Transaction status, statistics, and institutional descriptions will be revised when their underlying records change.</p>
    <p><a href="{{ '/rd-ratchet/method/' | relative_url }}">Read the public policy for evidence, feedback, corrections, archived versions, and withdrawals.</a></p>
  </footer>
</article>
