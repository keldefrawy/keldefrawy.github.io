---
layout: default
title: Awards and Recognitions
description: Selected recognition spanning research, invention, cybersecurity, and commercial innovation from 2008 through 2026.
permalink: /awards.html
---

<article class="awards-page">
  <div class="awards-header">
    <p class="awards-eyebrow">Recognition timeline · 2008–2026</p>
    <h1>Awards and Recognitions</h1>
    <p>Selected milestones spanning research impact, invention, cybersecurity, and commercial innovation.</p>
  </div>

  <section class="awards-timeline" aria-labelledby="awards-timeline-title">
    <div class="awards-section-heading">
      <div>
        <p class="awards-section-kicker">From research to real-world impact</p>
        <h2 id="awards-timeline-title">Recognition over time</h2>
      </div>
      <p class="awards-timeline-hint">Chronological · left to right</p>
    </div>

    <div
      class="awards-timeline__viewport"
      role="region"
      aria-label="Chronological awards timeline from 2008 through 2026"
      tabindex="0"
    >
      <ol class="awards-timeline__list">
        {% for award in site.data.awards %}
          <li class="awards-timeline__item">
            <time datetime="{{ award.year }}">{{ award.year }}</time>
            <span class="awards-timeline__marker award-icon--{{ award.icon }}" aria-hidden="true"></span>
            <a href="#award-{{ award.year }}">{{ award.short_title | escape }}</a>
            <span class="awards-timeline__organization">{{ award.organization | escape }}</span>
          </li>
        {% endfor %}
      </ol>
    </div>
  </section>

  <section class="awards-details" aria-labelledby="awards-details-title">
    <div class="awards-section-heading">
      <div>
        <p class="awards-section-kicker">Full record</p>
        <h2 id="awards-details-title">Award details</h2>
      </div>
    </div>

    <div class="awards-detail-list">
      {% assign awards_newest_first = site.data.awards | reverse %}
      {% for award in awards_newest_first %}
        <article class="award-detail" id="award-{{ award.year }}">
          <time datetime="{{ award.year }}">{{ award.year }}</time>
          <div>
            <h3>{{ award.title | escape }}</h3>
            <div class="award-detail__description">{{ award.description | markdownify }}</div>
          </div>
        </article>
      {% endfor %}
    </div>
  </section>
</article>
