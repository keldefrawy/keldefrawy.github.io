---
title: Cargo Cult Science at Machine Speed
article_number: 16
article_slug: cargo-cult-science-machine-speed
permalink: /rd-ratchet/cargo-cult-science-machine-speed/
article_status: Draft
published: true
dek: When the surface form of expertise becomes nearly free, institutions must decide which evidence remains expensive enough to trust.
date: 2026-07-24
updated: 2026-07-24
version: "0.1"
version_sequence: 1
revision_summary: Private first draft; not a public version
reading_time: 17
central_claim: >-
  Large language models are epistemic amplifiers: they can scale verification inside institutions rewarded for correction, or scale scientific-looking output inside institutions rewarded for volume and confident novelty.
claim_status: Provisional synthesis; historical essays are used as distinct diagnostic tools, not as predictions of modern AI
hero_image: /assets/images/rd-ratchet/rd-ratchet-hero.webp
hero_alt: Scientific-looking text narrows through provenance, formal validity, empirical adequacy, and adversarial testing into a smaller set of witness-bearing claims.
hero_caption: Conceptual verification funnel; it does not imply that all AI-assisted work or all unformalized science is unreliable.
source_ids:
  - shannon-bandwagon
  - feynman-cargo-cult
  - wigner-unreasonable-effectiveness
  - google-unreasonable-effectiveness-data
  - openai-why-language-models-hallucinate
  - acm-cargo-cult-ai
  - formal-math-2025
  - karim-composed-model-hallucinations
  - nasem-integrity
evidence_chart:
  kicker: Form versus checked substance
  title: A formal benchmark makes the verification gap measurable
  summary: FormalMATH gives models a deterministic proof checker rather than a stylistic judge. The best reported result solved 16.46 percent under the evaluation budget; this does not measure all mathematics or all AI reasoning.
  aria_label: The FormalMATH benchmark defines the full verified problem set as 100 percent, while the strongest evaluated prover solved 16.46 percent under the authors' reported budget.
  source_id: formal-math-2025
  note: Percentages compare benchmark coverage. A formally accepted proof can still encode a statement that does not match the intended informal or empirical claim.
  bars:
    - { label: "Verified benchmark corpus", value: "100% · 5,560 problems", percent: 100, tone: blue }
    - { label: "Best reported prover result", value: "16.46%", percent: 16.46, tone: green }
argument_map:
  kicker: Source-linked argument map
  title: Cheap scientific form raises the value of expensive witnesses
  summary: Shannon, Feynman, and Wigner identify different failure boundaries; modern language models can amplify all three without sharing human intent.
  caption: The map diagnoses processes. It does not infer dishonesty from an error, an AI tool, a fashionable field, or failed replication.
  nodes:
    - role: Historical diagnostic
      title: Shannon warned about label inflation
      text: A successful theory can become a bandwagon as weakly related work borrows its vocabulary and prestige.
      source_ids: [shannon-bandwagon]
    - role: Historical diagnostic
      title: Feynman demanded an intact correction loop
      text: Scientific form is insufficient when researchers omit contrary evidence, alternative explanations, or conditions that could invalidate a claim.
      source_ids: [feynman-cargo-cult]
    - role: Representation boundary
      title: Wigner’s mystery is not a license
      text: Mathematics can fit nature with astonishing power, but formal validity, identification of the physical system, and empirical adequacy remain distinct.
      source_ids: [wigner-unreasonable-effectiveness]
    - role: Bounded conclusion
      title: Require witness-bearing consequential claims
      text: AI-assisted science should attach domain-appropriate proof objects, artifacts, provenance, tests, or independent measurements before fluent form earns settled status.
      source_ids: [formal-math-2025, openai-why-language-models-hallucinate]
objection_ladders:
  - claim: LLMs can industrialize cargo-cult science.
    first_objection: Models can also find assumptions, write tests, formalize proofs, and make replication cheaper; the metaphor selects failures and ignores large epistemic gains.
    first_response: Exactly. AI is an amplifier, not inherently a degrader. The same generation capacity improves rigor when workflows reward checkable evidence and calibrated abstention.
    second_objection: “Cargo cult” can still become a dismissive label for unfamiliar methods or AI-assisted work that has not yet accumulated conventional evidence.
    conclusion: Apply the term only to an identifiable process failure—the absence or disabling of a correction mechanism—not to a person, field, style, or tool.
    source_ids: [feynman-cargo-cult, acm-cargo-cult-ai, formal-math-2025]
  - claim: Witness-bearing claims should be the scarce currency of AI-assisted science.
    first_objection: Exploratory conjectures, conceptual frameworks, and much pure mathematics cannot always carry executable or empirical witnesses at inception.
    first_response: Exploration should remain open and explicitly labeled. The witness requirement strengthens as a claim becomes consequential, settled, or embedded downstream.
    second_objection: Formal or executable witnesses can create false security when assumptions, data, or referents are wrong.
    conclusion: >-
      Treat witnesses as typed and incomplete: formal validity, empirical adequacy, provenance, and adversarial exposure must remain visible rather than collapsing into one badge.
    source_ids: [wigner-unreasonable-effectiveness, formal-math-2025, nasem-integrity]
corrections: []
---

In 2022 I began two short working notes. One asked what Feynman and Shannon had missed about a scientific system connected by the Internet and pushed by hypercompetitive incentives. The other tried to separate mathematical illusions, collective hallucinations, delusions, and fraud. They were intellectual seeds, not evidence. They were fragmentary and sometimes used language too intuitive or accusatory to carry a serious argument.

This article keeps the question and replaces the shortcuts.

Large language models make the surface of expertise cheap: fluent prose, disciplinary vocabulary, citations, equations, code, diagrams, peer-review language, and the ritual structure of an experiment. That can expand human capability. It can also reduce the information carried by scientific form. A polished paper once weakly signaled that someone had paid a substantial production cost. The signal was never reliable. Now its cost approaches zero.

The institutional response cannot be “ban the tool.” It must be to make the evidence state explicit.

## Shannon: the bandwagon becomes a generator

In [“The Bandwagon”](#source-shannon-bandwagon), Claude Shannon warned that information theory’s success had attracted weakly justified applications and relabeling. He called for rigorous research and for the field to retain contact with the problems its formalism could actually solve. <span class="rd-evidence-token" data-evidence="D">D</span>

The warning concerns **label inflation**. A powerful field supplies language, prestige, venues, and funding categories. Researchers have incentives to describe adjacent work through that label even where the technical connection is thin.

An LLM changes the cost structure. It can borrow the vocabulary, citation pattern, and argumentative shape of every fashionable field simultaneously. A human bandwagon still required researchers to learn enough of the style to participate. A model can generate the style on demand.

This does not mean the resulting work is false. It means vocabulary carries less evidence of conceptual contact. Institutions must test the mapping rather than reward the label.

## Feynman: the correction loop, not the costume

In [“Cargo Cult Science”](#source-feynman-cargo-cult), Richard Feynman described inquiry that reproduces the outward apparatus of science while omitting the discipline of reporting facts that could make the claim wrong. His standard was not merely methodological ritual. It was an unusually complete honesty about alternative explanations, prior failures, and conditions under which a result should not be trusted. <span class="rd-evidence-token" data-evidence="D">D</span>

An LLM has no personal integrity to exercise and no private motive to conceal. It produces under an objective supplied by training and evaluation. The responsibility moves outward—to the workflow, reward rule, provenance system, and accountable humans.

If a system rewards plausible answers and penalizes abstention, fluent guessing is adaptive. [Kalai and colleagues argue](#source-openai-why-language-models-hallucinate) that next-word pretraining lacks truth labels for many low-frequency facts and that accuracy-only evaluations can reward guessing rather than calibrated uncertainty. Human publication systems can create an analogous pressure: confident novelty earns credit, while negative results, replication, and “we do not know” struggle for space. <span class="rd-evidence-token" data-evidence="D">D</span>

The machine does not introduce the incentive. It scales the response to it.

## Wigner: valid mathematics still needs a referent

Eugene Wigner’s [“The Unreasonable Effectiveness of Mathematics in the Natural Sciences”](#source-wigner-unreasonable-effectiveness) celebrates a genuine mystery: mathematical structures developed in one setting can later describe physical phenomena with astonishing accuracy. Recruiting the essay into a general warning against mathematics would reverse its meaning. <span class="rd-evidence-token" data-evidence="D">D</span>

Wigner’s mystery nevertheless exposes three separate tests:

1. Is the mathematical derivation valid?
2. Do its objects and assumptions identify the relevant physical system?
3. Do observations support the model within stated conditions?

An LLM can generate mathematical-looking prose that fails the first test. It may generate a valid derivation that fails the second. A beautiful model can pass the first two as a hypothesis and fail the third. Mathematics with no current physical application is not defective; pure mathematics is judged by its own questions. The error is claiming empirical authority from formal elegance alone.

## The data turn was real

[Halevy, Norvig, and Pereira’s “The Unreasonable Effectiveness of Data”](#source-google-unreasonable-effectiveness-data) argued that very large datasets with comparatively simple methods could outperform smaller, more elaborately modeled approaches in language tasks. Modern AI vindicated much of that scaling intuition. <span class="rd-evidence-token" data-evidence="D">D</span>

The success does not imply that predictive effectiveness, causal explanation, mathematical validity, and scientific truth are the same achievement. A system may predict useful text without representing why the claim is true. It may reproduce the consensus accurately where the consensus is wrong. It may combine sources that share one hidden assumption and present their agreement as independence.

The inversion is now complete:

- Shannon worried that people would borrow one successful field’s language; a model can borrow every field’s language.
- Feynman worried that people would reproduce scientific form without its correction discipline; a model reproduces form without possessing intentions.
- Wigner marveled that mathematics could map nature; a model can generate a mathematical map before anyone establishes the territory.

## A taxonomy that prevents accusation by metaphor

Not every epistemic failure is a hallucination, and error is not evidence of fraud.

- A **mistake** is a corrigible false statement or invalid step.
- A **mathematical illusion** predictably exploits intuition or an omitted condition while appearing valid.
- A **model hallucination** is plausible output unsupported by the model’s available evidence.
- **Cargo-cult science** is a process that preserves scientific form while lacking a reliable error-correction mechanism.
- A **bandwagon effect** expands a rewarded label beyond its evidentiary warrant.
- **Mathematical overreach** uses valid formal reasoning with unsupported assumptions or an unestablished mapping to the world.
- **Fraud** is intentional deception and requires evidence of intent.

A retraction can result from mistake, misconduct, or other causes. A failed replication can expose falsehood, boundary conditions, tacit technique, or incompatibility between protocols. AI use establishes none of these by itself.

This taxonomy is a control against personal bashing. Criticism should identify the destructive behavior or missing correction mechanism and let the documentary record carry the story.

## From form to witness

The scarce output in AI-assisted science will not be hypotheses or polished manuscripts. It will be **witness-bearing claims**: claims attached to artifacts that let an independent process check an important part.

Witnesses are domain-specific:

- theorem → proof object plus a checked match between formal and informal statements;
- software claim → executable environment, tests, and failure conditions;
- data claim → immutable data, provenance, transformations, and sensitivity analysis;
- security claim → explicit model, reduction, exploit, or adversarial evaluation;
- empirical claim → protocol, calibrated instruments, complete selection record, and independent measurement.

[FormalMATH](#source-formal-math-2025) demonstrates the difference. The benchmark contains 5,560 formally verified Lean 4 problems, and a deterministic checker can reject an invalid proof regardless of rhetorical quality. The best reported prover solved 16.46 percent under the authors’ budget. Formal success is real evidence; failure to solve is not evidence that the theorem is false.

My own work under review on composed generative models belongs in the weakest evidence class here. [The author-supplied record](#source-karim-composed-model-hallucinations) reports calibration-closure results for several composition operators, suggesting that combining models in natural ways does not automatically escape a hallucination floor. Until the manuscript and proof are independently audited, it is provisional evidence, not an established theorem. Its useful boundary is constructive: a checkable witness changes the evidence state; another confident model opinion may not. <span class="rd-evidence-token" data-evidence="D">D</span>

## A multiplicative diagnostic

One conceptual model is deliberately unforgiving:

> Epistemic value = formal validity × empirical adequacy × provenance × adversarial exposure.

This is not a numerical formula or a universal definition of knowledge. It expresses a bottleneck. Excellence in one dimension cannot compensate for zero in another when the claim requires all four. Beautiful mathematics does not rescue an ungrounded physical identification. Perfect provenance does not rescue invalid reasoning. Repeated agreement does not substitute for adversarial exposure when every evaluator inherits the same corpus.

Exploratory work may legitimately have unknown empirical adequacy or incomplete adversarial exposure. Its label should say so. The standard strengthens when a claim becomes settled, safety-critical, or deeply depended upon.

## The strongest counterargument

Scientific conventions are not empty costumes. Shared form lets experts inspect complex work. AI can make notation consistent, find missing citations, generate counterexamples, write tests, and bring formal tools to researchers who could not otherwise use them. Demanding witnesses for every statement would crush speculative thinking.

Agreed. The design needs two channels.

The **exploratory channel** welcomes conjecture, analogy, simulation, and generated possibilities, with visible uncertainty and provenance. The **evidentiary record** contains claims whose status is tied to domain-appropriate witnesses and correction history. Work can move between channels as evidence changes.

[Peter Denning’s “Cargo Cult AI”](#source-acm-cargo-cult-ai) already applies Feynman’s critique to the distinction between generating convincing forms and conducting falsifiable inquiry. The useful move is not another insult. It is institutional architecture that makes the correction loop observable. <span class="rd-evidence-token" data-evidence="D">D</span>

## Five different verdicts

- **Scientific success:** AI can expand conjecture and expose error; success depends on separating proposal from verified result.
- **Technical success:** Formal checkers, executable artifacts, provenance systems, and automated experiments can make more claims inspectable.
- **Transition success:** Witnesses matter only if journals, funders, standards bodies, and deployed systems update when evidence changes.
- **Institutional success:** The laboratory must reward abstention, replication, correction, and preservation of failed tests—not output volume alone.
- **Public-value success:** Faster generation can democratize expertise or flood the commons; the outcome follows governance and incentive design.

## What the successor must learn

An AI-native laboratory should not measure intelligence by how much scientific form it produces. It should measure how efficiently it turns uncertainty into witness-bearing, adversarially exposed claims—and how gracefully it retracts or repairs them.

That requires named human accountability, audit trails, model and dataset dependency maps, independent checkers, and rewards for discovering that an attractive answer is unsupported.

When the form of expertise becomes nearly free, the open question becomes the institution’s defining choice: what evidence will remain costly enough to trust, and who will be rewarded for producing it?
