---
layout: default
title: Publications by Research Area
description: Browse 79 publications by research area, with stable paper identifiers, resource links, plain-language summaries, and human- and machine-readable scientific knowledge maps.
permalink: /publications/
publications_browser: true
---

<div id="publication-top" class="publication-browser">
  <p class="publication-eyebrow">Research library · {{ site.data.publications | size }} works · 2 domains · 5 areas</p>
  <h1>Publications by Research Area</h1>
  <p class="publication-intro">Browse the papers through two complementary perspectives: the methods and foundations used to build secure computation, and the security domains in which those methods are applied. Each paper has one primary area; keyword tags preserve connections across areas.</p>

  <nav class="publication-view-switcher" aria-label="Publication views">
    <strong>View:</strong>
    <span aria-current="page">By Research Area</span>
    <span aria-hidden="true">·</span>
    <a href="{{ '/pubs.html' | relative_url }}">Original chronological list</a>
  </nav>

  <nav class="publication-taxonomy-index" aria-label="Publication Research Areas">
    {% for domain in site.data.publication_domains %}
      <div class="domain-index-group">
        <p class="domain-index-title">{{ domain.name | escape }}</p>
        <div class="topic-index">
          {% for topic in domain.areas %}
            {% assign topic_papers = site.data.publications | where: "topic", topic.slug | sort: "year" | reverse %}
            <a class="topic-index-item" href="#{{ topic.slug }}">
              <span>{{ topic.short_name | escape }}</span>
              <span class="topic-count">{{ topic_papers | size }}<span class="sr-only"> publications</span></span>
            </a>
          {% endfor %}
        </div>
      </div>
    {% endfor %}
  </nav>

  <p class="publication-note">Abstract popups use the complete paper abstract when one has been transcribed from a source or supplied by the author. Papers without a source abstract show a clearly labeled editorial overview instead. Each popup identifies that provenance explicitly. <strong>Theory</strong>, <strong>Applied</strong>, and <strong>Perspective</strong> describe research orientation. Lowercase <strong>protocol</strong>, <strong>primitive</strong>, <strong>scheme</strong>, and <strong>algorithm</strong> tags identify substantive constructive content and may appear alongside Theory. Theory without one of those tags is reserved for non-constructive results or records with insufficient evidence to assert a construction. AI focus labels are cross-cutting: a paper may have a primary research area outside AI &amp; Machine Learning while still using AI for security. Resource links always prefer the official publication, followed by a public archive and then an author-hosted copy. Resource types that could not be located remain visible in gray.</p>

  <div class="publication-domain-grid">
    {% for domain in site.data.publication_domains %}
      <section class="publication-domain" aria-labelledby="{{ domain.slug }}">
      <div class="publication-domain-heading">
        <p class="publication-eyebrow">Research domain</p>
        <h2 id="{{ domain.slug }}">{{ domain.name | escape }}</h2>
        <p>{{ domain.description | escape }}</p>
      </div>

      {% for topic in domain.areas %}
        {% assign topic_papers = site.data.publications | where: "topic", topic.slug | sort: "year" | reverse %}
        <section class="publication-topic" aria-labelledby="{{ topic.slug }}">
          <div class="topic-heading">
            <p class="topic-kicker">{{ topic_papers | size }} works</p>
            <h3 id="{{ topic.slug }}">{{ topic.name | escape }}</h3>
            <p class="topic-description">{{ topic.description | escape }}</p>
            {% if topic.subtopics %}
              <ul class="research-area-subtopics" aria-label="{{ topic.name | escape }} subtopics">
                {% for subtopic in topic.subtopics %}<li>{{ subtopic | escape }}</li>{% endfor %}
              </ul>
            {% endif %}
          </div>

          <div class="publication-list">
            {% for paper in topic_papers %}
              {% assign resource_matches = site.data.publication_resources | where: "id", paper.id %}
              {% assign resources = resource_matches | first %}
              {% assign primary_resource = false %}
              {% if resources.official and resources.official != empty %}
                {% assign primary_resource = resources.official | first %}
              {% elsif resources.archive and resources.archive != empty %}
                {% assign primary_resource = resources.archive | first %}
              {% elsif resources.author and resources.author != empty %}
                {% assign primary_resource = resources.author | first %}
              {% endif %}

              {% if paper.abstract and paper.abstract != empty %}
                {% assign quick_abstract = paper.abstract %}
                {% assign quick_abstract_kind = paper.abstract_kind | default: "Source abstract" %}
                {% assign quick_abstract_note = paper.abstract_note | default: "This abstract is stored separately from the editorial summary." %}
                {% assign quick_abstract_source = paper.abstract_source_url %}
                {% assign abstract_action_label = "Abstract" %}
              {% else %}
                {% assign quick_abstract = paper.summary %}
                {% assign quick_abstract_kind = "Plain-language editorial overview" %}
                {% assign quick_abstract_note = "This is a concise editorial overview, not the paper's verbatim abstract." %}
                {% assign quick_abstract_source = false %}
                {% assign abstract_action_label = "Overview" %}
              {% endif %}

              <article class="publication-card" id="paper-{{ paper.id }}">
                <div class="publication-card-heading">
                  <span class="publication-number"><span class="sr-only">Publication number </span>#{{ paper.id }}</span>
                  <div>
                    <h4>
                      {% if primary_resource and primary_resource.url %}
                        <a href="{{ primary_resource.url | escape }}">{{ paper.title | escape }}</a>
                      {% else %}
                        {{ paper.title | escape }}
                      {% endif %}
                    </h4>
                    <p class="publication-authors">{{ paper.authors | escape }}</p>
                    <p class="publication-venue">
                      {% if paper.year %}<span>{{ paper.year }}</span>{% endif %}
                      {% if paper.status %}<span>{{ paper.status | escape }}</span>{% endif %}
                      {% if paper.venue %}
                        <span>{% if paper.venue_url %}<a href="{{ paper.venue_url | escape }}">{{ paper.venue | escape }}</a>{% else %}{{ paper.venue | escape }}{% endif %}</span>
                      {% endif %}
                    </p>
                  </div>
                </div>

                {% if paper.labels or paper.ai_ml_labels %}
                  <ul class="publication-labels" aria-label="Paper classifications">
                    {% for label in paper.labels %}
                      <li class="publication-label-{{ label | slugify }}">{{ label | escape }}</li>
                    {% endfor %}
                    {% for label in paper.ai_ml_labels %}
                      <li class="publication-label-ai-focus">{{ label | escape }}</li>
                    {% endfor %}
                    {% for contribution_type in paper.contribution_types %}
                      <li class="publication-label-contribution">{{ contribution_type | escape }}</li>
                    {% endfor %}
                  </ul>
                {% endif %}

                {% if paper.tags %}
                  <ul class="publication-tags" aria-label="Keywords">
                    {% for tag in paper.tags %}<li>{{ tag | escape }}</li>{% endfor %}
                  </ul>
                {% endif %}

                <div class="publication-resources" role="group" aria-label="Paper resources">
                  {% assign resource_types = "official,archive,author" | split: "," %}
                  {% for resource_type in resource_types %}
                    {% case resource_type %}
                      {% when "official" %}{% assign resource_heading = "Official version" %}
                      {% when "archive" %}{% assign resource_heading = "Public preprint / archive" %}
                      {% when "author" %}{% assign resource_heading = "Author-hosted copy" %}
                    {% endcase %}
                    {% assign resource_list = resources[resource_type] %}
                    <div class="publication-resource-slot{% if resource_list == nil or resource_list == empty %} is-unavailable{% endif %}">
                      <span class="publication-resource-kind">{{ resource_heading }}</span>
                      {% if resource_list and resource_list != empty %}
                        <span class="publication-resource-links">
                          {% for resource in resource_list %}
                            <a href="{{ resource.url | escape }}">{{ resource.label | escape }}</a>{% unless forloop.last %}<span aria-hidden="true"> · </span>{% endunless %}
                          {% endfor %}
                        </span>
                      {% else %}
                        <span class="publication-resource-missing" aria-label="{{ resource_heading }} not located">Not located</span>
                      {% endif %}
                    </div>
                  {% endfor %}
                </div>

                {% assign landing_matches = site.papers | where: "paper_id", paper.id %}
                {% assign landing = landing_matches | first %}
                {% capture map_key %}paper_{{ paper.id }}{% endcapture %}
                {% assign mapped_record = site.data.knowledge_maps[map_key] %}
                {% if landing %}
                  <p class="publication-knowledge-link">
                    <a href="{{ landing.url | relative_url }}">
                      Scientific knowledge map
                      <span>{% if mapped_record.curation.source_scope == "full_source_audit" %}claims, evidence, limits, and profile{% elsif mapped_record.curation.source_scope == "metadata_and_author_supplied_abstract" or mapped_record.curation.source_scope == "metadata_and_source_abstract" %}abstract-grounded AI draft · manuscript audit pending{% else %}AI draft · full author audit pending{% endif %}</span>
                      <span aria-hidden="true">→</span>
                    </a>
                  </p>
                {% endif %}

                {% if paper.availability %}
                  <p class="publication-unavailable" role="note">{{ paper.availability | escape }}</p>
                {% endif %}

                <button
                  class="quick-abstract-trigger"
                  type="button"
                  aria-haspopup="dialog"
                  aria-controls="publication-abstract-dialog"
                  data-quick-abstract-trigger
                  data-paper-number="{{ paper.id }}"
                  data-abstract-dialog-label="{{ abstract_action_label }}"
                >{{ abstract_action_label }}</button>

                <details class="publication-summary" id="paper-{{ paper.id }}-quick-abstract">
                  <summary>{{ abstract_action_label }}</summary>
                  <p class="publication-summary-kind" data-quick-abstract-kind>{{ quick_abstract_kind | escape }}</p>
                  <p data-quick-abstract-text>{{ quick_abstract | escape }}</p>
                  <p class="publication-summary-note" data-quick-abstract-note>{{ quick_abstract_note | escape }}</p>
                  {% if quick_abstract_source %}
                    <p class="publication-summary-source"><a data-quick-abstract-source href="{{ quick_abstract_source | escape }}">Abstract source</a></p>
                  {% endif %}
                </details>
              </article>
            {% endfor %}
          </div>

          <p class="back-to-topics"><a href="#publication-top">Back to Research Areas</a></p>
        </section>
      {% endfor %}
      </section>
    {% endfor %}
  </div>
</div>

<dialog
  class="publication-abstract-dialog"
  id="publication-abstract-dialog"
  aria-labelledby="publication-abstract-title"
  aria-modal="true"
>
  <div class="publication-abstract-dialog-shell">
    <div class="publication-abstract-dialog-header">
      <div>
        <p class="publication-abstract-paper" id="publication-abstract-paper"></p>
        <h2 id="publication-abstract-title"></h2>
      </div>
      <button class="publication-abstract-close" type="button" data-quick-abstract-close>Close</button>
    </div>
    <p class="publication-abstract-kind" id="publication-abstract-kind"></p>
    <p class="publication-abstract-text" id="publication-abstract-text"></p>
    <div class="publication-abstract-provenance">
      <p id="publication-abstract-note"></p>
      <a id="publication-abstract-source" href="" hidden>View abstract source</a>
    </div>
  </div>
</dialog>
