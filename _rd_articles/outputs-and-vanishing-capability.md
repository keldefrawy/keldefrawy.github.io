---
title: Papers, Patents, Prototypes—and Vanishing Capability
article_number: 11
article_slug: outputs-and-vanishing-capability
permalink: /rd-ratchet/outputs-and-vanishing-capability/
article_status: Draft
published: true
dek: The artifacts that remain easiest to count after a team disperses are not the same as the capability needed to produce, challenge, and transition the next result.
date: 2026-07-24
updated: 2026-07-24
version: "0.2"
version_sequence: 2
revision_summary: Cross-series review made the author’s disclosed record explicitly an audit object, never a representative productivity benchmark.
reading_time: 14
central_claim: Papers, patents, programs, prototypes, awards, and citations are lossy projections of a stateful research system; each can rise while the underlying capacity for the next generation of work declines.
claim_status: Provisional measurement framework illustrated with the author’s disclosed record, not a claim of representative productivity
hero_image: /assets/images/rd-ratchet/articles/article-11-outputs-and-capability.webp
hero_alt: Counted papers, patent drawings, and prototypes remain on a measurement shelf while the teams, archives, instruments, correction loops, and roots beneath them begin to fade.
hero_caption: Conceptual illustration; output counts are evidence categories, not a performance score.
source_ids:
  - karim-publication-record
  - karim-patent-record
  - karim-project-record
  - ndss-test-of-time-2024
  - uspto-patent-examination
  - leiden-manifesto
  - wang-novelty
evidence_chart:
  kicker: One output, several domains
  title: Thirty-one granted patents distribute across five disclosed technical topics
  summary: The distribution demonstrates breadth in a countable output class. It does not measure patent quality, independence, adoption, revenue, public value, or the current existence of the teams that produced them.
  aria_label: The author's 31 granted patents are grouped as 11 in proactive cryptography, 7 in network and cloud defense, 6 in private search and data, 4 in secure identity and biometrics, and 3 in cryptographic software.
  source_id: karim-patent-record
  note: Primary-topic classification on the author-maintained site; several patents could reasonably span more than one category.
  bars:
    - { label: "Proactive cryptography", value: "11 patents", percent: 100, tone: blue }
    - { label: "Network & cloud defense", value: "7 patents", percent: 63.6, tone: orange }
    - { label: "Private search & data", value: "6 patents", percent: 54.5, tone: green }
    - { label: "Secure identity & biometrics", value: "4 patents", percent: 36.4, tone: purple }
    - { label: "Cryptographic software", value: "3 patents", percent: 27.3, tone: blue }
argument_map:
  kicker: Source-linked argument map
  title: Why an output ledger cannot serve as a capability balance sheet
  summary: Outputs are real evidence, but every metric omits critical state and can be optimized without preserving the production system.
  caption: The framework does not diminish the work represented by outputs; it limits what may be inferred from their counts.
  nodes:
    - role: Documented observation
      title: The site contains many countable artifacts
      text: The author’s records list 79 research works, 31 granted patents, and 12 funded R&D awards.
      source_ids: [karim-publication-record, karim-patent-record, karim-project-record]
    - role: Measurement distinction
      title: Each artifact answers a different question
      text: A paper records a claim, a patent a legally examined invention, a program funded activity, and an award retrospective recognition.
      source_ids: [uspto-patent-examination, ndss-test-of-time-2024]
    - role: Proposed mechanism
      title: Proxy selection reshapes behavior
      text: When renewal and status depend on visible outputs, institutions can increase the proxy while underinvesting in maintenance, correction, apprenticeship, and transition.
      source_ids: [leiden-manifesto, wang-novelty]
    - role: Bounded conclusion
      title: Pair every output with a state transition
      text: Evaluation should ask what became true, usable, maintained, teachable, and reproducible—and which capability remained five years later.
      source_ids: [ndss-test-of-time-2024, leiden-manifesto]
objection_ladders:
  - claim: Output metrics can rise while research capability declines.
    first_objection: Papers, patents, programs, and awards are not arbitrary proxies; they are costly artifacts that correlate with real work.
    first_response: Yes. They should remain evidence. The claim is that no one output class identifies the retained system or its future production capacity.
    second_objection: Adding qualitative capability judgments invites favoritism and makes evaluation less auditable than counts.
    conclusion: Use structured, inspectable evidence—artifact reuse, team continuity, maintenance, independent correction, transition, and rebuild cost—alongside counts, with reviewers required to explain deviations.
    source_ids: [leiden-manifesto, uspto-patent-examination]
  - claim: A Test of Time Award is stronger evidence than near-term citations.
    first_objection: Awards remain selective social judgments and can reflect network visibility, field size, or survivorship bias.
    first_response: Correct. Long delay filters some novelty cycles and offers evidence of influence, but it does not prove correctness, deployment, or institutional continuity.
    second_objection: If even retrospective recognition cannot support a durable verdict, the framework risks making success impossible to establish.
    conclusion: >-
      Allow strong but dimension-specific conclusions: the award supports enduring scholarly influence; separate evidence must establish technical use, transition, institutional survival, and public value.
    source_ids: [ndss-test-of-time-2024, wang-novelty]
corrections: []
---

My website lists 79 research works, 31 granted U.S. patents, and 12 funded R&D awards. It also records software, talks, awards, and a company built from earlier research. These are not invented metrics imposed from outside; I chose to curate them because they record real work. <span class="rd-evidence-token" data-evidence="D">D</span>

This disclosed record is an **audit object**, not a representative benchmark. It is useful because the claims and omissions can be inspected against a known ledger. Nothing in the counts establishes what another researcher, field, institution, or career stage should produce.

They also demonstrate the measurement problem.

The lists remain after a project ends. They remain after colleagues move. They remain if code no longer builds, an instrument is dismantled, a result is superseded, or no organization can reproduce the integrated system. That durability makes outputs useful historical evidence and dangerous substitutes for capability.

## What each count actually certifies

[The publication record](#source-karim-publication-record) establishes that the site curates 79 works. It does not establish that every result is correct, equally important, independently replicated, or still supported by an active research line.

[The patent record](#source-karim-patent-record) links 31 granted inventions to public patent documents. A granted patent has passed a legal examination for patentability under the relevant process. [The USPTO’s guidance](#source-uspto-patent-examination) makes clear that this is patent examination, not scholarly peer review. A patent does not certify that the invention was built, adopted, profitable, secure under every model, or institutionally preserved.

[The project record](#source-karim-project-record) lists 12 funded awards. An award establishes that a sponsor selected and funded work under stated conditions. It does not establish that the program met every goal, transitioned, or left reusable capability.

These are not criticisms of the outputs. They are type checks. A system becomes confused when evidence of one kind is accepted as a verdict of another.

## Outputs are projections

Imagine the actual research system as a high-dimensional state:

- people and complementary roles;
- working relationships and mentorship;
- code, data, instruments, fabrication, and test environments;
- tacit knowledge and negative results;
- authority to choose problems;
- access to users and transition partners;
- independent mechanisms for finding error.

A publication count projects that state onto one axis. A patent count projects it onto another. Funding totals, prototypes, citations, and awards are additional projections. None is false. Each discards information.

The danger appears when the projection becomes the objective. Teams learn which work produces countable units. Institutions allocate support to what renews grants, improves rankings, fills an IP ledger, or produces a demonstration before review. Maintenance and replication remain undercounted because they often preserve value rather than create a new unit.

[The Leiden Manifesto](#source-leiden-manifesto) does not reject quantitative indicators. It argues that indicators should support qualitative expert assessment, respect field differences, and remain open to scrutiny. [Research on delayed recognition and novelty](#source-wang-novelty) adds another warning: novel work can have more variable impact and take longer to be recognized, so short windows systematically distort selection. <span class="rd-evidence-token" data-evidence="D">D</span>

## The capability-lag problem

Output and capability can move in opposite directions for a time because output lags accumulated state.

A mature team may publish and patent vigorously while losing junior hiring, maintainers, or discretionary time. Previously initiated projects continue yielding results. The visible ledger looks healthy. The missing investment becomes apparent only when the next generation of problems fails to start.

This is analogous to a factory meeting shipments while deferring maintenance. The analogy has limits—research is not a production line—but the accounting insight holds. Current output draws on past capability. It does not measure the replacement rate.

A minimal institutional report should therefore pair flows with stocks:

- **Flow:** papers, patents, prototypes, dollars, milestones, hires, releases.
- **Stock:** intact teams, maintained artifacts, functioning facilities, mentorship depth, active transition relationships, and time-to-reconstitute lost capability.
- **Depreciation:** departures, obsolete environments, inaccessible data, broken interfaces, lost problem authority, and unrecorded failures.

Without the last two, rising output may conceal capability debt.

## A retrospective signal and its boundary

The [NDSS Test of Time Award](#source-ndss-test-of-time-2024) is a rarer kind of evidence. It recognizes influence after a long interval rather than optimizing for immediate attention. In 2024 it recognized work I coauthored on an Internet-censorship system. That is meaningful evidence of enduring scholarly and technical influence. <span class="rd-evidence-token" data-evidence="D">D</span>

It still does not answer every question. Did the system deploy? Which ideas were reused? Did the original team remain connected? Did the institution preserve the capacity to pursue the next problem? What public benefit followed? A retrospective award strengthens one verdict without collapsing the other four.

That discipline protects the work from both inflation and erasure. We need not pretend an award proves everything in order to say that it proves something important.

## The strongest counterargument

Research capability is latent. Unlike a paper count, it cannot be audited directly. Managers who dislike an objective metric can invoke “tacit knowledge” or “future potential” to protect favored teams. A capability ledger could become a vocabulary for institutional rent-seeking.

That is a real danger. The answer is not to retreat to one-dimensional counts. It is to operationalize the stock.

For each claimed capability, ask for observable tests:

- Can an independent team build or reproduce the artifact?
- Which later projects reused it?
- How many critical roles have credible successors?
- What is the time and cost to restore the environment?
- Can the group initiate a new problem rather than only service inherited tasks?
- Has a user, sponsor, or product team accepted responsibility for transition?
- Which claim was corrected because the institution’s error-detection process worked?

These questions do not eliminate judgment. They make judgment contestable.

## Five different verdicts

- **Scientific success:** Publications and retrospective recognition provide evidence of new and influential knowledge, with correctness and importance remaining claim-specific.
- **Technical success:** Patents, code, and prototypes provide evidence of disclosed or working mechanisms, not universal system performance.
- **Transition success:** A spinout or deployment requires separate evidence of adoption, operation, and maintenance.
- **Institutional success:** Output records say little by themselves about whether teams, tools, and apprenticeship survived.
- **Public-value success:** Citations, standards, safer systems, commercial use, and trained people may each carry public value that the originating organization captures only partly.

## What the successor must learn

The successor laboratory should make every major review two-sided. The output ledger asks what was produced. The capability balance sheet asks what the institution can now do that it could not do before—and what it can no longer do despite the outputs it retains.

No composite score should hide the answer. A high patent count cannot compensate for an irreproducible system. A maintained team cannot compensate for years without a hard external result. The dimensions should remain visible so governance must confront the tradeoff.

The uncomfortable open question is personal and institutional: which item on my own output lists represents a living capability today, and which is now only a durable record that the capability once existed?
