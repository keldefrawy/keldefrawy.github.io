---
layout: default
title: Scientific Knowledge Maps
description: Human- and machine-readable maps of research questions, claims, evidence, limitations, artifacts, scrutiny, and source-bounded epistemic profiles for 79 papers.
permalink: /knowledge/
knowledge_hub: true
---

{% assign pilot = site.data.knowledge_maps.paper_50 %}

<div class="knowledge-hub">
  <p class="knowledge-eyebrow">AI-assisted scientific publishing · pilot</p>
  <h1>Scientific Knowledge Maps</h1>
  <p class="knowledge-hub-intro">A paper should be readable at several depths: a research question and central answer in seconds, a hierarchy of claims and assumptions in minutes, and a source-linked evidence trail when verification matters.</p>

  <div class="knowledge-principles">
    <section>
      <h2>For people</h2>
      <p>Hierarchical maps replace a single linear reading path with collapsible branches for claims, methods, evidence, limitations, artifacts, and scrutiny.</p>
    </section>
    <section>
      <h2>For agents</h2>
      <p>The same record is available as JSON with stable identifiers, typed relations, source anchors, provenance, and explicit epistemic status.</p>
    </section>
    <section>
      <h2>For honest uncertainty</h2>
      <p>Six dimensions remain separate. Missing evidence is visible, assumptions qualify claims, and no single score is presented as truth or correctness.</p>
    </section>
  </div>

  <aside class="knowledge-review-status" role="note">
    <strong>Simple publishing model:</strong>
    <span>AI drafts each map and profile; a human reviews and revises it before approval. VRASED is the full-source exemplar. The other corpus entries begin as clearly labeled summary- or abstract-bounded drafts and must not be mistaken for completed source audits. The website remains static and uses no automated ingestion, scoring pipeline, or GitHub Actions workflow.</span>
  </aside>

  <section class="knowledge-pilot" aria-labelledby="knowledge-pilot-heading">
    <p class="knowledge-section-label">First mapped paper</p>
    <h2 id="knowledge-pilot-heading"><a href="{{ pilot.canonical_path | relative_url }}">{{ pilot.title | escape }}</a></h2>
    <p>{{ pilot.central_answer | escape }}</p>
    <ul>
      <li>Stage: {{ pilot.stage | replace: '_', ' ' }}</li>
      <li>Curation: {{ pilot.curation.approval.status }} author approval</li>
      <li>{{ pilot.nodes | size }} stable map nodes</li>
      <li>{{ pilot.source_anchors | size }} source anchors</li>
    </ul>
    <p><a href="{{ pilot.canonical_path | relative_url }}">Explore the human map</a> · <a href="{{ pilot.machine_path | relative_url }}">Read the JSON record</a></p>
  </section>

  <section class="knowledge-catalog" aria-labelledby="knowledge-catalog-heading">
    <p class="knowledge-section-label">Complete Phase 1 catalog</p>
    <h2 id="knowledge-catalog-heading">All {{ site.papers | size }} paper entries</h2>
    <p>Every publication now has a stable AI-drafted map and six-axis profile. Summary- and abstract-bounded maps expose their incomplete source-audit status directly; VRASED demonstrates the deeper target with page-level evidence and post-publication scrutiny.</p>

    {% for domain in site.data.publication_domains %}
      <section class="knowledge-catalog-domain" aria-labelledby="catalog-{{ domain.slug }}">
        <h3 id="catalog-{{ domain.slug }}">{{ domain.name | escape }}</h3>
        {% for topic in domain.areas %}
          {% assign topic_papers = site.data.publications | where: "topic", topic.slug | sort: "year" | reverse %}
          <div class="knowledge-catalog-topic">
            <h4>{{ topic.name | escape }} <span>{{ topic_papers | size }}</span></h4>
            <ol>
              {% for paper in topic_papers %}
                {% assign landing_matches = site.papers | where: "paper_id", paper.id %}
                {% assign landing = landing_matches | first %}
                {% capture map_key %}paper_{{ paper.id }}{% endcapture %}
                {% assign mapped_record = site.data.knowledge_maps[map_key] %}
                <li id="catalog-paper-{{ paper.id }}">
                  <span class="knowledge-catalog-number">#{{ paper.id }}</span>
                  <div>
                    <a href="{{ landing.url | relative_url }}">{{ paper.title | escape }}</a>
                    <span class="knowledge-catalog-meta">{{ paper.year }} · {{ paper.status | escape }}</span>
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
    <p><strong>Contribution significance</strong> captures first-of-kind capabilities, breakthroughs, and important resolutions without conflating them with correctness, reception, or scrutiny.</p>
    <p><strong>Contribution types</strong> are a separate controlled vocabulary: protocol for interactive procedures, primitive for foundational security functionality, scheme for algorithm/interface families, and algorithm for non-interactive computational procedures. Multiple types may apply.</p>
  </section>

  <p class="knowledge-json-index"><a href="{{ '/knowledge/papers/index.json' | relative_url }}">Machine-readable index of all {{ site.data.publications | size }} paper entries</a> · <a href="{{ '/knowledge/index.json' | relative_url }}">Machine-readable index of deep knowledge maps</a></p>
</div>
