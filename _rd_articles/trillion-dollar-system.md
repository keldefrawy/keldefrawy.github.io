---
title: The Nearly Trillion-Dollar R&D System That Cannot Think Long
article_number: 1
article_slug: trillion-dollar-system
permalink: /rd-ratchet/trillion-dollar-system/
article_status: Draft
published: false
dek: America is spending more on R&D than ever. The paradox is that expenditure measures motion, while the capacity to pursue an uncertain question across a generation is accumulated—and perishable—state.
date: 2026-07-23
updated: 2026-07-23
version: "0.1"
version_sequence: 1
revision_summary: Private working draft; not a public version
reading_time: 24
central_claim: A research system thinks long only when it preserves teams, tools, memory, independent error correction, and a path to use across the gaps between projects. U.S. R&D accounts measure annual activity but do not establish that this institutional state is being replenished.
claim_status: Provisional; the expenditure facts are established, while the system-level capability claim remains a testable interpretation
hero_image: /assets/images/rd-ratchet/rd-ratchet-hero.webp
hero_alt: A conceptual thread of accumulated knowledge passes from an older electronics laboratory through a fragmented project landscape toward a future human-and-AI research institution.
hero_caption: Conceptual illustration. It does not depict a specific laboratory, transaction, or historical event.
source_ids:
  - ncses-rd-2026
  - ibm-hrl-2026
  - xerox-parc-sri
  - nokia-bell-history
  - arora-corporate-science
  - bloom-idea-productivity
  - turing-computable-numbers
  - turing-morphogenesis
  - shannon-communication
  - shannon-bandwagon
  - von-neumann-edvac
  - ias-computer-project
  - von-neumann-reliable-components
  - feynman-room-bottom
  - feynman-cargo-cult
  - feynman-quantum-simulation
  - ncses-herd-2024
  - ncses-ffrdc-2024
  - far-ffrdc
  - gao-dhs-ffrdc-2025
  - darpa-pm-model
  - gao-ffrdc
corrections: []
---

On July 23, 2026, [IBM announced that it had signed an agreement to acquire HRL Laboratories](#source-ibm-hrl-2026) from Boeing and General Motors. The transaction had not closed when this draft was written. Three years earlier, [Xerox donated PARC to SRI International](#source-xerox-parc-sri). These are different transactions involving different institutions, and neither should be written as an obituary. But together they pose a question that national R&D statistics cannot answer: when a laboratory changes institutional containers, what exactly survives?

That question is personal for me, but my vantage point is bounded. I worked at HRL from 2010 to 2016 and at SRI from 2017 to 2022. I did not participate in either transaction. I can recognize the kinds of capability hidden behind an institutional name—people who know how to choose problems, trusted teams, specialized tools, failed approaches that are not in papers, and engineers who can make a theoretical result work—but I cannot infer from an announcement which of those things will still cohere five years later. A transaction document establishes ownership and stated intent. It does not establish institutional continuity. <span class="rd-evidence-token" data-evidence="M">M</span> <span class="rd-evidence-token" data-evidence="D">D</span>

This is the first error to avoid. The second is larger: America did not stop spending on research and development.

## The fact that makes the easy story false

U.S. organizations performed an estimated **$993.4 billion** of R&D in 2024. In inflation-adjusted 2017 dollars, the total was $792.0 billion, up from $368.5 billion in 2000. Real basic-research expenditure rose from $57.8 billion to $115.5 billion over the same interval. Any account of collapse that omits those facts is not serious. [NCSES marks the 2024 figures as estimates subject to revision](#source-ncses-rd-2026).

Composition complicates the total. In 2024, 14.6 percent of expenditure was classified as basic research, 18.2 percent as applied research, and 67.3 percent as experimental development. Yet even this is not evidence of a sudden turn: the corresponding shares in 2000 were 15.7, 21.1, and 63.2 percent. NCSES explicitly warns that small historical percentage changes may not be meaningful. The expenditure series establishes a paradox, not a verdict. [The underlying federal table is inspectable below](#source-ncses-rd-2026). <span class="rd-evidence-token" data-evidence="D">D</span>

The funding structure did change. Businesses funded about $743 billion—roughly three quarters—of U.S. R&D in 2024. Their share of funding for basic research rose from 19 percent in 2000 to 34 percent in 2024, while the federal share fell from 58 percent to 40 percent. This is not simply “public down, private up”: federal basic-research dollars and real total basic research both grew. It is a change in who selects problems, what complementary assets are nearby, and which benefits the payer must be able to capture.

The proposition of this series is therefore narrower and more consequential than “R&D was defunded”:

> R&D expenditure is a flow. Research capability is a stock. A flow can reach a record while the stock becomes more concentrated, more brittle, or less able to cross institutional boundaries.

National accounts were not designed to measure whether a team remained intact between two grants, whether a fabrication process survived a reorganization, or whether anyone retained the negative result that would prevent a successor from losing two years. A paper, a patent, a prototype, and a dollar of salary all remain countable after the system that produced them has dispersed.

## A minimal stock-and-flow model

Let *K*<sub>t</sub> denote an institution's research capability at time *t*: its people, trust, facilities, toolchains, tacit knowledge, problem-selection judgment, and transition relationships. Let annual R&D expenditure *S*<sub>t</sub> be divided into project activity *P*<sub>t</sub> and investment *I*<sub>t</sub> that renews reusable capability. A deliberately simple accounting model is

<p class="rd-equation"><strong>S<sub>t</sub> = P<sub>t</sub> + I<sub>t</sub></strong></p>

<p class="rd-equation"><strong>K<sub>t+1</sub> = (1 − δ<sub>t</sub>)K<sub>t</sub> + η<sub>t</sub>I<sub>t</sub>.</strong></p>

Here δ<sub>t</sub> is capability depreciation: departures, abandoned instruments, broken mentorship chains, inaccessible code, and lost relationships. The term η<sub>t</sub> is the efficiency with which investment becomes durable capability rather than one-project consumption. This is not an estimated production function. It exposes the missing variables.

Spending *S*<sub>t</sub> can rise while capability *K*<sub>t</sub> falls whenever renewal is smaller than depreciation. Project output can also remain high for a time because current work draws down inherited *K*<sub>t</sub>. That is **capability debt**: the system appears productive while consuming the laboratory state that makes future productivity possible.

The model also prevents romanticism. A long-lived organization is not necessarily a good one. Capability can fossilize; protected time can shelter weak work; continuity can become entitlement. The relevant stock is not age or payroll. It is the reusable capacity to reduce important uncertainty, coupled to hard external tests and a path to use.

## What “thinking long” means

A system thinks long if it can do five things at once:

1. Keep an important question alive while its route to value remains uncertain.
2. Preserve people, tools, and experimental state across funding and leadership boundaries.
3. Maintain more than one independent way to challenge a result.
4. Join theory, experiment, engineering, and use without treating every handoff as somebody else's problem.
5. Stop work that fails hard tests without selecting only questions whose answers are predictable in advance.

This definition is about institutional architecture, not calendar duration. A ten-year program can think short if it is decomposed into annual demonstrations that force every uncertain path to masquerade as steady progress. A small team can think long if it retains state, autonomy, correction, and a credible transition path.

One implication is especially important:

> **The effective horizon of a research effort is bounded by the shortest-lived critical complement whose state cannot be transferred faithfully.**

A five-year grant does not create a five-year horizon if the key postdoc leaves in year two, the instrument technician is charged to another project in year three, or the transition partner appears only after the prototype. If success requires *n* institutional handoffs and handoff *i* preserves the necessary state with probability *p*<sub>i</sub>, then the illustrative continuation probability is *p*<sub>1</sub> × *p*<sub>2</sub> × … × *p*<sub>n</sub>. Five independent handoffs that each work 80 percent of the time leave only a 33 percent end-to-end probability. Real handoffs are not independent, and the number is not an empirical estimate. The calculation shows why fragmentation is multiplicative rather than merely additive.

## Four intellectual tools for seeing the institutional problem

Turing, Shannon, von Neumann, and Feynman did not write a theory of R&D institutions. Their work should not be converted into slogans they never endorsed. Used carefully, however, four of their technical ideas reveal defects that an expenditure total cannot.

### Turing: genuinely open research cannot be made fully decidable in advance

In 1936, Alan Turing turned an informal notion—what a person following a mechanical procedure can compute—into a precise machine model. He then used that model to show that no general mechanical procedure decides every instance of the *Entscheidungsproblem* in [“On Computable Numbers”](#source-turing-computable-numbers). This does **not** mathematically prove that grant panels cannot identify good projects. It establishes a more disciplined analogy: even in a formal domain, not every consequential question admits a universal decision procedure.

A research funding system nevertheless often asks an applicant to do something close to deciding an open process in advance: specify the question, milestones, risks, outputs, impact, and route to transition before the work has changed the investigator's representation of the problem. Accountability requires plans. But when confidence in the plan becomes a selection criterion, the system taxes the most representation-changing work precisely because that work cannot yet be rendered legible.

Turing's own trajectory sharpens the point. [His 1952 morphogenesis paper](#source-turing-morphogenesis) moved from mathematical logic and computing into theoretical biology. It asked how familiar reaction and diffusion laws could generate anatomical pattern. The result was not merely another answer within an established program; it supplied a new representation through which later researchers could pose questions. Institutions that fund only predeclared deliverables may improve answers while underproducing new question languages.

Call this the **legibility tax**: the more a funding mechanism requires reliable ex ante descriptions of outcomes, the more it selects against work whose main contribution will be to change the description space.

### Shannon: metrics are a noisy, capacity-limited channel

[Claude Shannon's 1948 theory](#source-shannon-communication) separated a source, an encoder, a channel, noise, a decoder, and a receiver. The abstraction deliberately ignored semantic meaning to derive exact limits on reliable communication. An R&D system also communicates through channels: proposals, progress reports, publications, citation counts, patents, demonstrations, and budget categories carry partial messages about a latent object—scientific and public value.

The analogy has a strict limit. There is no agreed probability distribution over “important research,” and no scalar entropy captures scientific meaning. But the structural lesson survives: a channel cannot preserve distinctions it was not designed to transmit.

A publication carries the successful argument; it rarely carries every failed construction, instrument quirk, interpersonal trust relation, or judgment call. A patent discloses an invention; it does not prove that a team can manufacture it. A milestone proves that a demonstration occurred under stated conditions; it does not show that the capability will survive the program. Counting more messages does not restore discarded state.

Shannon himself warned in [the 1956 editorial “The Bandwagon”](#source-shannon-bandwagon) that information theory had become fashionable and that weakly justified applications could dilute the field. Modern science has created a second-order version of his warning: once a signal becomes a reward, institutions learn to manufacture the signal. Metric volume can rise while the mutual information between the metric and durable value falls.

This gives a second principle:

> **Metric flooding does not increase institutional channel capacity when the messages are correlated transformations of the same proxy.**

Ten bibliometric indicators do not create ten independent observations if all are functions of publication and citation. More reporting can even consume the attention required to preserve the underlying work.

### Von Neumann: a portfolio is robust only when its errors are not synchronized

John von Neumann's work connected abstract organization to physical machinery. [The 1945 *First Draft of a Report on the EDVAC*](#source-von-neumann-edvac) described a stored-program organization whose historical attribution belongs to a wider design team, not to one man alone. At the Institute for Advanced Study, [the Electronic Computer Project](#source-ias-computer-project) then took roughly six years to produce a working machine. Its reports were circulated openly, and related machines appeared at laboratories in the United States and abroad. The path joined architecture, component engineering, programming, public support, institutional shelter, and diffusion.

[Von Neumann later asked](#source-von-neumann-reliable-components) how reliable computation could be synthesized from unreliable components. His answer used redundancy and restoring mechanisms. The institutional analogy is not “fund many projects.” Redundancy works when multiple elements do not fail in the same way.

Contemporary R&D portfolios can contain thousands of projects and still have a common-mode failure: every team optimizes for the same novelty language, grant renewal, quarterly product relevance, publication venue, or demonstration schedule. Selection creates correlated error. A result reproduced by three groups under the same data pipeline, benchmark, career incentives, and publication filter is less independent than the count suggests.

The lesson is a **portfolio-monoculture principle**—an institutional inference, not a theorem from von Neumann's model:

> Increasing the number of projects does not make a research system proportionally more reliable when the projects share the same selection pressure and failure mode.

Real institutional error correction therefore requires heterogeneity: replication teams rewarded for contradiction, engineers rewarded for finding boundary failures, long-horizon groups protected from product clocks, users able to reject elegant but unusable systems, and archives that retain negative results.

### Feynman: long thought joins audacity to adversarial honesty

[Richard Feynman's 1959 lecture “There's Plenty of Room at the Bottom”](#source-feynman-room-bottom) proposed a technically constrained research program around atom-scale manipulation, denser information storage, improved electron microscopy, miniaturized computing, and tiny machines. It was speculative, but not free association: he repeatedly separated what physical law allowed, what current instruments could do, and what he did not know how to build.

In 1982, [“Simulating Physics with Computers”](#source-feynman-quantum-simulation) made a different representation-changing move. Rather than only making classical computers faster, Feynman asked whether a machine governed by quantum mechanics was the proper instrument for simulating a quantum world. The enduring contribution was partly a change in what counted as a computer.

[Feynman's 1974 “Cargo Cult Science” address](#source-feynman-cargo-cult) supplies the necessary counterweight. The outward form of experiment is insufficient. Scientific integrity requires reporting the facts that might invalidate one's preferred explanation. A system that rewards only positive, novel, on-schedule results deletes precisely the information its error-correction mechanism needs.

Audacity without disconfirmation produces fashion. Disconfirmation without protected exploration produces safe incrementalism. Long-horizon research requires both.

## The synthesis: research is stateful, lossy, undecidable, and error-corrected

The four lenses combine into one institutional requirement:

- **Turing:** some valuable search paths cannot be made fully legible before they are explored.
- **Shannon:** handoffs and metrics are lossy channels, not transparent windows into value.
- **Von Neumann:** reliability requires genuinely independent error correction, not merely a larger count of similarly selected projects.
- **Feynman:** exploration must be paired with organized attempts to expose failure.

This is why the unit of analysis cannot be the isolated grant or paper. A long-thinking institution is a **stateful error-correcting search process**. It retains enough memory to compound, enough autonomy to change representations, enough diversity to avoid common-mode error, and enough contact with reality to kill attractive mistakes.

## Why the replacement institutions are indispensable—and insufficient alone

The old corporate laboratory should not be idealized. Bell Labs was coupled to a regulated and vertically integrated communications system that no policy memo can recreate; [its own institutional history records how research, development, manufacturing, and operating needs were reorganized repeatedly](#source-nokia-bell-history). Its parent economics, manufacturing base, and market structure mattered. Nor did the old system fund every important person or distribute opportunity fairly.

But the replacements divide functions that the integrated laboratory could sometimes hold together.

### Corporations: extraordinary development, selectively patient science

Business performs and funds most U.S. R&D. Large technology and biotechnology companies maintain frontier laboratories, build infrastructure no university can afford, and have produced major scientific advances. These are decisive counterexamples to any claim that corporate research disappeared.

The narrower claim is about selection and persistence. [Arora, Belenzon, and Patacconi](#source-arora-corporate-science) documented a decline in scientific publication by large corporations from 1980 to 2007 and associated it with globalization and narrower firm scope. Publications are an imperfect proxy, and their period ends before the current wave of hyperscale AI research. Still, the result is consistent with an appropriability problem: a firm may rationally value the patentable “golden eggs” of science more than the broad capability whose spillovers competitors can use.

### Academia: the source of open knowledge, not a complete transition system

[Universities performed $117.7 billion in R&D in FY2024](#source-ncses-herd-2024). Academic R&D is unusually concentrated in basic research—63 percent in 2024—and universities train the people on whom every other institution depends. The federal government funded 55 percent of academic R&D; universities themselves supplied 26 percent. The top 30 institutions accounted for 42 percent of the total. These are not the statistics of a peripheral system.

But academia cannot simply be assigned the functions abandoned elsewhere. Project grants, degree clocks, publication markets, and principal-investigator-centered groups reward discovery and training. They do not reliably pay for permanent engineering teams, product integration, standards, manufacturing, deployment, or decade-long maintenance. Graduate students are learners, not a cheap substitute for a stable technical workforce.

This is not an indictment of universities. It is a boundary condition. Asking academia to replace Bell Labs, a mission laboratory, a product organization, and a transition customer at once guarantees disappointment while obscuring what universities do exceptionally well. A separate article in this series examines grant incentives and the facilities-and-administrative-cost system in detail.

### FFRDCs: long-term by design, often task-ordered in operation

Federally funded research and development centers are the strongest apparent counterexample to the thesis. [The Federal Acquisition Regulation](#source-far-ffrdc) defines an FFRDC as meeting a “special long-term research or development need” that existing in-house or contractor resources cannot meet as effectively. It calls for continuity, objectivity, independence, sponsor familiarity, special access, and periodic review. [GAO's cross-agency review](#source-gao-ffrdc) likewise describes their special relationships and oversight obligations. This is close to a legal specification for institutional memory.

[The numbers do not support a claim of financial decline](#source-ncses-ffrdc-2024). The 42 FFRDCs spent $31.7 billion on R&D in FY2024, up from $17.7 billion in FY2014; NCSES estimates 3.3 percent average annual real growth over that decade, with a reporting change contributing to the final-year increase. In FY2024, about $6.5 billion was classified as basic research, $12.4 billion as applied research, and $12.9 billion as experimental development. FFRDCs include research laboratories, study-and-analysis centers, and systems-engineering-and-integration centers. Treating them as one kind of institution would be false.

The harder criticism is functional. Sponsor dependence can convert “long-term relationship” into a durable shell containing short task orders. [A 2024 GAO review of two DHS FFRDCs](#source-gao-dhs-ffrdc-2025) describes work initiated through task orders and found weaknesses in how the program office tracked sponsors' use of deliverables. That is one department and two centers, not a finding about all FFRDCs. It nevertheless demonstrates the mechanism.

Many FFRDCs are excellent engineering houses, systems integrators, operators of unique facilities, or sources of trusted technical advice. “Engineering house” should not be used as a slur; engineering is precisely the missing complement in much academic research. The limitation is that sponsor-responsive engineering is not equivalent to an autonomous portfolio of foundational discovery.

The diagnostic is **who owns problem selection**. If a sponsor defines the problem, deliverable, schedule, and acceptance test through a sequence of task orders, a center may still invent and execute at an exceptional level. Its governing logic, however, is contracted engineering: it is optimized to solve the questions presented to it, not to decide which unasked question deserves a decade. The distinction is functional, not honorific. An engineering house can be excellent at what it is; it still does not replace a research institution with protected epistemic initiative.

The defensible hypothesis is therefore not “FFRDCs are disappearing.” Their spending is rising. It is this:

> Some FFRDCs may be experiencing **role conversion**: preserving engineering, analysis, access, and sponsor memory while reducing the discretionary scientific search that the phrase “research and development center” leads outsiders to imagine.

That claim needs center-level evidence: the share of researcher-initiated work, continuity of technical teams between task orders, investment in reusable tools, publication and transition patterns, and sponsor tolerance for negative results. Until those data are collected, “declining role” is a question, not a conclusion.

### DARPA programs: a temporary laboratory

[DARPA can join](#source-darpa-pm-model) government need, ambitious technical leadership, multiple performers, hard milestones, and unusual risk tolerance. Fixed program-manager tenure and finite programs create urgency. They can also create a temporary laboratory more coherent than any single performer.

The program ends by design. The unresolved question is who is paid to preserve the shared test infrastructure, code, negative results, team relationships, and transition work afterward. That is not a defect in DARPA's model; it is a missing complementary institution.

### Startups: a transition engine, not a research commons

A startup can take one difficult invention through integration, user experience, compliance, procurement, support, and repeated product redesign. Those are substantive technical acts. Venture incentives rightly demand focus.

The same focus makes a startup an implausible custodian of a broad research commons. It cannot rationally retain every adjacent capability whose return will spill to future firms or unknown public uses. Commercialization is not contamination. It is one stage that fails when asked to finance all the stages before it.

## The strongest alternative explanations

The thesis should lose if stronger explanations fit the evidence.

**Ideas may simply be harder to find.** [Bloom, Jones, Van Reenen, and Webb](#source-bloom-idea-productivity) show rising research effort alongside declining measured research productivity in semiconductors, agriculture, medicine, and aggregate growth. Their measures ask how much effort is needed to sustain exponential improvement, a choice that has been debated. Even if their interpretation is correct, it does not make institutions irrelevant. Harder problems increase the need to preserve knowledge and coordinate teams. But it cautions against attributing every productivity trend to organizational decline.

**Research may have moved rather than decayed.** Hyperscale computing, modern biotechnology, open-source communities, national laboratories, FFRDCs, and international collaboration support this view. It is partly true. The thesis concerns concentration, complementarity, and persistence—not a claim that discovery stopped.

**The famous laboratories are selected memories.** We remember the transistor, information theory, UNIX, and the graphical interface, not every failed project or quiet decade. This survivorship objection is powerful. The correct comparison must include waste, capture failures, monopoly subsidy, and opportunity costs. Nostalgia is not a control group.

**Digital tools reduce the need for co-located institutions.** Open repositories, cloud compute, AI, and global collaboration can reduce search and coordination costs. They can also accelerate noise, concentrate compute, and leave physical facilities, trust, tacit knowledge, and accountability unresolved. Whether the net effect substitutes for institutional continuity is empirical.

**Current output may be enough.** The United States remains extraordinarily productive in science and technology. Perhaps institutions need only produce papers, patents, trained people, and companies, allowing markets and networks to recombine them. The weak point is the handoff product: if transition probabilities are high and lost capability is cheap to rebuild, the state argument collapses.

## What would falsify this argument

The claim should be weakened or rejected if longitudinal evidence shows that, after controlling for field and mission:

- technical teams and specialist career tracks survive at stable or improving rates across project boundaries;
- code, data, instruments, negative results, and experimental protocols are reused rather than repeatedly rebuilt;
- foundational work reaches deployment without an increasing number of unfunded institutional handoffs;
- concentration does not reduce independent technical pathways or access to frontier infrastructure;
- the time and cost required to reconstitute dispersed capability are low;
- early-career researchers receive durable apprenticeship rather than only task-specific labor;
- acquisitions and reorganizations preserve autonomy, facilities, and initiation of new long-horizon work five and ten years later.

These are harder to collect than expenditure totals. That is exactly the point.

## A national capability balance sheet

The immediate policy recommendation is not another aggregate target. It is a second set of accounts beside R&D expenditure:

| Capability account | Question to measure |
|---|---|
| Team continuity | What fraction of critical teams remains intact three and five years after a project? |
| Discretionary search | What share of expert time can pursue sponsor-relevant uncertainty not already attached to a deliverable? |
| Memory | Are failures, code, data provenance, and design decisions accessible and reused? |
| Apprenticeship | Do institutions maintain stable technical roles through which judgment passes between generations? |
| Independent correction | How many genuinely independent replications, red teams, or competing technical paths exist? |
| Physical and computational infrastructure | Who pays to maintain facilities, compute, testbeds, and instruments between projects? |
| Transition ownership | Which funded organization is accountable from prototype through adoption, integration, and maintenance? |
| Reconstitution cost | How long and how much would it take to rebuild a dispersed capability? |

These measures will be field-specific and partly qualitative. A synthetic “national capability score” would create the same false precision this article criticizes. The balance sheet should expose tradeoffs, not conceal them in one number.

## Five different verdicts

The nearly trillion-dollar system is not one success or one failure.

- **Scientifically**, it produces enormous quantities of important knowledge.
- **Technically**, it builds systems and instruments of extraordinary sophistication.
- **In transition**, outcomes vary sharply because complementary assets and accountable owners are uneven.
- **Institutionally**, the relevant stock is poorly measured, plausibly more concentrated, and vulnerable at project boundaries.
- **In public value**, the spillovers are vast, but no payer can capture enough of them to make all socially valuable capability privately rational.

The controversial conclusion is not that the system cannot think. Individual researchers, teams, universities, companies, FFRDCs, and programs clearly can. It is that the system does not reliably **retain the state required to think longer than the contracts connecting its parts**.

IBM's announced HRL agreement and SRI's integration of PARC may prove to be renewal, rescue, concentration, or some mixture. The correct test will not be the press release or the acquisition price. It will be whether the combined institutions still have the people, autonomy, tools, memory, and mandate to begin work in 2031 whose value cannot yet be made legible in 2026.

That is what a nearly trillion-dollar expenditure total cannot tell us.
