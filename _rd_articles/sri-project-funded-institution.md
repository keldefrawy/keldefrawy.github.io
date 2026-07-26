---
title: SRI and the Project-Funded Institution
article_number: 5
article_slug: sri-project-funded-institution
permalink: /rd-ratchet/sri-project-funded-institution/
article_status: Draft
published: true
dek: A nonprofit institute can preserve intellectual communities across sponsors, yet finite projects and chargeability can quietly become its real constitution.
date: 2026-07-24
updated: 2026-07-25
version: "0.3"
version_sequence: 3
revision_summary: Added a portfolio-commons model, three distinct uses of internal funding, a vector retention account, and explicit institutional falsifiers.
reading_time: 20
central_claim: An independent research institute creates continuity when projects accumulate into shared teams, tools, and judgment; it becomes only a contracting shell when every capability must justify itself anew at each funding cliff.
claim_status: Provisional; public project records establish programs and roles, while chargeability effects are bounded firsthand analysis requiring broader corroboration
hero_image: /assets/images/rd-ratchet/articles/article-05-sri-project-funded.webp
hero_alt: A California research campus connects early networked computers, a wooden computer mouse, a mobile robot, an AI search tree, a voice waveform, and field experiments.
hero_caption: Conceptual illustration; it does not represent SRI financial data or confidential program structure.
source_ids:
  - sri-history
  - sri-karim-project-record
  - darpa-race
  - darpa-sieve
  - darpa-dprive
  - sri-confidencial-announcement-2022
  - xerox-parc-sri
evidence_chart:
  kicker: Overlapping program clocks
  title: Three public SRI projects crossed different portions of the author’s tenure
  summary: Public institutional records show multi-year projects that overlapped and extended beyond employment boundaries. Duration is not evidence of retained capability or successful transition.
  aria_label: PRISM under RACE is publicly listed from 2019 through 2023, EMPHASIZE under SIEVE from 2020 through 2024, and FARSIDE under DPRIVE from 2021 through 2024.
  source_id: sri-karim-project-record
  note: Inclusive calendar spans shown as four, four, and three elapsed years respectively; program records and role dates may use different start or completion conventions.
  bars:
    - { label: "PRISM / RACE", value: "2019–2023", percent: 100, tone: blue }
    - { label: "EMPHASIZE / SIEVE", value: "2020–2024", percent: 100, tone: green }
    - { label: "FARSIDE / DPRIVE", value: "2021–2024", percent: 75, tone: orange }
argument_map:
  kicker: Source-linked argument map
  title: Projects create institutional value only when their state crosses the boundary
  summary: The public record establishes ambitious programs and outputs. Whether they accumulated into durable SRI capability is the question, not a documented conclusion.
  caption: The author worked full-time at SRI through the 2021 Confidencial.io spinout, remained part-time through early 2023 to finish DARPA programs, and retained an SRI office and badge through 2026; PARC’s arrival is bounded firsthand observation while legal facts remain documented.
  nodes:
    - role: Documented observation
      title: SRI hosted overlapping mission programs
      text: Public records connect the author’s SRI work to RACE, SIEVE, DPRIVE, and an Air Force quantum effort.
      source_ids: [sri-karim-project-record, darpa-race, darpa-sieve, darpa-dprive]
    - role: Bounded firsthand observation
      title: Seed work and proposals connected the arcs
      text: During 2017–early 2023, first full-time and then part-time after the 2021 Confidencial.io spinout, internal development, proposal work, collaboration, and project execution formed a continuous local experience despite separate sponsor clocks.
      source_ids: [sri-karim-project-record]
    - role: Proposed mechanism
      title: Chargeability can select the portfolio
      text: When staff survival depends on active tasks, solicitation fit and renewal timing can displace institution-level investment even without an explicit policy to do so.
      source_ids: [darpa-race, darpa-sieve, darpa-dprive]
    - role: Bounded conclusion
      title: Track retained state after each project
      text: A nonprofit institute should account for reused people, code, proof assets, testbeds, and transition links—not only awards and deliverables.
      source_ids: [sri-history, sri-confidencial-announcement-2022]
objection_ladders:
  - claim: Chargeability pressure can make proposal incentives the operating system of a nonprofit research institute.
    first_objection: Without internal financial data, this is an anecdote about one employee’s experience, not evidence about SRI as a whole.
    first_response: Correct. The claim should be framed as a mechanism observed locally and tested through interviews, funding records, turnover, internal investment, and cross-project reuse.
    second_objection: Researchers may blame chargeability when the real issue is that their preferred work lacks sponsor demand or technical merit.
    conclusion: Do not infer merit from funding difficulty. Test whether valuable shared assets and independently validated work disappear specifically at project boundaries despite demonstrated reuse or demand.
    source_ids: [sri-history, sri-karim-project-record]
  - claim: A nonprofit institute can preserve capability better than a temporary program network.
    first_objection: SRI’s need to win contracts may make it no more durable than the programs it hosts.
    first_response: Legal continuity is only a container. It becomes technical continuity when the institute retains staff, tools, archives, and problem communities across awards.
    second_objection: Retention can also entrench outdated groups and turn public missions into a subsidy for incumbents.
    conclusion: Condition capability funding on external technical evaluation, reuse, apprenticeship, open or transferable artifacts where appropriate, and periodic competition—without forcing zero-state rebids for every project.
    source_ids: [sri-history, darpa-race, sri-confidencial-announcement-2022]
corrections: []
---

From 2017 through 2021, I worked full-time at SRI International. Confidencial.io spun out in 2021; I then remained part-time at SRI through early 2023 to finish the DARPA programs while building the company. [SRI’s June 2022 announcement](#source-sri-confidencial-announcement-2022) documents Confidencial.io’s seed financing and private-beta launch. Across that overlap, my SRI work moved through internal seedlings, proposals, program formation, multi-institution teams, formal methods, cryptography, hardware architecture, and attempts at transition. The public record divides that work into named projects. My memory is less neatly segmented. One project supplied a collaborator, tool, or failed approach that changed the next. The institution existed in the overlap. <span class="rd-evidence-token" data-evidence="M">M</span> <span class="rd-evidence-token" data-evidence="D">D</span>

That overlap is the promise of an independent nonprofit research institute. It has no single captive product line. It can join government missions, university ideas, company engineering, and internal technical traditions. But the absence of a captive product business also means there may be no automatic payer for the spaces between awards.

The project ledger is visible. The institutional ledger is not.

The unit of analysis here is the **performer institution**: what SRI retained, recombined, or lost across separate awards. Article 6 examines the other side of the same programs—the temporary network and common clock created by DARPA. A successful program can coexist with weak host continuity, or a durable host can retain capability after the sponsor-created network dissolves.

## Three programs, one local arc

[SRI’s archived biography](#source-sri-karim-project-record) lists my public roles in three DARPA programs: PRISM under RACE, EMPHASIZE under SIEVE, and FARSIDE under DPRIVE, as well as an Air Force quantum project. The agency pages define distinct missions. [RACE](#source-darpa-race) pursued resilient, privacy-preserving communication. [SIEVE](#source-darpa-sieve) pursued more expressive and efficient zero-knowledge proofs. [DPRIVE](#source-darpa-dprive) pursued hardware and software capable of reducing the enormous overhead of fully homomorphic encryption. <span class="rd-evidence-token" data-evidence="D">D</span>

On paper, these are separate boxes. Technically, they share methods and people. Secure computation raises questions about cryptographic assumptions, systems interfaces, verification, hardware cost, adversarial behavior, and usability. A researcher or toolchain that crosses programs can make the later work possible. A proposal process can also force every inherited asset to appear newly invented because only the new task is chargeable.

That is the central ambiguity of project-funded institutions. Projects are how ambitious work becomes accountable. They give a sponsor a defined objective, budget, schedule, and right to demand evidence. Yet if every minute and asset must attach to a current task, the institution has difficulty maintaining the state that makes the next ambitious task credible.

## Chargeability is not merely an accounting rule

Chargeability begins as fiscal discipline: labor billed to a sponsor should advance the work that sponsor bought. That is necessary. The systemic effect appears when nearly all technical labor must remain chargeable nearly all the time.

Then proposal fit becomes a survival criterion. A researcher asks not only “What problem matters?” but “Which open solicitation can carry this person next quarter?” A manager asks not only “Which capability should we build?” but “Which funded line can absorb its maintenance?” Internal seed funding helps, but short seedlings may optimize for proposal readiness rather than for the uncertain period needed to discover whether a new direction is real.

This argument rests partly on firsthand interpretation, not a published SRI-wide chargeability dataset. It should be tested, not universalized. Relevant evidence would include the share and duration of internal funding, staff time between projects, reuse of technical infrastructure, turnover at funding cliffs, and the fate of groups whose work remained strong but temporarily lacked a matching solicitation. <span class="rd-evidence-token" data-evidence="M">M</span> <span class="rd-evidence-token" data-evidence="A">A</span>

## The portfolio-commons problem

A project-funded institute contains assets that no one project would rationally purchase in full: a secure build system, a proof library, a calibrated instrument, a proposal community, a senior systems engineer, a dataset, or a relationship with a transition partner. Every project benefits if the asset exists. Each sponsor is also correct to resist paying costs unrelated to its award.

This is a portfolio commons. It is not necessarily open to the public; the “commons” is the shared institutional layer used across tasks. If every sponsor pays only the incremental cost of its deliverable, the layer is underfunded. If the institute allocates every shared ambition to sponsors without clear benefit, it overcharges or hides strategy inside overhead. The missing contract is explicit co-investment in reusable capability.

The institute needs to distinguish three uses of internal money:

| Internal use | Purpose | Evidence of success | Failure mode |
|---|---|---|---|
| **Exploration** | Change the representation of a problem before a solicitation or customer exists | New evidence, killed assumptions, or a technically credible program thesis | Seed funds become a polished-proposal factory |
| **Bridge** | Keep a validated team, tool, or facility intact across a temporary funding gap | Reuse within a predeclared period at lower cost than reconstruction | Every group claims indefinite strategic status |
| **Co-investment** | Build a shared asset that multiple current or prospective sponsors will use | Named users, practical reuse, maintenance owner, and declining marginal project cost | The institute socializes cost while projects capture no measurable benefit |

Combining the three in one “internal R&D” number prevents governance. Exploration should tolerate technical failure. A bridge should have a time limit and evidence of future demand. Co-investment should require a utilization and stewardship plan. All three can support long thought; each needs a different stop rule.

The portfolio account must also be a vector, not a retention percentage. For each claimed capability, record:

- critical people and role combinations retained;
- artifacts and environments actually reused, not merely archived;
- time saved and failures avoided in later work;
- new apprentices who can operate the capability independently;
- changes in problem-initiation authority; and
- transition relationships that remained active.

A high aggregate reuse rate could hide the loss of the one complement that made an end-to-end system possible. Conversely, allowing most project-specific code to die can be healthy when the general method, judgment, and validated interface survive.

## A technical case: from program research to public artifact

RACE makes the handoff visible. DARPA’s public program record states that the work sought a distributed messaging system resistant to large-scale compromise and grounded in rigorous security or realistic statistical arguments. The page also records a later event: in August 2024, DARPA released proof-of-concept code so others could experiment with the complete system or its components. [That release is evidence of afterlife beyond a final report](#source-darpa-race). It does not establish broad deployment, maintenance, or the preservation of the original team. <span class="rd-evidence-token" data-evidence="D">D</span>

The same research line contributed to a different transition path. Confidencial.io spun out in 2021. [SRI’s June 2022 public announcement](#source-sri-confidencial-announcement-2022) says that the company drew on technologies rooted in the DARPA Brandeis and RACE programs and was launching a beta product with seed financing. A public research program, a nonprofit institute, and a startup each performed a different function. None alone was the complete pipeline. <span class="rd-evidence-token" data-evidence="M">M</span> <span class="rd-evidence-token" data-evidence="D">D</span>

The research program could pay for new security mechanisms and system prototypes. SRI could assemble people and intellectual property across work. The startup could focus on integration with existing business applications, customers, procurement, support, and product survival. Transition required changing the technical form: the announcement describes using current cryptographic standards rather than requiring customers to adopt every original research primitive.

This is not proof that every transition should become a company. It demonstrates that “technology transfer” is not a signature at the end of a project. It is a new institution accepting a different set of obligations.

## PARC arrived after my part-time SRI program work—but not outside my view

[Xerox announced the donation of PARC to SRI in April 2023](#source-xerox-parc-sri), shortly after my part-time SRI work finishing the DARPA programs had ended. My connection to SRI did not end at that employment boundary: I retained an SRI office and badge through 2026. I therefore had a bounded firsthand view of PARC’s arrival and the post-transaction institutional environment. I did not participate in the legal transaction or its internal integration decisions. The legal facts remain documentary; the continuing campus observation is firsthand. <span class="rd-evidence-token" data-evidence="D">D</span> <span class="rd-evidence-token" data-evidence="M">M</span>

That boundary is especially important in a series about institutional memory. Continuing physical access can establish what I directly encountered and can illuminate questions to ask—how teams are funded, what shared services exist, and how internal work is protected. It cannot establish every employee’s experience, confidential deliberation, funding decision, or long-run integration outcome. Those broader answers still require documents, data, and interviews.

## The strongest counterargument

Project competition may be the feature, not the bug. It prevents stagnant groups from claiming permanent support. It forces researchers to explain relevance, compare approaches, meet milestones, and assemble new teams. A nonprofit institute insulated from sponsor demand could become an expensive guild.

The answer is not to abolish competition. It is to stop making one mechanism purchase three different things without naming them. Competitive projects buy goal-directed work. They do not reliably buy institutional memory, and they are poorly suited to buying shared capability whose users are future programs not yet defined.

A better compact would expose the layers:

- Sponsors competitively select and evaluate projects.
- Institutes receive bounded capability funding for demonstrably reused people, tools, data, and facilities.
- Capability funding expires or recompetes when external review finds no reuse, learning, or mission value.
- Transition receives its own owner and budget rather than being implied by a final demonstration.

This design preserves hard tests without forcing each new project to rebuild the institution it assumes.

## What would falsify the projectization mechanism?

The chargeability argument should be rejected or sharply narrowed if SRI or comparable institutes show that high project charging coexists over time with stable technical careers, substantial researcher-initiated work, routine cross-award reuse, low reconstruction cost, and strong transition—without hidden subsidy from owners, endowment, or unrelated revenue.

It should also weaken if capability bridges do not improve later performance: bridged teams win work but do not start faster, avoid prior failures, produce stronger evidence, or transition more effectively than newly assembled teams. In that case, continuity may protect incumbents rather than knowledge.

The strongest confirmation would not be dissatisfaction with proposal pressure. It would be a discontinuity at funding boundaries: a demonstrably reused team, tool, or relationship disappears when no active charge code can carry it, and a later sponsor pays to rebuild substantially the same state. The comparison must include technical merit and demand so that “unfunded” is not automatically recoded as “valuable but neglected.”

My own chronology is not a sufficient test. It identifies programs and local mechanisms. A publishable institutional conclusion needs anonymized funding-gap histories, role-level turnover, internal investment categories, reuse records, and contrary cases where discontinuity improved the work.

## Five different verdicts

- **Scientific success:** The public programs generated papers, formal methods, cryptographic constructions, and open technical work; importance varies by result.
- **Technical success:** RACE, SIEVE, and DPRIVE demanded systems, verified implementations, or hardware-software integration beyond papers alone.
- **Transition success:** Public code and the Confidencial.io spinout show two distinct transition mechanisms, neither equivalent to universal adoption.
- **Institutional success:** SRI provided a durable host across overlapping projects, while the amount of capability retained between them remains the core empirical question.
- **Public-value success:** Government sponsorship created reusable knowledge and artifacts, but preservation and diffusion depend on licensing, maintenance, openness, and successor institutions.

## What the successor must learn

The successor laboratory should maintain a **cross-project state ledger**. For every completed program, it should record which people remain, which tools are maintained, which negative results are searchable, which artifacts are independently usable, which relationships persist, and who owns the next transition decision.

That ledger should not guarantee survival. It should make destruction visible. A project can properly end while a valuable capability continues; a project can meet every milestone while leaving nothing usable behind.

The open question for SRI colleagues and sponsors is precise: which later result depended on institutional state that no sponsor had explicitly paid to preserve, and which supposedly reusable asset was never actually used again?
