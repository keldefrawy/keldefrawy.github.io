---
title: When AI Audits What Science Takes for Granted
article_number: 15
article_slug: ai-audits-scientific-record
permalink: /rd-ratchet/ai-audits-scientific-record/
article_status: Draft
published: true
dek: AI’s first great contribution to science may be subtraction—exposing how much published knowledge was trusted at a level its evidence never earned.
date: 2026-07-24
updated: 2026-07-25
version: "0.3"
version_sequence: 3
revision_summary: Added consensus definitions, a typed evidence-state machine, and a risk-based audit scheduler that does not pretend to estimate a universal error rate.
reading_time: 20
central_claim: AI-assisted formalization, reanalysis, and replication can expose epistemic debt, but only when model output crosses into proof checking, executable artifacts, complete-data audit, or independent measurement.
claim_status: Provisional; the documented cases establish verification gaps and tool limits, not a population-wide scientific error rate
hero_image: /assets/images/rd-ratchet/articles/article-15-ai-audits-science.webp
hero_alt: Papers, code, data, and theorem diagrams move through linked human-and-AI inspection stations before emerging as supported, corrected, or still-uncertain claims.
hero_caption: Conceptual verification pipeline; it does not assign an error probability to science or mathematics.
source_ids:
  - lamport-errors-in-proofs
  - greiffenhagen-math-peer-review
  - nature-majorana-retraction-2021
  - nature-majorana-microsoft-report-2021
  - nature-quantum-reproducibility-2021
  - formal-math-2025
  - liquid-tensor-formalization
  - nasem-integrity
  - nasem-reproducibility-2019
evidence_chart:
  kicker: A bounded mathematics sample
  title: Lamport’s often-repeated error statistic came from one non-random reviewer record
  summary: The sample shows that serious errors can pass publication and appear in reviews. Lamport explicitly says it cannot estimate the error rate of mathematics as a whole.
  aria_label: Among 84 papers reviewed by one unusually careful Mathematical Reviews reviewer, 28 reviews described an incorrect statement in a proof or result, and 11 described an incorrect result.
  source_id: lamport-errors-in-proofs
  note: Non-random, field-specific, subjective classification. “28” includes proof or result errors; it does not mean that one third of all mathematical theorems are false.
  bars:
    - { label: "Papers in the reviewer record", value: "84", percent: 100, tone: blue }
    - { label: "Proof-or-result error noted", value: "28", percent: 33.3, tone: orange }
    - { label: "Incorrect result noted", value: "11", percent: 13.1, tone: purple }
argument_map:
  kicker: Source-linked argument map
  title: AI contributes only when plausible criticism becomes a checkable state change
  summary: Publication and model output both provide signals; neither is a certificate without a domain-appropriate witness.
  caption: The conclusion supports risk-based auditing, not universal rechecking or public error scores detached from context.
  nodes:
    - role: Documented observation
      title: Publication is not certification
      text: Mathematical peer review raises confidence but difficult results acquire credibility through later scrutiny, use, correction, and time.
      source_ids: [greiffenhagen-math-peer-review, lamport-errors-in-proofs]
    - role: Documented observation
      title: Consequential experimental claims can be retracted
      text: Nature retracted the 2018 Majorana-conductance paper; commentary and reporting document concern while leaving other disputed claims distinct.
      source_ids: [nature-majorana-retraction-2021, nature-majorana-microsoft-report-2021, nature-quantum-reproducibility-2021]
    - role: Technical boundary
      title: A model’s accusation is not verification
      text: AI becomes useful when it helps produce a formal proof object, reproducible computation, provenance audit, sensitivity analysis, or independent experiment.
      source_ids: [formal-math-2025, liquid-tensor-formalization]
    - role: Bounded conclusion
      title: Maintain an epistemic balance sheet
      text: Institutions should record what depends on each consequential claim, what has been checked, what remains disputed, and what must be reevaluated after correction.
      source_ids: [nasem-integrity, formal-math-2025]
objection_ladders:
  - claim: AI may reveal a large stock of epistemic debt in published science.
    first_objection: AI systems hallucinate, misunderstand notation, and can manufacture false accusations faster than researchers can answer them.
    first_response: Correct. Model criticism should change no scientific status until it produces evidence checkable by a trusted formal, computational, provenance, or experimental process.
    second_objection: Even deterministic checking can formalize the wrong theorem, rerun flawed code, or reproduce a hidden assumption shared with the original work.
    conclusion: Verification records must bind the formal statement to the human claim, expose assumptions and data transformations, and seek independent evidence where common-mode failure is plausible.
    source_ids: [formal-math-2025, liquid-tensor-formalization, nature-quantum-reproducibility-2021]
  - claim: Consequential claims should be audited by downstream dependence and risk.
    first_objection: Verification mandates will divert experts from discovery, punish difficult fields, and create incentives to work only on easily checkable problems.
    first_response: A universal mandate would be damaging. Triage should prioritize high-dependence, safety-critical, capital-intensive, or weak-provenance claims.
    second_objection: Public risk labels can stigmatize honest uncertainty and make researchers hide corrections to protect reputations.
    conclusion: Reward correction and artifact repair, separate uncertainty from misconduct, preserve version history, and evaluate institutions partly on the quality of their self-correction.
    source_ids: [nasem-integrity, greiffenhagen-math-peer-review]
corrections: []
---

The most disruptive early effect of AI on science may not be a flood of discoveries. It may be a subtraction.

Models can already search literature, translate notation, generate tests, formalize parts of proofs, reconstruct data pipelines, and compare claims across thousands of papers. As these tools improve, they may expose dependencies that were never checked as deeply as later users assumed. The trusted corpus could contract before it expands.

That possibility needs a name: **epistemic debt**. It is the gap between the confidence downstream work places in a claim and the verification the claim has actually received.

It is not an estimated error count. A claim can carry high epistemic debt and still be true; the debt is the unsupported confidence and downstream dependence that must be retired by better evidence.

The phrase does not imply misconduct. Debt can accumulate through ordinary specialization, expensive replication, missing artifacts, compressed peer review, or reasonable trust in prior work. The danger is that publication status is silently upgraded into certainty as citations accumulate.

## The number we should not claim

There is a tempting statistic that roughly one third of mathematics papers contain wrong theorems. The available evidence does not support that sentence.

[Leslie Lamport examined a record described by one unusually careful algebra reviewer](#source-lamport-errors-in-proofs). Among 84 papers, 28 reviews reported an incorrect statement in a proof or result, while 11 reported an incorrect result. Lamport explicitly warns that the sample was non-random, field-specific, and subjectively classified. The 28 category includes proof errors that may be repairable; it is not “false theorem.” <span class="rd-evidence-token" data-evidence="D">D</span>

The result is important precisely when bounded correctly. It demonstrates that nontrivial errors can pass publication and that a careful reader can find them. It does not estimate the error rate of all mathematical papers, all fields, or all theorems.

[Christian Greiffenhagen’s study of mathematical peer review](#source-greiffenhagen-math-peer-review), based on 95 interviews and more than 100 referee reports, supplies the institutional explanation. Refereeing adds confidence but is not a proof certificate. Difficult results become trusted through a longer social process of use, scrutiny, correction, and time. <span class="rd-evidence-token" data-evidence="D">D</span>

Science routinely collapses at least five epistemic states into the word *known*:

1. published after editorial and peer review;
2. checked closely by an appropriate specialist;
3. formally verified or computationally reproduced against available artifacts;
4. independently replicated with a genuinely independent path; and
5. robust across alternative assumptions, measurements, and models.

The states are not a universal ladder. A pure theorem does not require physical replication; an experimental claim cannot be settled by syntactic proof checking. The point is to name what kind of confidence exists.

The vocabulary itself needs discipline. [The National Academies defines *reproducibility* as obtaining consistent computational results from the same data, code, methods, and conditions, and *replicability* as obtaining consistent results in a new study addressing the same question with new data](#source-nasem-reproducibility-2019). Other fields sometimes reverse or blend these terms. This series uses the National Academies convention so that an artifact rerun is not described as an independent experiment. The report also cautions that replication is not always a binary pass/fail event. Disagreement can expose a boundary condition rather than prove misconduct or render an entire field false. <span class="rd-evidence-token" data-evidence="D">D</span>

## A retraction is not a field verdict

The 2018 *Nature* paper “Quantized Majorana Conductance” offers a documented experimental case. [Nature’s 2021 retraction note](#source-nature-majorana-retraction-2021) records the retraction, links underlying data, and identifies a Microsoft Station Q Delft affiliation for one author. [Nature’s contemporaneous report](#source-nature-majorana-microsoft-report-2021) described the work as led by researchers at a Microsoft laboratory in the Netherlands and reported the authors’ concern about insufficient rigor in the original analysis. <span class="rd-evidence-token" data-evidence="D">D</span>

This record supports a specific statement: one prominent paper was retracted. It does not support an accusation against every author, Microsoft Research, quantum computing, or Majorana research as a whole.

[Sergey Frolov’s *Nature* commentary](#source-nature-quantum-reproducibility-2021) discusses failed confirmations, alternative explanations, selective-data concerns, and papers in *Science*. It is an expert argument, not a publisher adjudication of every cited claim. Three categories must remain separate:

- **retracted result:** a publisher has formally withdrawn the paper;
- **failed or contrary replication:** another effort did not reproduce the claim under its conditions; and
- **disputed interpretation:** experts disagree about what the evidence establishes.

Conflating them creates scandal, not epistemology.

## AI’s accusation changes nothing by itself

A language model can produce a fluent critique of a correct paper and a fluent defense of an incorrect one. Its output is another claim. AI becomes epistemically useful when it lowers the cost of producing a **checkable witness**.

For a theorem, the witness may be a Lean or Coq proof whose formal statement has been matched carefully to the human theorem. For computation, it may be executable code bound to immutable data, dependencies, parameters, and expected outputs. For an empirical paper, it may be provenance-preserving extraction, full sensitivity analysis, or an independent protocol executed against new measurements.

The distinction is severe:

> Agreement among models is additional opinion unless the models produce evidence that an independent process can check.

Shared training data and benchmarks create common-mode failure. Ten agents repeating the same hidden assumption are not ten replications.

## What formalization proves—and what it does not

[The Liquid Tensor Experiment](#source-liquid-tensor-formalization) shows that frontier mathematics can be formalized in Lean. It also shows the cost: sustained collaboration among domain mathematicians and formalization experts. The resulting checker establishes that a formal statement follows from formal premises inside the system. It does not automatically establish that the formal statement perfectly captures every intended informal claim.

[FormalMATH](#source-formal-math-2025) documents both progress and present limits. The authors assembled 5,560 Lean 4 problems with a human-in-the-loop validation process. Under the reported budget, their strongest evaluated prover solved 16.46 percent. The benchmark is not “all mathematics,” and later systems may improve quickly. The result shows that formal AI work can be measured against a deterministic checker—and that current capability is far from automatic verification of the literature. <span class="rd-evidence-token" data-evidence="D">D</span>

Its role in this article is institutional: it makes **audit capacity** measurable by showing what portion of a bounded formal corpus a system can solve under stated conditions. Article 16 uses the same record for a different point—the separation between scientific-looking form and a proof object accepted by an independent checker.

Formalization may also reveal that an informal proof omitted a condition while the main theorem remains repairable. That is a success, not a scandal. A good audit system distinguishes repair from collapse.

## The epistemic balance sheet

A paper-by-paper correctness score would be crude and harmful. A better institution maintains a dependency-aware balance sheet for consequential claims:

- the exact claim and version;
- downstream papers, systems, standards, or investments that depend on it;
- available data, code, proof objects, and provenance;
- specialist checks, computational reproductions, and independent replications;
- known disputes, boundary conditions, and corrections;
- the cost and priority of further verification;
- the actions required if the claim changes status.

Audit priority should follow consequence, not prestige. A modest result embedded in medical software, cryptographic infrastructure, or a billion-dollar experimental roadmap may deserve more checking than a famous but isolated conjecture.

This is where institutional incentives become decisive. Verification is a public good. A verifier may spend months producing no new headline result, and a successful audit may conclude that the original work was sound. Current career systems often reward the original claim more than the confidence infrastructure around it.

[The National Academies’ integrity report](#source-nasem-integrity) treats research quality as a system property shaped by stewardship, publication pressure, and institutional practice. AI can reduce verification cost. It cannot create the career reward, artifact custody, or willingness to publish negative evidence. <span class="rd-evidence-token" data-evidence="D">D</span>

## A typed state machine, not a truth score

A consequential claim should move through explicit, reversible evidence states. The states are typed because different domains demand different witnesses:

| State | Meaning | Permitted transition |
|---|---|---|
| **Proposed** | A conjecture, interpretation, or reported observation with visible provenance | To *published* after field-appropriate review; to *withdrawn* by its authors |
| **Published** | Passed a venue's process; not certified as correct | To *reproduced*, *replicated*, *bounded*, *disputed*, *corrected*, or *retracted* as evidence arrives |
| **Reproduced** | Original computation reruns from bound artifacts under stated conditions | Does not by itself become *replicated* or empirically valid |
| **Replicated** | An independent study with new data obtains a result consistent within predeclared tolerances | May be narrowed if later boundary conditions appear |
| **Formally checked** | A formal statement follows from explicit premises in a trusted checker | Requires a separate alignment record connecting formal and intended claims |
| **Bounded or disputed** | The claim may hold only under narrower conditions, or credible evidence conflicts | Downstream users must see the boundary or dispute before relying on it |
| **Corrected or retracted** | The version changed materially or the publication was withdrawn | Dependencies are notified; the old state remains auditable rather than erased |

No state is “true forever.” Even replication establishes support under a domain, protocol, and time. The useful institutional change is that a citation no longer silently promotes *published* into *settled*.

Audit scheduling can then be explicit without fabricating a probability that a paper is wrong. A provisional priority rule is

<p class="rd-equation"><strong>Audit priority ∝ consequence × downstream dependence × unresolved uncertainty ÷ expected audit cost.</strong></p>

This is a queueing heuristic, not an epistemic equation. Each term should be reported separately and reviewed by domain experts. It deliberately prioritizes a modest claim embedded in safety, standards, or expensive infrastructure over a glamorous isolated result. It also exposes the objection: easy-to-audit fields could crowd out difficult ones. The correction is to reserve portfolios by evidence type and to compare priority only within reasonably similar audit classes.

The audit result must propagate. A correction that updates one paper but leaves dependent code, benchmarks, procurement requirements, and model-training corpora unchanged has repaired the record without repairing the system. The essential output is therefore not an error leaderboard. It is a versioned dependency graph with a named owner for downstream remediation.

## The strongest counterargument

Science is already self-correcting. Most errors are repairable, irrelevant to later work, or discovered through ordinary use. A massive audit apparatus could freeze exploration, encourage adversarial gotcha work, and spend scarce experts on old claims instead of new ones.

That objection rules out universal verification. It supports risk-based triage.

Exploratory work should be allowed to be exploratory and labeled accordingly. Settled or high-consequence claims should earn their status through stronger witnesses. Institutions should reward informative failed replications and corrections so researchers do not have to choose between honesty and survival.

The audit system itself must be audited. Models can optimize for apparent errors. Formalizers can translate the wrong statement. Replicators can lack tacit technique. Public scores can punish the fields that report uncertainty most honestly. Every finding needs versioning, appeal, and a distinction between error and intent.

## What would falsify the case for a standing audit institution?

The proposal should be weakened if ordinary scientific use already corrects high-consequence claims before meaningful downstream harm, or if a matched pilot finds that a standing audit group produces no better correction speed, dependency notification, or avoided rework than field-led review at comparable cost. It should be rejected if the group predictably suppresses exploratory work, centralizes common-mode error, or rewards headline accusations more than checkable witnesses despite the proposed appeal and audit controls. The burden is not to prove that some papers are wrong. It is to show that institutionalized verification improves consequential decisions net of delay, expert time, chilling effects, and its own errors.

## Five different verdicts

- **Scientific success:** An audit improves knowledge even when it subtracts a claim or narrows a theorem.
- **Technical success:** Proof assistants, reproducible environments, and provenance tools create checkable objects, with domain interpretation still required.
- **Transition success:** Corrections succeed only when downstream papers, standards, software, and investments update.
- **Institutional success:** A laboratory succeeds when it preserves the original record, rewards correction, and makes dependencies visible rather than erasing embarrassment.
- **Public-value success:** Verification can prevent duplicated error and unsafe deployment, but indiscriminate auditing can consume more value than it creates.

## What the successor must learn

An AI-native laboratory should establish an epistemic-audit group with prestige and independence comparable to discovery teams. Its job is not to declare papers wrong. It is to make consequential claims cheaper to check, track dependencies, preserve correction history, and produce witnesses others can inspect.

The first visible result may look like scientific regression because the trusted corpus shrinks. That is the wrong accounting. Removing unsupported certainty is capability formation.

The open question is the one our current indexes cannot answer: how much of what we call knowledge is verified, how much is merely unchallenged, and who is institutionally rewarded to discover the difference?
