---
layout: default
title: News Coverage
description: Selected coverage of Karim Eldefrawy's work across cybersecurity, encrypted computing, secure communications, technology transition, and research impact.
permalink: /news.html
---

<article class="news-page">
  {% assign news_topics_newest_first = site.data.news_topics | reverse %}
  <div class="news-header">
    <p class="news-eyebrow">Coverage timeline · 2007–2024</p>
    <h1>News Coverage</h1>
    <p>Selected reporting on how the work moved from network defense and secure systems toward encrypted computing, private collaboration, and real-world impact.</p>
  </div>

  <figure class="news-topics" aria-labelledby="news-topics-title">
    <div class="news-section-heading">
      <div>
        <p class="news-section-kicker">The conversation over time</p>
        <h2 id="news-topics-title">Coverage Themes Over Time</h2>
      </div>
      <p class="news-topics-hint">Newest first · left to right</p>
    </div>

    <div
      class="news-topics__viewport"
      role="region"
      aria-label="News coverage themes timeline, newest first, from 2024 back to 2007"
      tabindex="0"
    >
      <ol class="news-topics__list">
        {% for topic in news_topics_newest_first %}
          <li class="news-topics__item">
            <time datetime="{{ topic.datetime }}">{{ topic.year_label }}</time>
            <a class="news-topics__tile" href="#news-topic-{{ topic.id }}">
              <span class="news-topics__marker" aria-hidden="true">
                {% include news-topic-icon.html name=topic.icon %}
              </span>
              <span class="news-topics__title">{{ topic.title | escape }}</span>
            </a>
            <span class="news-topics__summary">{{ topic.summary | escape }}</span>
          </li>
        {% endfor %}
      </ol>
    </div>

    <figcaption>A selective news wire of recurring themes; article links and sources appear below.</figcaption>
  </figure>

  <section class="news-coverage" aria-labelledby="news-coverage-title">
    <div class="news-section-heading">
      <div>
        <p class="news-section-kicker">Selected reporting</p>
        <h2 id="news-coverage-title">Coverage by Topic</h2>
      </div>
    </div>

    <div class="news-topic-list">
      {% for topic in news_topics_newest_first %}
        <article class="news-topic-detail" id="news-topic-{{ topic.id }}">
          <div class="news-topic-detail__header">
            <time datetime="{{ topic.datetime }}">{{ topic.year_label }}</time>
            <div>
              <h3>{{ topic.title | escape }}</h3>
              <p>{{ topic.summary | escape }}</p>
            </div>
          </div>
          <ul class="news-coverage-list">
            {% for item in topic.coverage %}
              <li>
                <time datetime="{{ item.year }}">{{ item.year }}</time>
                <div>
                  <a href="{{ item.url }}">{{ item.title | escape }}</a>
                  <span>{{ item.source | escape }}</span>
                </div>
              </li>
            {% endfor %}
          </ul>
        </article>
      {% endfor %}
    </div>
  </section>
</article>
