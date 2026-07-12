---
layout: default
title: Scientific Knowledge Maps
description: Human- and machine-readable maps of research questions, claims, evidence, limitations, artifacts, scrutiny, and source-bounded epistemic profiles for 79 papers.
permalink: /knowledge/
knowledge_hub: true
---

<div class="knowledge-hub">
  <p class="knowledge-eyebrow">AI-assisted scientific knowledge presentation · experimental</p>
  <h1>Scientific Knowledge Maps</h1>
  <p class="knowledge-hub-intro">Explore the research as a landscape: five areas, the topics and papers within them, and selected intellectual lineages connecting earlier ideas to this body of work. The complete paper-by-paper catalog remains available below.</p>

  <nav class="knowledge-layer-nav" aria-label="Knowledge map layers">
    <a href="#research-landscape">Research landscape</a>
    <a href="#idea-lineages">Ideas and lineages</a>
    <a href="#map-anatomy">How to read the maps</a>
    <a href="#paper-catalog">All paper maps</a>
  </nav>

  <section class="knowledge-landscape" id="research-landscape" aria-labelledby="research-landscape-heading" data-knowledge-landscape>
    <header class="knowledge-section-heading">
      <p class="knowledge-section-label">Research landscape</p>
      <h2 id="research-landscape-heading">Five connected areas of work</h2>
      <p>Select an area to see its broad themes, recurring paper topics, and related research.</p>
    </header>

    <div class="knowledge-landscape__map" aria-label="Five research areas grouped into Methods and Foundations and Security Domains">
      <div class="knowledge-landscape__root">
        <span>Research program</span>
        <strong>{{ site.data.publications | size }}</strong>
        <small>mapped papers</small>
      </div>

      <div class="knowledge-landscape__domains">
        {% for domain in site.data.publication_domains %}
          <section class="knowledge-landscape__domain" aria-labelledby="knowledge-domain-{{ domain.slug }}">
            <header>
              <h3 id="knowledge-domain-{{ domain.slug }}">{{ domain.name | escape }}</h3>
              <p>{{ domain.description | escape }}</p>
            </header>
            <ul class="knowledge-landscape__areas">
              {% for area in domain.areas %}
                {% assign area_papers = site.data.publications | where: "topic", area.slug %}
                <li id="knowledge-area-{{ area.slug }}">
                  <a
                    href="#catalog-topic-{{ area.slug }}"
                    data-knowledge-area-control="{{ area.slug }}"
                    data-area-name="{{ area.name | escape }}"
                    data-area-domain="{{ domain.name | escape }}"
                    data-area-description="{{ area.description | escape }}"
                    data-area-subtopics="{{ area.subtopics | jsonify | escape }}"
                    aria-controls="knowledge-selected-area"
                    aria-label="{{ area.name | escape }}, {{ area_papers | size }} papers"
                  >
                    <span class="knowledge-landscape__area-name">{{ area.short_name | escape }}</span>
                    <span class="knowledge-landscape__area-count">{{ area_papers | size }} papers</span>
                    <small>{{ area.description | escape }}</small>
                  </a>
                </li>
              {% endfor %}
            </ul>
          </section>
        {% endfor %}
      </div>
    </div>

    <section class="knowledge-area-detail" id="knowledge-selected-area" data-knowledge-area-detail hidden aria-labelledby="knowledge-selected-area-heading">
      <header class="knowledge-area-detail__header">
        <p data-knowledge-selected-domain></p>
        <h3 id="knowledge-selected-area-heading" data-knowledge-selected-name></h3>
        <p data-knowledge-selected-description></p>
      </header>

      <div class="knowledge-area-detail__grid">
        <section aria-labelledby="knowledge-broad-themes-heading">
          <h4 id="knowledge-broad-themes-heading">Broad themes</h4>
          <ul class="knowledge-theme-list" data-knowledge-subtopics></ul>

          <h4>Topics found in these papers</h4>
          <p class="knowledge-area-detail__hint">Select an exact paper tag to reveal the papers carrying it.</p>
          <div class="knowledge-topic-cloud" data-knowledge-topic-cloud aria-label="Paper topic filters"></div>
          <button class="knowledge-topic-cloud__more" type="button" data-knowledge-topics-more hidden>Show all topics</button>
        </section>

        <section aria-labelledby="knowledge-related-papers-heading">
          <div class="knowledge-related-papers__heading">
            <h4 id="knowledge-related-papers-heading">Related papers</h4>
            <p data-knowledge-paper-status role="status" aria-live="polite"></p>
          </div>
          <ol class="knowledge-related-papers" data-knowledge-paper-preview></ol>
          <div class="knowledge-related-papers__actions">
            <button type="button" data-knowledge-papers-more hidden>Show all papers</button>
            <a href="#paper-catalog" data-knowledge-catalog-link>View this area in the complete catalog</a>
          </div>
        </section>
      </div>
    </section>

    <noscript><p class="knowledge-noscript">Each research-area link opens its corresponding section in the complete catalog below.</p></noscript>
  </section>

  <section class="knowledge-lineages" id="idea-lineages" aria-labelledby="idea-lineages-heading" data-knowledge-lineages>
    <header class="knowledge-section-heading">
      <p class="knowledge-section-label">Selected intellectual lineages</p>
      <h2 id="idea-lineages-heading">People → ideas → Karim’s work</h2>
      <p>The scientific lineage shown here begins with Gödel, Turing, von Neumann, and Shannon, then follows later concepts and researchers to selected papers and patents. Choose a view, then select any node to follow its relationships.</p>
    </header>

    {% assign lineage_order = "cipher,hotel,tour" | split: "," %}
    <div class="knowledge-lineage-tabs" role="group" aria-label="Choose an ideas map">
      {% for scene_key in lineage_order %}
        {% case scene_key %}
          {% when "cipher" %}
            {% assign lineage_label = "Cryptographic ideas" %}
            {% assign lineage_title = "A Century of Cryptographic Ideas" %}
            {% assign lineage_description = "From Turing’s cryptanalysis and Shannon’s information-theoretic foundations through public-key cryptography, zero knowledge, elliptic curves, and encrypted computation." %}
            {% assign lineage_exclusions = "" %}
            {% assign lineage_note_exclusions = "" %}
          {% when "hotel" %}
            {% assign lineage_label = "Formal & reliable systems" %}
            {% assign lineage_title = "From Formal Models to Reliable Cryptographic Systems" %}
            {% assign lineage_description = "How Gödel’s work on formal systems, Turing’s model of computation, and von Neumann’s reliable-computing lineage support formal proof, cryptographic security, and resilient distributed systems." %}
            {% assign lineage_exclusions = "hotel-hilbert,hotel-cantor,hotel-foundations" %}
            {% assign lineage_note_exclusions = "mathematics" %}
          {% when "tour" %}
            {% assign lineage_label = "Information to quantum" %}
            {% assign lineage_title = "From Information Theory to Qubits" %}
            {% assign lineage_description = "From Shannon’s information theory through public-key cryptography and timed release to quantum algorithms, protocols, and post-quantum security." %}
            {% assign lineage_exclusions = "" %}
            {% assign lineage_note_exclusions = "" %}
        {% endcase %}
        <button
          type="button"
          data-knowledge-lineage-scene="{{ scene_key }}"
          data-knowledge-lineage-map-title="{{ lineage_title | escape }}"
          data-knowledge-lineage-map-description="{{ lineage_description | escape }}"
          data-knowledge-lineage-exclude="{{ lineage_exclusions }}"
          data-knowledge-lineage-exclude-notes="{{ lineage_note_exclusions }}"
          aria-pressed="{% if forloop.first %}true{% else %}false{% endif %}"
        >
          {{ lineage_label | escape }}
        </button>
      {% endfor %}
    </div>

    <div class="knowledge-lineage-map">
      <header class="knowledge-lineage-map__header">
        <h3 data-knowledge-lineage-title>Ideas map</h3>
        <p data-knowledge-lineage-description></p>
      </header>

      <div class="knowledge-lineage-map__graph" data-knowledge-lineage-graph>
        <canvas data-knowledge-lineage-lines aria-hidden="true"></canvas>
        <div class="knowledge-lineage-map__lanes">
          <section class="knowledge-lineage-map__lane" aria-labelledby="knowledge-lineage-people-heading">
            <h4 id="knowledge-lineage-people-heading">People</h4>
            <ol data-knowledge-lineage-people></ol>
          </section>
          <section class="knowledge-lineage-map__lane" aria-labelledby="knowledge-lineage-ideas-heading">
            <h4 id="knowledge-lineage-ideas-heading">Ideas</h4>
            <ol data-knowledge-lineage-ideas></ol>
          </section>
          <section class="knowledge-lineage-map__lane" aria-labelledby="knowledge-lineage-work-heading">
            <h4 id="knowledge-lineage-work-heading">Karim’s work</h4>
            <ol data-knowledge-lineage-work></ol>
          </section>
        </div>
        <div class="knowledge-lineage-foundations" data-knowledge-lineage-notes hidden></div>
      </div>

      <div class="knowledge-lineage-legend" aria-label="Connection types">
        <strong>Connections</strong>
        <ul>
          {% for link_type in site.data.curiosity_connections.link_types %}
            <li data-link-type="{{ link_type[0] }}"><span aria-hidden="true"></span>{{ link_type[1].label | escape }}</li>
          {% endfor %}
        </ul>
      </div>

      <div class="knowledge-lineage-detail" data-knowledge-lineage-detail aria-live="polite">
        <p>Select a person, idea, paper, or patent to follow its connections.</p>
      </div>
      <p class="knowledge-lineage-qualification">{{ site.data.curiosity_connections.evidence_note | escape }}</p>
    </div>

    <noscript><p class="knowledge-noscript">The interactive lineage views require JavaScript; their source material is also available through the idea maps in the left sidebar.</p></noscript>
  </section>

  <section class="knowledge-explainer" id="map-anatomy" aria-labelledby="map-anatomy-heading">
    <header class="knowledge-section-heading">
      <p class="knowledge-section-label">How to read the maps</p>
      <h2 id="map-anatomy-heading">Several depths, one inspectable record</h2>
    </header>

    <div class="knowledge-principles">
      <section>
        <h3>For people</h3>
        <p>Hierarchical maps replace a single linear reading path with collapsible branches for claims, methods, evidence, limitations, artifacts, and scrutiny.</p>
      </section>
      <section>
        <h3>For agents</h3>
        <p>The same record is available as JSON with stable identifiers, typed relations, source anchors, provenance, and explicit epistemic status.</p>
      </section>
      <section>
        <h3>For honest uncertainty</h3>
        <p>Six dimensions remain separate. Missing evidence is visible, assumptions qualify claims, and no single score is presented as truth or correctness.</p>
      </section>
    </div>

    <aside class="knowledge-review-status" role="note">
      <strong>Process:</strong>
      <span>AI assists with drafting each map and profile. Every entry states its source scope and review status so readers can distinguish summary-bounded, abstract-grounded, and full-source records. These labels describe inspectability and curation, not correctness or importance. The website remains static and uses no automated ingestion or scoring pipeline.</span>
    </aside>
  </section>

  <section class="knowledge-method" aria-labelledby="knowledge-method-heading">
    <p class="knowledge-section-label">The six dimensions</p>
    <h2 id="knowledge-method-heading">A profile, not a verdict</h2>
    <dl>
      {% for axis in site.data.knowledge_axes.axes %}
        <div>
          <dt>{{ axis.label | escape }}</dt>
          <dd>{{ axis.description | escape }}</dd>
        </div>
      {% endfor %}
    </dl>
    <p><strong>Auditability</strong> follows the paper resources represented on this site: High when a publicly inspectable full-text copy is linked through an archive or author-hosted route, Medium when only official publication metadata is linked, and Low when no paper-specific resource is represented. A High rating means the paper can be inspected; it does not by itself establish artifact completeness, exact version correspondence, or independent reproduction.</p>
    <p><strong>Production provenance</strong> defaults to Medium when named authorship and publication or review status establish a baseline lifecycle trail. That default remains provisional when contributor roles, revision and effort history, AI or tool use, artifact-version lineage, or explicit final approval have not been audited.</p>
    <p><strong>Reception</strong> uses a dated, reproducible citation snapshot: Low for 0–8 located citations, Medium for 9–10, and High for 11 or more. Each paper records the count, source or search method, date, and coverage limits. This is a time-dependent attention signal, not evidence that the paper is correct.</p>
    <p><strong>Contribution significance</strong> captures first-of-kind capabilities, breakthroughs, and important resolutions without conflating them with correctness, reception, or scrutiny.</p>
    <p><strong>Contribution types</strong> are a separate controlled vocabulary: protocol for interactive procedures, primitive for foundational security functionality, scheme for algorithm/interface families, and algorithm for non-interactive computational procedures. Multiple types may apply.</p>
  </section>

  <section class="knowledge-catalog" id="paper-catalog" aria-labelledby="knowledge-catalog-heading">
    <p class="knowledge-section-label">Complete catalog</p>
    <h2 id="knowledge-catalog-heading">All {{ site.papers | size }} paper maps</h2>
    <p>Every publication has a stable map and six-axis profile. Each record exposes its source scope, review status, evidence, limitations, and artifacts directly. Source-linked status describes inspectability; it is not a correctness or importance ranking.</p>

    {% for domain in site.data.publication_domains %}
      <section class="knowledge-catalog-domain" aria-labelledby="catalog-{{ domain.slug }}">
        <h3 id="catalog-{{ domain.slug }}">{{ domain.name | escape }}</h3>
        {% for topic in domain.areas %}
          {% assign topic_papers = site.data.publications | where: "topic", topic.slug | sort: "year" | reverse %}
          <div class="knowledge-catalog-topic" aria-labelledby="catalog-topic-{{ topic.slug }}">
            <h4 id="catalog-topic-{{ topic.slug }}">{{ topic.name | escape }} <span>{{ topic_papers | size }}</span></h4>
            <ol>
              {% for paper in topic_papers %}
                {% assign landing_matches = site.papers | where: "paper_id", paper.id %}
                {% assign landing = landing_matches | first %}
                {% capture map_key %}paper_{{ paper.id }}{% endcapture %}
                {% assign mapped_record = site.data.knowledge_maps[map_key] %}
                <li
                  id="catalog-paper-{{ paper.id }}"
                  data-knowledge-paper
                  data-paper-id="{{ paper.id }}"
                  data-topic="{{ topic.slug }}"
                  data-tags="{{ paper.tags | jsonify | escape }}"
                >
                  <span class="knowledge-catalog-number">#{{ paper.id }}</span>
                  <div>
                    <a href="{{ landing.url | relative_url }}">{{ paper.title | escape }}</a>
                    <span class="knowledge-catalog-meta">{% if paper.year %}{{ paper.year }} · {% endif %}{{ paper.status | escape }}</span>
                    {% if paper.contribution_types != empty %}<span class="knowledge-catalog-types">{{ paper.contribution_types | join: " · " | escape }}</span>{% endif %}
                  </div>
                  <span class="paper-stage paper-stage-mapped">{% if mapped_record.curation.source_scope == "full_source_audit" %}Source-linked map{% elsif mapped_record.curation.source_scope == "metadata_and_author_supplied_abstract" or mapped_record.curation.source_scope == "metadata_and_source_abstract" %}Abstract-grounded map{% else %}AI map draft{% endif %}</span>
                </li>
              {% endfor %}
            </ol>
          </div>
        {% endfor %}
      </section>
    {% endfor %}
  </section>

  <p class="knowledge-json-index"><a href="{{ '/knowledge/papers/index.json' | relative_url }}">Machine-readable index of all {{ site.data.publications | size }} paper entries</a> · <a href="{{ '/knowledge/index.json' | relative_url }}">Machine-readable index of deep knowledge maps</a></p>
</div>
