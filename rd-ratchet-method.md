---
layout: default
title: The R&D Ratchet — Editorial Method
description: Evidence, feedback, correction, versioning, withdrawal, and archival policy for The R&D Ratchet.
permalink: /rd-ratchet/method/
rd_series: true
---

<article class="rd-article rd-method" id="article-top" markdown="1">

<nav class="rd-breadcrumbs" aria-label="Breadcrumb">
  <a href="{{ '/rd-ratchet/' | relative_url }}">The R&amp;D Ratchet</a>
  <span aria-hidden="true">/</span>
  <span>Editorial method</span>
</nav>

<header class="rd-article-header" markdown="1">

<p class="rd-kicker">A living record with a memory</p>

# Editorial method

The series is designed to change when better evidence arrives without erasing what earlier readers encountered. Drafts may disappear; published claims may be corrected, superseded, or withdrawn, but they do not silently vanish.

</header>

## The lifecycle

<div class="rd-table-scroll" tabindex="0">
<table class="rd-data-table">
  <thead><tr><th>State</th><th>What readers see</th><th>Editorial rule</th></tr></thead>
  <tbody>
    <tr><th>Planned</th><td>A card on the series map</td><td>The question and proposed evidence are visible; no article is implied.</td></tr>
    <tr><th>Researching</th><td>A card marked “In research”</td><td>Evidence collection is active; conclusions remain provisional.</td></tr>
    <tr><th>Draft</th><td>Nothing public</td><td>Drafts can be reorganized or removed without a public record.</td></tr>
    <tr><th>Published</th><td>A permanent article URL and version number</td><td>An immutable snapshot is created at publication.</td></tr>
    <tr><th>Revised</th><td>The latest version plus the complete version history</td><td>Material changes require a new numbered snapshot and revision note.</td></tr>
    <tr><th>Withdrawn</th><td>A permanent withdrawal notice and prior-version history</td><td>The reason and date remain public; the URL does not become a silent 404.</td></tr>
  </tbody>
</table>
</div>

## Four evidence classes

{% include rd-evidence-legend.html %}

Firsthand memory is valuable but bounded. A contemporaneous document can establish what an institution announced, not necessarily what happened afterward. Interviews add participant knowledge and must be attributed or explicitly anonymized. Analysis connects the evidence and remains open to challenge. The articles mark these classes because mixing them invisibly would create false certainty.

## What the criticism targets

The series criticizes documented incentives, decisions, governance structures, and behaviors that damage research capability. It does not infer private motives, diagnose character, or turn a systemic argument into an attack on a named individual. People are named only when their documented role, attributed account, or work is necessary to the evidence.

The same discipline applies to institutions. Bell Labs, AT&T’s Shannon Laboratory, PARC, HRL, IBM Research, and their peers helped create much of the scientific and technical substrate on which the present depends. Some continue to produce important work. A surviving name, however, is not proof that its former breadth, autonomy, team density, infrastructure, or research horizon survived unchanged. When the series calls an institution a “shadow” of an earlier form, it must identify the capability dimension and evidence; where that evidence is missing, the status remains an open question.

The story should therefore carry the criticism. Credit is explicit, institutional continuity is tested rather than presumed, and individual blame is not used as a substitute for causal analysis.

## Version preservation

Every public version receives its own address beneath the article’s permanent URL. A snapshot freezes the article text, its source records, its revision note, and integrity hashes. Article-specific charts and illustrations are stored in versioned asset directories and are not overwritten by later revisions.

Version numbers follow a simple rule:

- `1.0`, `2.0`, and so on indicate a material change to the thesis, evidence, or interpretation.
- `1.1`, `1.2`, and so on indicate bounded corrections, clarifications, or new supporting evidence that do not reverse the central argument.
- Typographical repairs that do not change meaning may be recorded in the correction ledger without changing the major version.

Each current article links to all of its archived versions. Git history supplies another recovery layer, but the public website—not a source-control interface—is the primary historical record for readers.

## Feedback and corrections {#feedback}

Every published article provides three routes: a factual correction, an argument challenge, and a private channel for sensitive feedback. A useful submission identifies the exact claim, explains the proposed change, and supplies a source or a path to verification.

Feedback is assigned one of five public dispositions:

1. **Pending** — received but not yet evaluated.
2. **Accepted** — incorporated into a new version.
3. **Partially accepted** — some evidence or reasoning was incorporated, with the boundary explained.
4. **Declined** — considered but not incorporated, with a concise reason when the exchange is public.
5. **Deferred** — credible but dependent on evidence that is not yet available or publishable.

Attribution is opt-in. Private submissions are not published without permission. Public feedback must not contain confidential, proprietary, export-controlled, personally sensitive, or classified information.

## Withdrawal rather than disappearance

An article is withdrawn when its central evidentiary basis becomes unreliable, when publication creates an unanticipated safety or privacy problem, or when a material conflict cannot be repaired by ordinary revision. The current URL becomes a dated explanation. Prior versions remain linked unless preserving them would itself sustain the harm that required withdrawal; any exceptional restriction is explained publicly to the greatest safe extent.

## The governing rule

> Before publication, drafts may disappear. After publication, revisions accumulate and withdrawals leave a record.

<p class="rd-article-footer"><a href="{{ '/rd-ratchet/' | relative_url }}">← Return to The R&amp;D Ratchet</a></p>

</article>
