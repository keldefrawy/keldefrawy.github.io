---
title: The People Who Choose the Bets Must Have Made Them
article_number: 8
article_slug: research-judgment-practiced-skill
permalink: /rd-ratchet/research-judgment-practiced-skill/
article_status: Draft
published: true
dek: R&D portfolios should not be governed exclusively by people who have never produced original research, carried a technical program across years, or decided when evidence justified changing the plan. But replacing administrative rule with publication aristocracy would repeat the error in a different form.
date: 2026-07-24
updated: 2026-07-24
version: "0.1"
version_sequence: 1
revision_summary: Private working draft; not a public version
reading_time: 18
central_claim: People with firsthand records of original research and multi-year R&D stewardship must hold real authority over technical agendas, continuation decisions, and portfolio construction; experience should be demonstrated across several dimensions rather than reduced to a universal publication or patent threshold.
claim_status: Provisional institutional-design claim; program-management models and reviewer effects are documented, while the proposed experience floor requires comparative testing
hero_image: /assets/images/rd-ratchet/articles/article-08-research-judgment.webp
hero_alt: Practiced researchers trace evidence from notebooks, failed parts, prototypes, and budget blocks across a decision table toward several long-horizon R&D paths.
hero_caption: Conceptual illustration. The governance proposal is a design hypothesis, not an evaluation of any named individual or agency.
source_ids:
  - darpa-pm-model
  - nasem-arpa-e-2017
  - gallo-reviewer-expertise
  - nber-peer-review-risk
  - leiden-manifesto
  - uspto-patent-examination
evidence_chart:
  kicker: What one expertise study observed
  title: Expertise affected evaluation inside a substantial—but bounded—review dataset
  summary: The study shows that expertise enters funding judgment; it does not show that experts always choose better portfolios or justify unilateral control.
  aria_label: The biomedical review study analyzed 1450 evaluations of 725 applications by 1044 reviewers. Bar lengths are scaled to 1450 evaluations.
  source_id: gallo-reviewer-expertise
  note: Counts describe the dataset, not effect sizes or national outcomes. Reviewer seniority and professional relationships also affected evaluation.
  bars:
    - { label: Evaluations, value: "1,450", percent: 100, tone: blue }
    - { label: Reviewers, value: "1,044", percent: 72, tone: green }
    - { label: Applications, value: "725", percent: 50, tone: amber }
argument_map:
  kicker: Source-linked argument map
  title: Practiced judgment should enter the decision—but never become an expert veto
  summary: The design joins technical interpretation to budget authority while preserving independent fiduciary, legal, safety, and public-accountability powers.
  caption: The experience dossier is deliberately multidimensional; publications and patents are evidence, not a scalar gate.
  nodes:
    - role: Decision problem
      title: The same missed milestone can mean different things
      text: A variance may reflect learning, a false assumption, weak execution, or an absent transition path; the schedule alone cannot discriminate.
      source_ids: [darpa-pm-model]
    - role: Information claim
      title: Practice supplies a fallible additional signal
      text: Original research and multi-year stewardship can reveal structure not fully transmitted by proposals, dashboards, or scores.
      source_ids: [gallo-reviewer-expertise, nber-peer-review-risk]
    - role: Governance design
      title: Couple technical and budget authority temporarily
      text: Empower qualified program leaders to shape portfolios and revise milestones, with fixed terms and explicit accountability.
      source_ids: [darpa-pm-model, nasem-arpa-e-2017]
    - role: Capture control
      title: Make authority plural, bounded, and corrigible
      text: Require conflicts rules, protected dissent, published overrides, outcome postmortems, and no universal résumé score.
      source_ids: [leiden-manifesto]
objection_ladders:
  - claim: Consequential R&D portfolios need decision-makers who have personally done serious research and stewarded programs through time.
    first_objection: This is credentialism. Excellent executives and public servants can learn enough to manage research without being accomplished researchers themselves.
    first_response: The proposal does not exclude them. It requires practiced technical judgment to hold binding authority at the decisions where ambiguous evidence changes a technical plan.
    second_objection: Accomplished researchers bring paradigm loyalty, prestige bias, conflicts, and overconfidence. Giving them authority can entrench an expert aristocracy.
    conclusion: Use dual accountability, fixed terms, plural outside expertise, recusal, protected dissent, and postmortems. Practitioners must be present and empowered, but no practitioner receives unilateral rule.
    source_ids: [darpa-pm-model, nasem-arpa-e-2017, gallo-reviewer-expertise]
  - claim: An experience floor is superior to a universal threshold of fifty publications or patents.
    first_objection: A numerical threshold is transparent and resistant to favoritism; a qualitative dossier lets insiders choose their friends.
    first_response: Counts differ by field, conflate patent examination with scholarly peer review, reward slicing and honorary credit, and say little about stewardship, transition, or correction.
    second_objection: A multidimensional dossier is still subjective and can be gamed through heroic narratives about leadership, failure, or impact.
    conclusion: Publish evidence separately across discovery, stewardship, transition, and correction; use external plural assessors and do not collapse the dimensions into one score. The dossier is auditable judgment, not metric-free discretion.
    source_ids: [leiden-manifesto, uspto-patent-examination]
corrections: []
---

The most consequential sentence in a research review is often not “fund it” or “stop it.” It is: **this deviation from the plan is evidence of learning**.

That judgment cannot be recovered from a schedule alone. The same missed milestone can mean that a team discovered a deeper formulation, that an instrument exposed a false assumption, that integration revealed an unmodeled constraint, or that execution is simply weak. A spreadsheet can record the variance. It cannot determine which world produced it.

Yet many R&D systems progressively separate the people authorized to interpret the variance from the people who have experienced one. Researchers propose. Reviewers score. Program staff reconcile. Budget officials release funds. Procurement officers judge compliance. Senior leaders choose a portfolio from briefing decks. Each function is legitimate. The failure appears when nobody with practiced research judgment retains binding authority at the point where technical uncertainty is converted into an institutional decision.

The proposition of this article is deliberately controversial:

> The people who set technical agendas, approve major R&D bets, and decide whether surprising work should continue should include people who have themselves produced serious original research and managed multi-year technical programs with real budgets, teams, failures, and transitions.

“Include” is doing important work. A contracts officer need not be a prize-winning physicist. A chief financial officer should not be selected by citation count. Public money still requires procurement, legal, security, safety, and democratic oversight. But technical judgment must have real authority, not an advisory seat whose recommendation can be overridden by administrators without an equally accountable technical finding.

## Research judgment is a practiced skill

Research management is often described as prediction: choose the proposals most likely to succeed. That is too shallow. The harder work begins after selection.

A serious R&D decision-maker must repeatedly distinguish:

- a risky idea from an incoherent one;
- an informative failure from careless execution;
- necessary plan revision from unbounded drift;
- an elegant result from a useful capability;
- a difficult transition from an absent transition path;
- healthy dissent from a team that can no longer converge;
- a field's consensus from a field's synchronized blind spot.

These are not mystical intuitions. They are compressed inferences learned through exposure to experiments, proofs, systems, reviews, customers, program shocks, and one's own wrong predictions. They remain fallible. But a person who has never lived through those feedback loops is missing observations that no reporting template can fully transmit.

An illustrative model makes the limitation explicit. Let a portfolio decision depend on latent technical value *V*. Everyone can observe documented evidence *X*: the proposal, milestones, costs, papers, demonstrations, and risk register. A practiced researcher may also extract a tacit signal *Z* from the structure of the failure, the credibility of the team's explanation, and the relation between the new evidence and the original hypothesis. If *Z* contains information not already in *X*, excluding it lowers decision quality. If *Z* is stale, biased, or self-interested, including it can make decisions worse.

This is not an estimated model and it does not prove that experts are right. It identifies the governance problem: obtain the information in practiced judgment while controlling the capture, prestige, and overconfidence that can travel with it.

## The strongest operating models couple technical and budget authority

[DARPA describes program managers](#source-darpa-pm-model) as fixed-tenure leaders who define problems, create programs, set milestones, select performers, and actively guide portfolios. The model does not treat technical insight as a comment supplied to a separate chain of command. It gives a technically credible individual temporary authority and then makes that individual accountable for the program.

The distinction is important. Expertise without authority produces ceremonial advice. Authority without expertise produces procedural confidence about objects the authority cannot adequately interpret.

[The National Academies' assessment of ARPA-E](#source-nasem-arpa-e-2017) found that program directors exercised wide latitude in constructing programs and actively managing awards, including revising milestones as technical evidence developed. The report recommended continuing to recruit exceptional program directors and preserving their empowerment. This is not proof that every ARPA-E decision was correct, nor that its model transfers unchanged to every field. Energy technologies can take decades, and the assessment itself emphasized the limits of early outcome data. It does show that one serious institutional design treats technically accomplished, actively engaged program leadership as part of the production function rather than overhead around it. <span class="rd-evidence-token" data-evidence="D">D</span>

There is also evidence that expertise changes evaluation behavior. [Gallo, Sullivan, and Glisson](#source-gallo-reviewer-expertise) analyzed 1,450 evaluations of 725 biomedical research applications by 1,044 reviewers. Reviewer expertise was associated with scoring differences, but so were seniority and professional relationships. That is evidence for both sides of the argument: expertise affects judgment, and expert systems can carry network bias. The study did not observe a randomized assignment of all relevant characteristics or establish which proposals ultimately generated the greatest public value.

[Carson, Graff Zivin, and Shrader](#source-nber-peer-review-risk) used a discrete-choice experiment with active biomedical researchers. Participants were more receptive than standard score-averaging rules to proposals that produced reviewer disagreement, and respondents with greater domain expertise were more enthusiastic about that dissensus. This suggests that an expert may sometimes interpret disagreement as information about high-variance novelty rather than merely noise. But stated choices in an experiment are not long-run program outcomes. The result supports a mechanism; it does not license an expert veto.

## Why “50-plus publications and patents” is the wrong rule—and points toward the right one

A record of fifty or more serious publications and granted patents can be a strong signal in some technical fields. It shows repeated exposure to external scrutiny and a career long enough for multiple ideas to survive contact with reviewers, examiners, collaborators, and competitors. It is reasonable to ask why a person with no comparable record should unilaterally choose a nation's research bets.

But a universal threshold would be a mistake for five reasons.

First, publications and patents are not the same object. Papers may be peer reviewed for scholarly contribution. [Patent applications are examined by the U.S. Patent and Trademark Office](#source-uspto-patent-examination) against legal requirements such as eligibility, novelty, usefulness, and non-obviousness. A patent is not a “peer-reviewed publication,” and neither artifact proves that the underlying capability worked at scale.

Second, output rates differ radically across mathematics, semiconductor process development, biomedical science, classified work, software systems, and instrumentation. A fixed count would reward field customs rather than comparable judgment.

Third, counts invite slicing, honorary authorship, portfolio inflation, and patenting for defensive reasons. Once fifty becomes the gate, institutions will manufacture fifty.

Fourth, a prolific researcher may never have managed a team, stopped a failing project, reconciled a budget, transferred a result, or protected a dissenting junior colleague.

Fifth, the best emerging-field leader may be too early in a career to have accumulated the count. A seniority gate can exclude precisely the people who understand a discontinuity.

[The Leiden Manifesto](#source-leiden-manifesto) states the relevant discipline: quantitative evaluation should support qualitative expert judgment, account for field differences, and avoid substituting indicators for the object being evaluated. The right rule is therefore an **experience floor, not a metric floor**.

## A four-part experience dossier

Before someone receives substantial authority over a technical portfolio, the appointing body should examine evidence in four dimensions.

### 1. Discovery

Has the candidate produced original work that survived informed challenge? Evidence can include peer-reviewed papers, granted patents, influential technical reports, open-source systems, datasets, instruments, standards, or mission results. The question is not whether the total exceeds one magic number. It is whether the record shows repeated responsibility for ideas whose truth or usefulness could have failed.

### 2. Stewardship

Has the candidate led a multi-year program with a material budget, multiple specialties, external dependencies, and consequences for other people's careers? Did the person revise milestones when evidence changed, terminate weak paths, and preserve promising ones through a funding shock? Managing a laboratory's expense line is not enough; neither is being principal investigator on fifty disconnected small awards.

### 3. Transition

Has any result crossed into another operating context—a user, mission, product, clinical setting, fabrication flow, standard, or maintained public tool? Transition is not required for every basic researcher. It is required somewhere in a portfolio's leadership because scientific value, technical operation, adoption, and public value are different tests.

### 4. Correction

Can the candidate identify an important decision that proved wrong, explain how the error became visible, and show what changed afterward? A record containing only victories is not evidence of superior judgment. It may be evidence that failure was hidden or never risked. The correction record is the most difficult to game because it asks whether the candidate can preserve truth when reputation points the other way.

The dossier should include quantities, but it should not add them into a single score. Fifty papers cannot compensate for no stewardship. A billion-dollar budget cannot compensate for no technical work. A successful product cannot compensate for suppressing disconfirming evidence.

## The authority must be attached to particular decisions

“Scientist on the board” is too vague. Governance should specify which decisions cannot be made without accountable technical concurrence or a published override rationale.

At minimum, practiced researchers should hold binding roles in:

1. defining the technical problem and acceptable evidence;
2. selecting the portfolio rather than merely ranking proposals;
3. interpreting milestone deviations;
4. continuing, redirecting, or terminating major efforts;
5. evaluating whether the program retained reusable capability;
6. choosing which negative results and technical artifacts must be preserved.

Financial, legal, safety, and mission authorities should retain their own independent powers. The design is not “scientists rule.” It is **dual accountability**: epistemic authority and fiduciary authority meet before a technical decision becomes an institutional fact.

One practical rule would be that every major technical portfolio must have at least one decision-maker who satisfies both the discovery and stewardship dimensions, plus other leaders who collectively cover transition, operations, safety, finance, and public purpose. A non-practitioner may override the technical judgment for law, safety, budget, or mission reasons, but the override and its reason should be recorded. Silent displacement of technical judgment by schedule pressure should be impossible.

## Expert rule can fail spectacularly

The strongest objection is not that administrators deserve equal prestige. It is that accomplished researchers can be terrible stewards.

Experts protect their paradigms. Famous scientists can mistake status for general intelligence. Program leaders can fund intellectual descendants, prefer familiar methods, dismiss implementation work, or continue a beautiful failure because it is theirs. Tacit judgment is difficult to audit precisely because it cannot be fully written down. The more authority an institution grants it, the more carefully the institution must look for capture.

The controls should be structural:

- **Fixed terms:** technical authority should expire and be renewed only after review, as in time-bounded program-manager models.
- **Conflict disclosure and recusal:** collaborators, competitors, investments, patents, and institutional loyalties should be explicit.
- **Plural expertise:** at least one relevant practitioner should come from outside the dominant network or method.
- **Protected dissent:** a minority technical opinion should enter the record before irreversible portfolio decisions.
- **Current contact:** because technical authority has a half-life, senior leaders should be paired with active practitioners and periodically demonstrate current field understanding.
- **Decision postmortems:** institutions should revisit forecasts, milestone interpretations, terminations, and transitions after sufficient time has passed.
- **No scalar résumé score:** appointment panels should publish the evidence across the four dimensions rather than an opaque ranking.

These controls are not decorations. Without them, the experience floor becomes an incumbency moat.

## What would disprove the proposal?

The claim should be tested, not admired. Compare portfolios over a sufficiently long window—not just annual output—on at least five outcomes: scientific importance, technical validation, transition, capability retained, and public value. Record the leadership team's experience before observing outcomes. Control as far as possible for field, budget, risk, and sponsor.

The proposal would weaken if portfolios led by practitioners do not preserve more option value, adapt more intelligently to evidence, or produce better long-run outcomes than otherwise comparable portfolios. It would also weaken if any advantage disappears after controlling for resources and network access, or if expert capture costs exceed the information benefit.

The design could also be wrong at different scales. Technical experience may matter greatly for program formulation and milestone interpretation but less for allocating mature infrastructure or enforcing compliance. The evidence should locate the boundary rather than force one rule across every decision.

## The deeper failure is the separation of knowing from deciding

Modern R&D governance often treats technical work as one input among many and management as a transferable abstraction above it. For stable production systems, much of that abstraction is valuable. For research, the object being managed changes its own description as knowledge arrives.

The decisive capability is therefore not confidence, charisma, or even a record of picking winners. It is the learned ability to recognize when reality has invalidated the plan without confusing every missed commitment with discovery.

That ability comes from making research bets, being wrong in public, carrying people and budgets across years, and seeing what survives transition. Counts can help establish that the experience is real. They cannot substitute for it.

The institutional rule should be simple enough to remember:

> No one should hold unilateral authority over a consequential technical portfolio if no one at the decision table has personally done serious research and carried a serious R&D program through time.

That is not a demand for a republic of résumés. It is a demand that the people interpreting uncertainty have encountered it firsthand—and that their authority remain bounded, plural, and corrigible.
