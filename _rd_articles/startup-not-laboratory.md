---
title: The Startup Is Not a Research Laboratory
article_number: 12
article_slug: startup-not-laboratory
permalink: /rd-ratchet/startup-not-laboratory/
article_status: Draft
published: true
dek: A startup can carry one invention across the brutal distance to a product, but it cannot rationally maintain the broad research commons from which that invention emerged.
date: 2026-07-24
updated: 2026-07-25
version: "0.3"
version_sequence: 3
revision_summary: Added interacting venture, company, and research clocks; a spinout boundary compact; frontier-company counterexamples; and explicit falsifiers.
reading_time: 20
central_claim: Venture-backed startups are specialized transition institutions rewarded for focus, speed, demand, and company-level value; asking them to preserve broad, weakly appropriable research capability confuses commercialization with stewardship of a commons.
claim_status: Provisional firsthand analysis of one spinout, bounded by public transition records and broader venture-capital evidence
hero_image: /assets/images/rd-ratchet/articles/article-12-startup-not-laboratory.webp
hero_alt: A startup team selects one path from a broad research commons and carries a product across a clock-bound bridge of testing, integration, compliance, manufacturing, delivery, and support.
hero_caption: Conceptual illustration; it does not disclose Confidencial.io customer, financing, or product-confidential information.
source_ids:
  - sri-confidencial-announcement-2022
  - nber-vc-decisions-2016
  - teece-appropriability-1986
  - darpa-race
  - karim-project-record
evidence_chart:
  kicker: Evidence base on venture decisions
  title: A large survey reached hundreds of venture firms and investors
  summary: The survey documents how institutional venture capitalists report selecting, supporting, and exiting investments. It does not establish that every fund or startup follows one clock.
  aria_label: The cited study surveyed 885 institutional venture capitalists at 681 venture capital firms.
  source_id: nber-vc-decisions-2016
  note: Respondent and firm counts overlap conceptually but are different units; bars show study scope, not a performance comparison.
  bars:
    - { label: "Venture-capital respondents", value: "885", percent: 100, tone: blue }
    - { label: "Venture-capital firms", value: "681", percent: 76.9, tone: green }
argument_map:
  kicker: Source-linked argument map
  title: Product transition solves a different optimization problem from research stewardship
  summary: The map credits the transition function before identifying the public-good capability it cannot be expected to fund.
  caption: The conclusion concerns incentive fit, not the virtue of founders, investors, customers, or researchers.
  nodes:
    - role: Documented observation
      title: A 2021 spinout reached seed financing in 2022
      text: The firsthand chronology dates the Confidencial.io spinout to 2021; SRI’s June 2022 announcement documents its DARPA Brandeis and RACE roots, seed financing, and beta launch.
      source_ids: [sri-confidencial-announcement-2022, darpa-race]
    - role: Transition obligation
      title: The technical form had to change
      text: The product path required current standards, integration into existing applications, usability, customers, and support—not merely the original research artifact.
      source_ids: [sri-confidencial-announcement-2022]
    - role: Proposed mechanism
      title: Venture selection narrows the objective
      text: Investors evaluate teams, markets, deal structure, value creation, and exits at the company level; broad uncapturable research benefits do not pay the startup’s obligations.
      source_ids: [nber-vc-decisions-2016, teece-appropriability-1986]
    - role: Bounded conclusion
      title: Couple, do not conflate, the institutions
      text: Laboratories should produce options and reusable knowledge; startups should productize selected options; public or consortial funding should replenish the commons.
      source_ids: [teece-appropriability-1986, sri-confidencial-announcement-2022]
objection_ladders:
  - claim: A startup cannot be expected to maintain a broad research commons.
    first_objection: Many frontier companies conduct excellent research and publish foundational work; firm formation can create the focus and capital a laboratory lacks.
    first_response: Correct. A startup can perform deep research when that research advances its product or strategic option. The limitation concerns broad work whose return escapes the company.
    second_objection: Large laboratories also narrow portfolios, while a successful startup can later fund wide research from profits.
    conclusion: Classify by incentive and capability, not age or label. Ask whether protected inquiry, reusable infrastructure, independent correction, and apprenticeship survive when they are not tied to the current product thesis.
    source_ids: [nber-vc-decisions-2016, teece-appropriability-1986]
  - claim: Venture-scale exits are a narrower replacement incentive for research institutions.
    first_objection: An exit is a financing and ownership event, not necessarily short-termism; acquisitions can give technology the assets needed to scale.
    first_response: Yes. The relevant pressure is dependence on a small number of company-level liquidity outcomes, not the moral status of an acquisition or public offering.
    second_objection: Without financing, much research would never reach users, so criticizing exit incentives may privilege unused invention.
    conclusion: Preserve the venture transition channel while funding the precompetitive research commons separately; evaluate an exit by capability and adoption after the transaction, not by valuation alone.
    source_ids: [nber-vc-decisions-2016, sri-confidencial-announcement-2022]
corrections: []
---

Confidencial.io spun out of SRI in 2021 to carry selected privacy and security research toward customers. I moved from a full-time SRI role into building the company while remaining part-time at SRI through early 2023 to finish the DARPA programs. Confidencial.io raised its seed financing in 2022. This was not a simple relocation of the same work. It changed the objective function. <span class="rd-evidence-token" data-evidence="M">M</span>

At a research institute, a technically interesting property can justify a paper, a prototype, a program, or the next proposal. At a startup, the same property must survive integration with software people already use, deployment environments the researcher does not control, procurement, security review, support, pricing, and the possibility that the customer’s urgent problem is not the one the research solved. <span class="rd-evidence-token" data-evidence="M">M</span>

That work is sometimes dismissed as “non-research overhead.” It is not overhead to transition. It is the transition system.

## What crossed the boundary

[SRI’s June 2022 announcement](#source-sri-confidencial-announcement-2022) documents Confidencial.io’s SRI origins, its roots in the DARPA Brandeis and RACE programs, its seed investors, and its private-beta launch after twelve months of development. The announcement date is not the spinout date. It also describes a critical redesign: rather than require customers to adopt every research primitive, the product used current cryptographic standards in a form intended to evolve with standards. <span class="rd-evidence-token" data-evidence="D">D</span>

That is not the abandonment of research. It is selection under a new constraint. The research program could ask whether a mechanism was possible and secure under a model. The company had to ask whether it was deployable inside actual workflows, understandable to users, supportable by a small team, and valuable enough that an organization would pay for it.

The public record is necessarily incomplete. It establishes SRI origins, research roots, the June 2022 financing and beta stage, and the stated product direction. The 2021 spinout date and the part-time SRI overlap through early 2023 are firsthand chronology. Neither category discloses customer-confidential information, current finances, internal product decisions, or the success of any deployment. Firsthand discussion here remains at the level of institutional mechanism. <span class="rd-evidence-token" data-evidence="M">M</span> <span class="rd-evidence-token" data-evidence="D">D</span>

## Venture-scale exits, stated precisely

The phrase **venture-scale exits** can sound like jargon. It means ownership or liquidity outcomes large enough to return a venture fund’s concentrated, high-risk portfolio—typically an acquisition or public offering, sometimes a substantial secondary transaction. It does not mean that every investor demands a quick sale or that every acquisition is destructive.

Liquidity is not synonymous with short-termism. An acquisition can supply manufacturing, distribution, compliance, capital, or customers that make a long technical path viable; an independent company can also optimize prematurely for its next financing. The relevant question is which company-level outcome the capital structure rewards, over what horizon, and what happens afterward to the product and the wider capability.

The structural point is portfolio mathematics. A venture fund expects many investments not to return the fund and a small number of outcomes to matter greatly. A company seeking that capital must present a path to large company-level value. Broad scientific spillovers, standards, negative results, and tools used mainly by others may be socially valuable while contributing little to that path.

[Gompers, Gornall, Kaplan, and Strebulaev surveyed 885 institutional venture capitalists at 681 firms](#source-nber-vc-decisions-2016). Their study covers sourcing, selection, valuation, deal structure, value-added, exits, and relationships with limited partners. It shows substantial variation rather than one universal playbook. It also confirms that exit and company selection are explicit elements of the institution. <span class="rd-evidence-token" data-evidence="D">D</span>

A startup is therefore not a smaller Bell Labs. It is an institution optimized to make one selected technical and market thesis survive.

## Three clocks, not one runway

“Startups are short-term” is too crude. At least three clocks interact.

The **company clock** is cash, customer evidence, hiring, product reliability, and the next financing or sustainable revenue point. The **fund clock** is the investor's portfolio life, reserves, ownership, follow-on strategy, and eventual liquidity obligations to limited partners. The **research clock** is the time required for a scientific or technical uncertainty to become legible.

The clocks can align. A deep technical result may be the only route to a large market, patient investors may finance it, and milestone evidence may arrive before cash is exhausted. They can also conflict. A scientifically decisive experiment may produce no customer evidence; a product integration may create revenue while teaching little about the foundational claim; a strategically valuable research option may mature after the fund's relevant horizon.

The effective horizon is not the longest clock. It is the shortest indispensable one. Twenty-year scientific ambition does not create a twenty-year institution if the company must demonstrate a financeable market in eighteen months. Conversely, a short runway does not imply shallow work if the next experiment produces hard evidence and unlocks a durable capital path.

This yields a more exact criticism of venture-scale exits. The problem is not that liquidity exists. It is that a broad public research portfolio cannot rely on a small number of company-level liquidity events as its replenishment mechanism. The winning company captures one selected path; abandoned adjacent options and shared infrastructure disappear from its objective even when their social value remains high.

## The missing middle is the product

The distance from a paper or patent to a supported product contains work that research accounting routinely hides:

- translate a security model into threat boundaries a customer can evaluate;
- integrate with identity, documents, networks, and applications already in use;
- manage installation, upgrades, telemetry, and failure recovery;
- satisfy compliance, procurement, contracting, and security-review requirements;
- design interfaces that ordinary users will not route around;
- support deployments and revise the system when assumptions meet reality;
- build sales and partnerships that locate actual demand.

None of these tasks guarantees success. All consume time that a paper prototype did not budget. Some create new research questions. Others are disciplined engineering or organizational work. The category matters less than the responsibility: someone must own them.

[Teece’s appropriability framework](#source-teece-appropriability-1986) explains why. Technical knowledge creates value only in combination with complementary assets such as production, distribution, service, and customer access. A startup is one way to assemble those assets around a focused invention. A license to an incumbent, standards route, or government procurement path may be better for another technology.

## Why the startup cannot replenish the commons

The startup’s focus is a feature. It says no to adjacent questions, elegant generalizations, and infrastructure that does not advance survival. Yet the research commons depends precisely on many things no focused company can fully capture:

- general methods that help competitors as well as the firm;
- replication and negative results;
- long-lived datasets and testbeds;
- training across several technical directions;
- speculative work whose relevant market does not yet exist;
- maintenance of tools whose users are distributed across institutions.

Asking a startup to fund those goods from scarce venture capital is not noble. It is a design error. If it tries to serve every possible future, it may fail to deliver the present product. If it focuses rationally, the commons goes unfunded unless another institution owns it.

This is the connection to the nearly trillion-dollar paradox. Commercialization vehicles can be excellent at transition and still be incapable of maintaining the precompetitive state on which successive transitions depend.

## The spinout boundary needs a constitution

A spinout should not be handled as an informal division between “what the founders take” and “what the laboratory keeps.” The boundary determines whether the company can operate and whether the research commons remains generative.

| Boundary object | Company needs | Originating institution and public need | Review trigger |
|---|---|---|---|
| IP and know-how | Coherent freedom to build, finance, and defend the selected product field | Rights for unrelated fields, research use, public obligations, and reversion if the option is warehoused | Financing, field expansion, nonuse, acquisition, or abandonment |
| People | A team capable of product and customer execution | A deliberate decision about which broader capabilities and apprentices remain | Critical-role departure or loss of predecessor capability |
| Software and data | Buildable artifacts, provenance, permissions, and update rights | Preservation of reusable nonspecific tools and lawful access for continuing research | Material architecture, license, or data-source change |
| Facilities and testbeds | Reliable access during transition | Fair scheduling, cost recovery, security, and future users | Company independence or facility saturation |
| Research pipeline | Ability to pursue product-relevant uncertainty | Freedom for the laboratory to continue adjacent or competing research | Conflict, publication, or exclusivity dispute |
| Public transition obligation | A credible path to users and support | Evidence that public capital did not fund a permanently closed option | Failure to meet adoption or access milestones |

The compact must be staged. Early exclusivity may be necessary for financing. Permanent breadth is rarely necessary before the product field is known. Milestone-based, field-limited rights allow the company to invest while preventing a single transition vehicle from owning all future interpretations of the underlying research.

The originating institution also needs to avoid the opposite error: retaining fragmented rights, approvals, or dependencies that make the company unfinanceable and incapable of serving customers. A spinout with no coherent residual authority is not a transition owner; it is another handoff queue.

## The strongest counterargument

Startups have produced frontier AI, biotechnology, space systems, semiconductors, and security technology. Large firms often began as startups. Some companies invest heavily in research because the technical frontier is the product. Why deny them the name “research laboratory”?

The answer is not a naming prohibition. It is a functional test. A young company may contain a genuine laboratory. The questions are whether it can protect inquiry whose outcome is uncertain, maintain more than the current product path, preserve infrastructure between financing cycles, reward correction that delays launch, and train people across a horizon longer than its cash runway.

Some pass those tests for a period. The claim is not that startups cannot do research. It is that the venture institution is not rewarded to maintain broad public capability when that capability does not increase company value.

Frontier companies are the strongest counterexample. In AI, biotechnology, space, and semiconductors, the research frontier can be inseparable from the product and the company may assemble infrastructure no public or academic institution currently matches. Such a company can think long when technical progress drives enterprise value and capital remains patient.

But the counterexample sharpens the public question. Access to the frontier may become conditional on employment, platform terms, proprietary data, compute allocation, or one board's capital strategy. The company can be an extraordinary laboratory and still be an incomplete national research system. Scientific depth inside the firm does not guarantee plural independent paths, broad access, negative-result publication, or continuity after a strategic turn.

The mirror-image error is romanticizing research organizations that never transition. A commons without product, procurement, standards, or deployment pathways can accumulate papers while failing the users who funded it. The two institutions need each other.

## What would falsify the institutional distinction?

The article should be weakened if venture-backed companies routinely preserve broad, weakly appropriable research capability across financing cycles: multiple product-independent lines, shared infrastructure available beyond the firm, publication of disconfirming work, durable apprenticeship, and continued support after the immediate company thesis changes.

It should also weaken if separate public or nonprofit commons are unnecessary because labor mobility, open source, standards, and investor competition reliably regenerate whatever a focused startup abandons. The test is reconstitution time and lost option value, not whether former employees find good jobs.

The Confidencial.io case cannot establish the general result. It can test the boundary compact: what state moved, what remained available to SRI and the public under applicable rights, which research assumptions changed under product constraints, and which capabilities survived the overlapping 2021–early 2023 period. Those questions require future evidence and appropriate confidentiality boundaries. <span class="rd-evidence-token" data-evidence="A">A</span>

The mirror falsifier matters equally. If commons-funded laboratories repeatedly produce artifacts with no credible adopter while spinouts convert comparable work into maintained use, the series must give transition institutions greater weight. Preserving capability is not a public success when the capability never reduces a consequential uncertainty or reaches a user.

## Five different verdicts

- **Scientific success:** The predecessor research generated cryptographic and systems ideas; the startup is not the sole owner of that scientific lineage.
- **Technical success:** Productization subjects selected ideas to integration, reliability, usability, and operational constraints absent from a research prototype.
- **Transition success:** A company creates accountable ownership for adoption, but beta launch, financing, or an exit is not itself proof of durable deployment.
- **Institutional success:** The startup builds product and customer capability while intentionally narrowing the broader research portfolio.
- **Public-value success:** Useful products can create large public benefit; the company cannot be expected to preserve every spillover or predecessor capability.

## What the successor must learn

The successor laboratory should embed transition partners from the beginning without turning itself into their outsourced engineering department. It should maintain multiple routes—open standards, licensing, procurement, spinouts, and company partnerships—and select among them using a complementary-assets map.

When a spinout is chosen, the compact should specify what moves and what remains. The company needs coherent IP, people, and operating freedom. The research institution and public sponsor need a plan for reusable tools, nonexclusive fields, archives, and future research that should not depend on the startup’s runway.

The open question is not whether startups are good or bad for research. It is who replenishes the commons after a startup rationally selects the small part of it that can become a company.
