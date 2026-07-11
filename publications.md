---
layout: default
title: Publications by Research Area
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

  <p class="publication-note">The summaries are short editorial descriptions, not paper abstracts. <strong>Theory</strong> and <strong>Applied</strong> describe research orientation and may appear together; <strong>Perspective</strong> marks opinion or position papers. Resource links always prefer the official publication, followed by a public archive and then an author-hosted copy. Resource types that could not be located remain visible in gray.</p>

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
                      {% if paper.venue %}<span>{{ paper.venue | escape }}</span>{% endif %}
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

                {% if paper.availability %}
                  <p class="publication-unavailable" role="note">{{ paper.availability | escape }}</p>
                {% endif %}

                <details class="publication-summary">
                  <summary>Plain-language summary</summary>
                  <p>{{ paper.summary | escape }}</p>
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
