---
title: DARPA Can Create a Temporary Laboratory. What Happens When the Program Ends?
article_number: 6
article_slug: darpa-temporary-laboratory
permalink: /rd-ratchet/darpa-temporary-laboratory/
article_status: Draft
published: true
dek: An empowered program manager can assemble an extraordinary network around a hard objective; the harder design problem is who catches the shared state when the program clock expires.
date: 2026-07-24
updated: 2026-07-25
version: "0.3"
version_sequence: 3
revision_summary: Added a typed continuity disposition, staged inheritance protocol, common-mode preservation test, and explicit falsifiers for the temporary-laboratory thesis.
reading_time: 20
central_claim: DARPA’s finite, milestone-driven programs are powerful temporary laboratories, but their success creates a preservation problem that the performer, sponsor, and transition customer may each rationally leave to someone else.
claim_status: Provisional synthesis of agency records and bounded performer experience
hero_image: /assets/images/rd-ratchet/articles/article-06-darpa-temporary-laboratory.webp
hero_alt: A program clock links researchers, a secure chip, proofs, prototypes, and a testbed before people and preserved artifacts cross a narrow bridge toward a durable institutional host.
hero_caption: Conceptual program network; it does not represent a specific DARPA team or contractual relationship.
source_ids:
  - darpa-pm-model
  - darpa-race
  - darpa-sieve
  - darpa-dprive
  - sri-karim-project-record
  - sri-confidencial-announcement-2022
  - nasem-arpa-e-2017
evidence_chart:
  kicker: A deliberately hard target
  title: DPRIVE defined success against the speed of unencrypted computation
  summary: The target shows how a program can coordinate disparate work around one measurable constraint. It does not show that the target was achieved or that the resulting capability persisted.
  aria_label: DARPA described ordinary unencrypted computation as a one-times reference and targeted fully homomorphic encryption within one order of magnitude, or at most approximately ten times that reference.
  source_id: darpa-dprive
  note: Conceptual performance ratio from the program objective, not a reported final benchmark; workloads and implementations determine actual overhead.
  bars:
    - { label: "Unencrypted reference", value: "1×", percent: 10, tone: blue }
    - { label: "DPRIVE target ceiling", value: "≤10×", percent: 100, tone: green }
argument_map:
  kicker: Source-linked argument map
  title: A program can solve coordination without solving continuity
  summary: DARPA’s structure explains how temporary capability is assembled; the preservation gap arises after the sponsor’s bounded mission is complete.
  caption: Finite tenure and milestones are treated as strengths. The claim concerns the missing complementary institution after program completion.
  nodes:
    - role: Documented observation
      title: Program managers receive unusual authority
      text: DARPA describes fixed-tenure program managers who formulate programs, select performers, manage milestones, and redirect portfolios.
      source_ids: [darpa-pm-model]
    - role: Documented observation
      title: Programs assemble cross-organization capability
      text: RACE, SIEVE, and DPRIVE joined security, formal methods, systems, and hardware around explicit mission goals.
      source_ids: [darpa-race, darpa-sieve, darpa-dprive]
    - role: Coordination gap
      title: Completion ends the common clock
      text: Code, test infrastructure, people, and transition relationships return to organizations with different incentives when the program ends.
      source_ids: [darpa-race, darpa-dprive]
    - role: Bounded conclusion
      title: Name a continuity owner at program formation
      text: Programs should assign responsibility and resources for artifact custody, team transfer, independent evaluation, and transition before the final milestone.
      source_ids: [sri-confidencial-announcement-2022, nasem-arpa-e-2017]
objection_ladders:
  - claim: DARPA programs leave valuable shared state without an owner.
    first_objection: DARPA’s job is to demonstrate possibility and create options, not operate laboratories or maintain products indefinitely.
    first_response: Correct. The preservation obligation need not sit inside DARPA; it must be assigned to a performer, mission agency, FFRDC, company, standards body, or dedicated repository.
    second_objection: Preassigning a continuity owner could entrench incumbents and force preservation before anyone knows what deserves to survive.
    conclusion: Fund staged continuity options with explicit kill criteria. Preserve enough state to permit evaluation, then continue only artifacts, teams, and facilities that pass independent mission and reuse tests.
    source_ids: [darpa-pm-model, darpa-race, nasem-arpa-e-2017]
  - claim: Milestones can shorten the effective horizon of uncertain research.
    first_objection: Aggressive milestones are precisely what prevent speculative programs from drifting and force technical truth to appear early.
    first_response: Milestones are a strength when they test the core uncertainty. They become distorting when every period must show smooth progress despite a discontinuous research path.
    second_objection: Program managers already have authority to revise milestones, so the problem is execution quality rather than institutional design.
    conclusion: Preserve empowered judgment, but audit whether milestones tested decisive uncertainty, rewarded candor about failure, and left time and ownership for integration after technical proof.
    source_ids: [darpa-pm-model, nasem-arpa-e-2017]
corrections: []
---

DARPA can make an organization appear where none existed. A program manager defines a hard objective, recruits groups that may never have worked together, creates milestones and shared evaluations, and forces theory, software, hardware, and mission need into the same conversation. For several years, the program has a name, a technical language, a schedule, a budget, and a community. It behaves like a laboratory distributed across institutions.

Then the clock ends.

The people still exist. The papers and code may exist. The contracts certainly existed. But the temporary laboratory’s connective tissue—regular reviews, shared urgency, cross-team debugging, evaluation infrastructure, and the authority to redirect the whole—can disappear in one budget boundary.

My experience as a performer across RACE, SIEVE, and DPRIVE is only one view of this mechanism. It is enough to identify the question, not to issue a verdict on every program. <span class="rd-evidence-token" data-evidence="M">M</span>

## Why the temporary laboratory works

[DARPA describes its program managers](#source-darpa-pm-model) as fixed-term leaders with substantial authority to develop programs, select performers, set milestones, and manage portfolios. Finite tenure matters. It attracts people who will take a bounded period away from another career, gives urgency to their thesis, and reduces the chance that one manager owns a technical domain indefinitely. <span class="rd-evidence-token" data-evidence="D">D</span>

The program structure can solve a coordination problem ordinary grants leave open. A university may develop an algorithm. A company may build hardware. A nonprofit institute may integrate and verify a system. A government test team may define an adversary. A program manager can require those pieces to meet on a schedule and can stop a path that fails.

[RACE](#source-darpa-race), [SIEVE](#source-darpa-sieve), and [DPRIVE](#source-darpa-dprive) illustrate different versions. RACE sought resilient anonymous communication grounded in rigorous security or realistic simulation. SIEVE sought zero-knowledge proofs expressive and efficient enough for complex statements. DPRIVE sought an integrated hardware-software leap that would bring fully homomorphic encryption to within an order of magnitude of unencrypted computation. Each objective was too cross-layered for a paper-only portfolio.

The temporary laboratory is therefore a genuine institutional invention. Its finite nature is part of its power.

## Completion has at least five meanings

A program page may say “complete,” but completion is not one state.

1. The contractual period ended.
2. The final milestones were assessed.
3. A technical capability was demonstrated.
4. Artifacts became usable outside the original team.
5. A mission or market institution adopted and maintained the capability.

Those events can occur years apart, or not at all. Confusing them produces both unfair criticism and false celebration. A program can fail at deployment while creating major scientific knowledge. It can meet every milestone while producing an artifact no one can maintain. It can miss an aggressive target yet create the people and tools that make a later success possible.

This series’ five-verdict framework—scientific, technical, transition, institutional, and public value—is not decoration. It is necessary accounting for a temporary laboratory.

## A technical case: RACE after the common clock

RACE pursued a distributed messaging system intended to preserve privacy and resist compromise. The public program record emphasizes rigorous security arguments and realistic simulation. It also records that DARPA released proof-of-concept code in August 2024, allowing researchers and users to experiment with the complete system or separate components. [That release is a concrete preservation event](#source-darpa-race). <span class="rd-evidence-token" data-evidence="D">D</span>

Public code changes the afterlife of a program. It gives outsiders something more checkable than a final report. But a repository is not a maintainer, and a release is not adoption. Dependencies age. Build environments disappear. The people who understand why one design failed move to new work. The artifact may preserve explicit state while losing tacit state.

A separate branch of the work moved through institution and company formation. Confidencial.io spun out in 2021, while I remained part-time at SRI through early 2023 to finish the DARPA programs. [SRI’s June 2022 public announcement](#source-sri-confidencial-announcement-2022) describes technology rooted partly in RACE and Brandeis research being reworked into a seed-financed beta product. That transition required standard cryptography, integration into existing applications, financing, customers, and an organization responsible for support. The startup did not preserve the whole program. It selected a use path. <span class="rd-evidence-token" data-evidence="M">M</span> <span class="rd-evidence-token" data-evidence="D">D</span>

These are complementary forms of afterlife:

- open code preserves inspectability and reuse options;
- a product organization accepts integration and customer obligations;
- papers preserve claims and methods;
- an enduring laboratory can preserve people, testbeds, and the capacity to begin the next question.

No single one substitutes for all the others.

## The unowned state problem

At program end, each actor can reasonably assume someone else will carry the state.

- DARPA completed the bounded program it was chartered to run.
- The performer must move staff to funded work.
- A mission agency may want a product, not a research prototype.
- A company may want exclusive value, not a shared testbed.
- A university may preserve papers and students, not system maintenance.

This is an **unowned-state equilibrium**. Everyone can satisfy local obligations while code, facilities, evaluation data, and cross-team trust decay.

The unit here is the sponsor-created program network, not any one performer’s internal continuity. Article 5 asks what a host such as SRI can carry across awards. This article asks who owns the cross-performer state once the common DARPA clock disappears.

The cost is not merely waste. Later programs may pay again to reconstruct a test environment, rediscover a negative result, or reassemble experts who already learned how the pieces fail together. The national R&D account records both rounds as new spending.

## Preservation must be typed before it is funded

“Preserve the program” is as unhelpful as “commercialize the result.” Different state needs different owners and clocks.

| State at program end | Minimum disposition | Candidate owner | Stop test |
|---|---|---|---|
| Claims and evidence | Versioned papers, assumptions, complete provenance, correction path | Public repository, performer, journal, or mission archive | No consequential dependency and no legal retention need |
| Code and reproducible environments | Buildable release or controlled escrow, tests, dependency manifest, named maintainer | Performer, open-source foundation, FFRDC, agency lab, or company | Reuse and security value fall below maintenance cost |
| Evaluation infrastructure | Benchmarks, adversaries, calibration, hidden-test governance, and known gaming paths | Independent test organization or standards body | Test no longer discriminates relevant capability |
| Unique facility or dataset | Access rules, calibration, stewardship, successor plan, and replacement lead time | Mission laboratory, FFRDC, university facility, or consortium | A cheaper substitute passes the same external tests |
| Team and tacit integration | Bounded bridge, joint exercise, rotations, and apprenticeship | Host institution or receiving mission organization | Receiving cohort operates independently or capability is deliberately retired |
| Transition obligation | Integration, procurement, manufacturing, accreditation, deployment, and maintenance plan | Mission owner, product company, prime integrator, or standard-setting ecosystem | User rejects the capability under predeclared operational criteria |

The table prevents one attractive artifact from standing in for the whole afterlife. Open code may preserve inspection while the evaluation harness disappears. A retained team may preserve knowledge while no user has adoption authority. A company may productize one branch while public test infrastructure becomes inaccessible.

Preservation also needs failure-mode diversity. If the performer that built a system is the only evaluator, maintainer, archivist, and transition advocate, every disposition shares one institutional failure. At least the verification or custody of high-consequence state should sit outside the originating team's survival incentives.

## A staged inheritance protocol

Continuity should be decided when evidence is strongest, not improvised after staff have dispersed.

**At program formation:** name candidate state categories and possible owners, budget artifact hygiene, and prohibit a promise of full preservation before the work exists.

**At the first integrated test:** identify which tools, datasets, facilities, and role combinations have become critical; estimate replacement time and common-mode dependencies.

**Six months before completion:** require candidate custodians to demonstrate ingestion—building the artifact, running the test, accessing the facility, or reproducing the result without the originating team silently completing the task.

**At completion:** choose among active maintenance, controlled escrow, open release, mission transition, time-bounded bridge, or deliberate retirement for each state category. Name the payer and acceptance test.

**At 18 and 60 months:** measure actual reuse, correction, adoption, team independence, cost, and security. End custodianship that survives only because its termination was never scheduled. <span class="rd-evidence-token" data-evidence="A">A</span>

The dates are design defaults, not empirical optima. Hardware, clinical, classified, and software programs need different intervals. Their purpose is to make handoff observable while transfer is still possible.

## The strongest counterargument

Preservation can become a euphemism for permanent subsidy. Most prototypes should die. Teams should disperse so ideas diffuse. A program that plans its institutional afterlife too early may bias selection toward established performers and easily transitioned work—the opposite of DARPA’s purpose.

That objection rules out automatic continuation. It does not justify automatic amnesia.

The design response is an **option, not an entitlement**. At program formation, identify potential custodians and reserve a small, staged continuity budget. Near completion, an independent review chooses among archival release, maintenance, mission transition, follow-on research, or deliberate termination. A team need not survive intact for its build environment, evaluation corpus, failure log, and integration knowledge to remain usable.

Before the final integrated review, the program must name the accountable continuity owner outside the temporary network—or record an explicit decision that no active owner is warranted. “The community” is not an owner. DARPA need not become the maintainer, but the disposition must identify the performer, mission agency, FFRDC, company, standards body, or repository that accepts each surviving obligation.

[The National Academies’ assessment of ARPA-E](#source-nasem-arpa-e-2017) is useful here because it documents a related model of technically strong program directors, active management, milestones, and portfolio authority. The cross-agency comparison does not prove a universal solution. It shows that empowered temporary coordination is repeatable; continuity still requires another institution. <span class="rd-evidence-token" data-evidence="D">D</span>

## What would falsify the temporary-laboratory thesis?

The thesis should weaken if cross-performer state ordinarily survives without assigned custody: repositories remain buildable, evaluation infrastructure remains discriminating, teams preserve collaboration across employers, mission users adopt successful results, and later programs rarely pay to reconstruct prior capability.

It should also weaken if early continuity planning systematically damages program quality by selecting incumbent performers, safer problems, or easily productized artifacts. The comparison should examine whether programs with staged inheritance take less technical risk or retain weak state longer than comparable programs without it.

The policy succeeds only if total option value improves. A preserved artifact that nobody can use is a cost. A terminated artifact whose methods and failure record prevent later duplication may still yield value. A dispersed team that creates several stronger institutions may be a better outcome than one retained intact. The proposed protocol must outperform deliberate forgetting, not assume that memory is always virtuous.

## Five different verdicts

- **Scientific success:** The programs can create new theory, algorithms, and methods even where system targets remain incomplete.
- **Technical success:** Integrated demonstrations test whether separately plausible ideas function together under a hard constraint.
- **Transition success:** Code release, standards, procurement, licensing, and spinouts are distinct paths and must be measured separately.
- **Institutional success:** The temporary network creates powerful shared state; its default post-program preservation is weak unless assigned.
- **Public-value success:** Public sponsorship can create spillovers well beyond one performer, but only if artifacts and capability remain accessible or transferable under appropriate security rules.

## What the successor must learn

The permanent institution should not replace DARPA’s temporary laboratory. It should catch what deserves to survive after the program has done its job.

Every major program should have a **continuity disposition** alongside its transition plan:

- what will be archived in a reproducible form;
- what requires an active maintainer;
- which people or roles are hard to reconstitute;
- which test infrastructure has reuse value;
- which negative results will be discoverable;
- which mission organization can adopt the result; and
- what should be allowed to end.

The open question is measurable: five years after a successful program, how much would it cost—and how long would it take—to reassemble the capability that existed at its final integrated review?
