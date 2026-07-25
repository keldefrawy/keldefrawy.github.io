# R&D Ratchet missing-article execution plan

Last updated: 2026-07-24  
Scope: Create first drafts for Articles 2–6 and 10–17, preserve those first drafts before revision, review the full seventeen-article series for contradictions, and revise the thirteen new articles. Articles 1, 7, 8, and 9 are review inputs but their prose must not be removed or silently rewritten in this pass.  
Repository rule: Keep this work local. Do not stage, commit, or push it.

## Phase tracking

| Phase | Deliverable | Status | Completion test |
|---|---|---|---|
| 0 | Execution plan and article inventory | Complete | This file exists; all thirteen missing slugs and dependencies are recorded |
| 1 | Evidence ledger completion | Complete | Each new article has a bounded set of primary or authoritative sources; every source ID resolves |
| 2 | Historical and institutional first drafts | Complete | v0.1 drafts exist for Articles 2–6 |
| 3 | Synthesis and transition first drafts | Complete | v0.1 drafts exist for Articles 10–14 |
| 4 | Epistemic and successor first drafts | Complete | v0.1 drafts exist for Articles 15–17 |
| 5 | Pre-revision preservation | Complete | Exact v0.1 copies and a SHA-256 manifest exist under `_drafts/rd-ratchet-draft-archive/v0-1/` |
| 6 | Cross-series review | Complete | A contradiction matrix records terminology, claims, dates, institutional status, evidence class, and conflicts across all seventeen articles |
| 7 | Revision | Complete | All thirteen live drafts are v0.2 and identify the review changes they incorporate |
| 8 | Validation and visual QA | Complete | Jekyll build, automated audits, link/source checks, and desktop/mobile visual inspection pass |

## Article inventory

| No. | Slug | First-draft focus | Principal dependency |
|---:|---|---|---|
| 2 | `lucent-coming-apart` | Bounded 2001 Bell Labs/Lucent scene; excellence coexisting with parent fragility; later Nokia custody | Bell-system chronology and contemporaneous Lucent financial history |
| 3 | `one-heritage-two-incentives` | Lucent versus AT&T as differing post-1996 parent systems | AT&T restructuring plus bounded 2001/2007 firsthand comparison |
| 4 | `hrl-mission-driven-bargain` | Sponsor-owned mission research and the line between a laboratory and a project portfolio | HRL institutional history, public project record, pending IBM transaction |
| 5 | `sri-project-funded-institution` | Nonprofit contract research, chargeability, seedlings, and project cliffs | SRI history and public DARPA/project records; PARC is post-tenure documentation only |
| 6 | `darpa-temporary-laboratory` | High-authority temporary networks and the unowned state left after programs | DARPA program-manager model and named public program records |
| 10 | `parc-appropriability-trap` | Invention, recognition, complementary assets, and value capture as distinct capabilities | PARC primary history, appropriability scholarship, 2023 Xerox–SRI transfer |
| 11 | `outputs-and-vanishing-capability` | Papers, patents, prototypes, and awards as lossy projections of capability | Site record plus research-metrics and capability-continuity evidence |
| 12 | `startup-not-laboratory` | Productization as necessary transition work; venture focus cannot fund the research commons | Confidencial.io public record and authoritative venture/innovation evidence |
| 13 | `consolidation-as-triage` | Preservation versus narrowing in SRI/PARC and announced IBM/HRL combination | Transaction documents; closed versus pending status kept explicit |
| 14 | `last-transfer-window` | One institutional generation of overlap for tacit-knowledge transfer | Workforce/retirement evidence and sources on tacit knowledge and apprenticeship |
| 15 | `ai-audits-scientific-record` | Epistemic debt, bounded error evidence, and AI-assisted production of checkable artifacts | Lamport, mathematical peer review, Majorana retraction, Lean/formalization evidence |
| 16 | `cargo-cult-science-machine-speed` | Shannon, Feynman, Wigner, data scaling, hallucination, and witness-bearing claims | Primary essays plus current hallucination and formal-evidence work |
| 17 | `ai-native-public-good` | Incentive-compatible public–private, AI-native successor institution | NAIRR, NSTC, FFRDC, DARPA, and DOE transition mechanisms |

## Draft standard

Every new v0.1 draft must:

1. Remain labeled `Draft`, be locally rendered, and use the permanent article slug.
2. Separate firsthand memory, documentation, and analysis. It must never imply firsthand access to PARC’s 2023 transfer or to IBM’s announced 2026 HRL transaction.
3. Criticize incentives, governance, and destructive behavior—not the character or private motives of named people.
4. State a bounded central claim, its falsifier or limiting condition, and the strongest available counterargument.
5. Include a source-linked evidence chart, a four-stage argument map, and at least two genuine two-level objection ladders.
6. Apply the five verdicts separately: scientific, technical, transition, institutional, and public value.
7. Preserve necessary prose. Visuals summarize the argument; they do not replace evidence or qualifications.
8. End with the constraint the case imposes on the successor institution and an open evidence question.

## Cross-series consistency contract

The review must test, at minimum:

- **Spending versus capability:** No article may equate record spending with preserved capability or claim that U.S. R&D was simply defunded.
- **Laboratory definition:** A laboratory is durable, stateful capability—not a famous name, a building, a budget, or a collection of outputs.
- **Institutional survival:** Bell Labs, IBM Research, PARC, HRL, SRI, FFRDCs, universities, and corporate labs must be described as continuing institutions where they continue; current breadth and autonomy remain empirical questions.
- **Transaction status:** PARC joined SRI in 2023. IBM’s HRL transaction is an announced, signed agreement subject to closing unless a later authoritative source establishes closure.
- **Firsthand boundaries:** Ericsson 2000; Bell Labs/Lucent 2001; Cisco San Jose 2002; AT&T Research 2007; HRL 2010–2016; SRI 2017–2022; Confidencial.io 2022–present.
- **Academia:** Universities are indispensable and insufficient as the entire R&D stack. Legitimate facilities and administration must not be collapsed into “waste.”
- **FFRDCs:** Their chartered continuity and public-purpose role must be distinguished from evidence that some work is task-order-driven or engineering-heavy. “Engineering house at best” is a hypothesis to test, not an across-the-board factual label.
- **Startups:** Commercialization is a distinct, necessary capability. A startup’s inability to maintain a broad research commons is an incentive mismatch, not a moral failure.
- **Expert governance:** Practiced research judgment warrants real authority but not unchecked rule; fiduciary, safety, legal, and public-accountability functions remain independent.
- **AI and verification:** Model output is not verification. AI contributes when it helps produce domain-appropriate, independently checkable witnesses.
- **Error taxonomy:** Mistake, retraction, failed replication, disputed interpretation, hallucination, cargo-cult process, overreach, and fraud remain distinct.
- **Success taxonomy:** Scientific, technical, transition, institutional, and public-value success may diverge and must not be compressed into one verdict.

## Preservation and revision protocol

1. Finish all thirteen v0.1 files before revising any of them.
2. Copy the exact v0.1 files into `_drafts/rd-ratchet-draft-archive/v0-1/`.
3. Record SHA-256 hashes, sizes, article numbers, slugs, and archive time in `MANIFEST.md`.
4. Do not use `_rd_revisions`; that collection is reserved for immutable public versions beginning at v1.0.
5. Write the cross-series review to `_drafts/rd-ratchet-cross-series-review-v0-1.md`.
6. Revise live files to v0.2 without changing the archived copies. Set `revision_summary` to the concrete review disposition.
7. Verify archive hashes after revision.

## Validation sequence

1. Parse every article’s YAML front matter and confirm article number, slug, URL, version, sources, visual structures, and objections.
2. Confirm all seventeen series records link to a rendered article page and expose the correct lifecycle label.
3. Check source URLs and ensure prose claims do not outrun what the cited record supports.
4. Run `git diff --check`.
5. Run `bundle exec jekyll build`.
6. Run `ruby tests/rd_ratchet_audit.rb` and `ruby tests/rd_revision_workflow_audit.rb`.
7. Inspect the landing page and all thirteen new pages at desktop and narrow viewport widths, including evidence charts, argument maps, objection ladders, source ledgers, and horizontal overflow.
8. Leave all changes unstaged and unpushed.

## Completion record

Record completion evidence here as phases close. Do not mark a phase complete solely because files exist; use the phase’s completion test.

- 2026-07-24 — Phase 0 complete: confirmed thirteen missing drafts (Articles 2–6 and 10–17), identified the four existing articles as protected review inputs, and recorded the local-only preservation protocol.
- 2026-07-24 — Phase 1 complete: added authoritative records for the Bell-system split, HRL, SRI and three DARPA programs, PARC and appropriability, venture decision-making, the author's output ledgers, retirement, and R&D-team tacit knowledge.
- 2026-07-24 — Phase 2 complete: created source-linked v0.1 drafts for Articles 2–6 and changed their series cards from Planned to Researching.
- 2026-07-24 — Phase 3 complete: created source-linked v0.1 drafts for Articles 10–14, including bounded treatment of PARC, venture exits, consolidation status, FFRDCs, and the transfer-window hypothesis.
- 2026-07-24 — Phase 4 complete: created source-linked v0.1 drafts for Articles 15–17, bounded the mathematics and quantum claims, separated the AI failure taxonomy, and specified a falsifiable successor-institution pilot.
- 2026-07-24 — Phase 5 complete: preserved thirteen exact v0.1 copies and recorded byte sizes and SHA-256 hashes in the private draft-archive manifest.
- 2026-07-24 — Phase 6 complete: reviewed all seventeen articles against a canonical fact and terminology matrix; found no irreconcilable thesis conflict, recorded three material corrections and nine source or boundary clarifications, and preserved the detailed disposition ledger in `_drafts/rd-ratchet-cross-series-review-v0-1.md`.
- 2026-07-24 — Phase 7 complete: revised all thirteen live drafts to v0.2, corrected the AI-amplifier claim and PARC evidence classification, replaced the non-informative transaction chart, tightened article boundaries, added the bounded Xerox commercialization source, and verified that every archived v0.1 hash remains unchanged.
- 2026-07-24 — Phase 8 complete: Jekyll built successfully; the R&D Ratchet, revision-workflow, and research-topic audits passed; all 76 source URLs returned an HTTP response; and browser inspection at 1280 px and 390 px confirmed all thirteen v0.2 pages render their evidence charts, four-stage argument maps, two objection ladders, source ledgers, and DRAFT links without document-level overflow or console errors. The horizontally scrolled timeline line reached its far-right boundary, and selecting successor-figure nodes changed neither their dimensions nor their positions relative to one another.
