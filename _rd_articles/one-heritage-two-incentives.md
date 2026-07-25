---
title: One Heritage, Two Incentive Systems
article_number: 3
article_slug: one-heritage-two-incentives
permalink: /rd-ratchet/one-heritage-two-incentives/
article_status: Draft
published: true
dek: >-
  The 1996 Bell Labs split created a structured institutional comparison: related research traditions serving an equipment maker and a network-services business.
date: 2026-07-24
updated: 2026-07-24
version: "0.2"
version_sequence: 2
revision_summary: Cross-series review replaced causal-experiment shorthand with explicit comparative predictions and a sharper boundary from Article 2.
reading_time: 13
central_claim: Research culture does not determine its own future; the parent organization’s customers, assets, operating problems, product cycles, and ability to capture spillovers determine which parts of that culture remain fundable.
claim_status: Provisional comparative argument; two internships are bounded observations, not representative institutional samples
hero_image: /assets/images/rd-ratchet/articles/article-03-two-incentive-systems.webp
hero_alt: A bell, telephone, transistor, and luminous research lineage branch toward an experimental fabrication laboratory above and a network operations center below.
hero_caption: Conceptual comparison; it is not an organization chart and does not assign outcomes to particular people.
source_ids:
  - nokia-bell-history
  - nasem-telecom-research-2006
  - att-lucent-spinoff-1996
  - karim-patent-record
  - arora-corporate-science
evidence_chart:
  kicker: The 1996 split
  title: The former Bell Labs research component was divided asymmetrically
  summary: The National Academies described about one quarter of the research component moving to AT&T Labs and the larger share moving with Lucent. The approximation maps institutional inheritance, not later quality or productivity.
  aria_label: About 25 percent of the former Bell Labs research component went to AT&T Labs, while approximately 75 percent went with Lucent, based on the National Academies' qualitative reconstruction.
  source_id: nasem-telecom-research-2006
  note: Approximate shares inferred from “about one-fourth” going to AT&T; significant development resources also moved, and the report does not present this as a precise audited allocation.
  bars:
    - { label: "AT&T Labs", value: "~25%", percent: 25, tone: blue }
    - { label: "Lucent / Bell Labs", value: "~75%", percent: 75, tone: orange }
argument_map:
  kicker: Source-linked argument map
  title: Same heritage does not mean the same feasible research portfolio
  summary: The comparison moves from the documented split to a mechanism involving different complementary assets and customer feedback.
  caption: It does not rank the two laboratories or infer their entire cultures from the author’s two internships.
  nodes:
    - role: Documented observation
      title: One system became two research organizations
      text: Most Bell Labs resources moved with Lucent’s equipment business; a smaller group formed AT&T Labs around a services and network business.
      source_ids: [nokia-bell-history, nasem-telecom-research-2006]
    - role: Bounded firsthand contrast
      title: Two internships exposed different problem interfaces
      text: The author’s 2001 Lucent and 2007 AT&T Research experiences supply local observations separated by six years and different roles.
      source_ids: [karim-patent-record]
    - role: Proposed mechanism
      title: Parent assets change which spillovers are capturable
      text: Equipment production and network operations offer different data, users, transition channels, and time pressures.
      source_ids: [arora-corporate-science, nasem-telecom-research-2006]
    - role: Bounded conclusion
      title: Evaluate the whole research-to-use path
      text: Research autonomy should be assessed together with the parent’s ability and incentive to test, absorb, and sustain the resulting capability.
      source_ids: [nasem-telecom-research-2006, karim-patent-record]
objection_ladders:
  - claim: The Lucent/AT&T split shows that parent-business incentives shape research portfolios.
    first_objection: The organizations differed in people, scale, timing, and leadership; attributing differences to equipment versus services is an uncontrolled comparison.
    first_response: Correct. The split is not a causal experiment in the statistical sense. It is a structured comparison that identifies mechanisms to test against projects and longer records.
    second_objection: If every difference can be assigned to an unobserved factor, the comparison may generate an appealing story but no discriminating evidence.
    conclusion: >-
      Make project-level predictions: operator research should more often exploit network data and operational feedback, while equipment research should more often exploit design, manufacturing, and product integration. Reject the mechanism where records do not show those patterns.
    source_ids: [nasem-telecom-research-2006, arora-corporate-science]
  - claim: Operational proximity gives AT&T Labs a transition advantage.
    first_objection: An operator can also suppress disruptive work that threatens its installed network, while an equipment vendor can sell innovation to many operators.
    first_response: Proximity is not automatically beneficial. It supplies data and users but can narrow the questions deemed relevant or safe.
    second_objection: Then “proximity” predicts both adoption and suppression and has no explanatory force.
    conclusion: >-
      Separate access from authority: measure whether researchers can initiate work, test it against real systems, and obtain a funded path to deployment. Operational data alone is not a transition system.
    source_ids: [nasem-telecom-research-2006, karim-patent-record]
corrections: []
---

In 2001 I entered the Lucent branch of the Bell Labs inheritance. In 2007, during graduate school, I interned at AT&T Research. The temptation is to turn those experiences into a clean before-and-after comparison. They were nothing of the kind. They were two bounded views, six years apart, involving different work, different colleagues, and different stages of my own development. <span class="rd-evidence-token" data-evidence="M">M</span>

Yet the pair reveals a question that organizational histories often hide. In 1996, a research institution with a shared heritage was divided between two parent businesses. Most of Bell Labs and the equipment operation went to Lucent. A smaller group stayed with AT&T and formed AT&T Laboratories. If “research culture” were self-sustaining, the two descendants should have remained broadly similar. If the parent’s economic system matters, their feasible portfolios should diverge.

The comparison is not a contest over which descendant was better. It asks what each parent could see, use, pay for, and capture.

Calling the split a “natural experiment” would overstate the evidence. Here it is an organizational shorthand at most, not causal identification: people, scale, timing, technical portfolios, and leadership all differed. The comparison earns its keep only by generating project-level predictions that contrary records can defeat.

## The split changed the return path

[Nokia Bell Labs’ institutional history](#source-nokia-bell-history) and the [National Academies’ reconstruction](#source-nasem-telecom-research-2006) agree on the essential structure. Lucent received most of Bell Labs along with the equipment business. AT&T retained about one quarter of the research component, plus development resources, to support a communications-services company moving into wireless and broadband. [AT&T’s stockholder record](#source-att-lucent-spinoff-1996) fixes the legal spinoff date at September 30, 1996. <span class="rd-evidence-token" data-evidence="D">D</span>

Those arrangements created different loops.

For an equipment company, research could return value through differentiated hardware and software, intellectual property, standards positions, systems integration, and equipment sales. Manufacturing and product groups were complementary assets. The risk was sector concentration: when carriers stopped buying, an expensive research portfolio was exposed to the same contraction.

For a network-services company, research could return value through operating efficiency, reliability, security, traffic understanding, customer experience, and new services. A live network supplied unusual data and hard operational constraints. The risk was a different kind of narrowing: work with broad scientific value might offer too little proprietary advantage to one operator, while disruptive architectures could conflict with installed infrastructure.

Neither parent is naturally patient or impatient. Each is patient about the uncertainties it can justify within its own return path.

## A small technical window into the operator side

My 2007 AT&T work involved filtering unwanted Internet traffic with Bala Krishnamurthy and collaborators. The public patent record includes two related granted patents on filtering unwanted IP traffic through blacklists. [Those records establish the disclosed inventions](#source-karim-patent-record); they do not establish deployment, revenue, or the fate of the surrounding team. <span class="rd-evidence-token" data-evidence="M">M</span> <span class="rd-evidence-token" data-evidence="D">D</span>

The problem illustrates the operator research loop. Abuse was not an abstract benchmark. A network operator confronted malicious or unwanted traffic as an operational burden. It possessed traffic knowledge, customer relationships, infrastructure constraints, and enforcement points that a detached research group would have to reconstruct. The setting could make a research question more exact: false positives, update latency, adversarial adaptation, and per-customer policy were not afterthoughts.

But proximity did not settle transition. A patent is evidence of a protectable invention. It is not evidence that production systems changed. Between a research result and an operational capability lie integration, reliability, privacy review, support, incentives for deployment teams, and the risk of changing a functioning network. The operator can possess the necessary assets while still lacking a funded owner for the crossing.

This is why “close to the customer” is too loose. Research needs at least four distinct forms of proximity:

1. access to the problem and its real boundary conditions;
2. access to data, instruments, or operational feedback;
3. authority to start work that may contradict current assumptions; and
4. a funded organization accountable for adoption if the work succeeds.

An institution may have the first two and lack the last two.

## Culture follows the feasible frontier

Researchers carry habits across reorganizations: standards of proof, taste in problems, expectations about publication, and networks of collaborators. Those habits matter. But over time the fundable portfolio is selected by the parent system. Hiring follows it. Tools and facilities follow it. Junior people learn from the work that survives. What begins as a financial boundary eventually becomes a cultural boundary.

[Arora, Belenzon, and Patacconi’s study of corporate science](#source-arora-corporate-science) provides evidence for a broader version of this mechanism. Large firms’ scientific publishing declined substantially during the period they study, and the authors connect the change to narrower firm scope and weaker ability to capture value from science. The study does not rank Lucent and AT&T, and publication is not equivalent to capability. It supports the proposition that firm boundaries affect what research is privately rational. <span class="rd-evidence-token" data-evidence="D">D</span>

The phrase **feasible research frontier** is useful here. It means the set of uncertain questions a parent can fund given its customers, assets, cash flows, risk tolerance, and available transition paths. A brilliant director can move that frontier. A strong culture can resist its contraction. Neither can abolish it.

## The strongest counterargument

The Bell split is badly confounded. Lucent and AT&T inherited different numbers of people. Six years separated my internships. The telecommunications crash intervened. The organizations changed through mergers. Any observed difference could reflect technical field, local management, or historical moment rather than business model.

That objection prevents a causal claim, but it does not make the comparison empty. It converts the thesis into predictions that can be checked across projects and institutions.

- Equipment-linked groups should have stronger paths through design, manufacturing, and vendor standards, and greater exposure to equipment cycles.
- Operator-linked groups should have stronger paths to live-network data and operational testing, and greater pressure toward problems with direct service value.
- Work whose benefits spill beyond either parent should be the first to need public, consortial, or cross-company support.

If project histories do not show these patterns, the mechanism should be narrowed or rejected. Interviews should actively seek counterexamples: foundational work protected by an operator, deployment blocked inside an equipment firm despite complementary assets, and important research that flourished after moving outside both.

## Five different verdicts

- **Scientific success:** Both descendants carried serious researchers and produced knowledge; the comparison does not establish a scientific winner.
- **Technical success:** Each parent offered different technical complements—equipment design and integration on one side, operational networks and feedback on the other.
- **Transition success:** Possessing relevant assets improved the possibility of transition but did not create an accountable transition owner automatically.
- **Institutional success:** The split preserved multiple nodes of the Bell tradition while fragmenting the earlier end-to-end system.
- **Public-value success:** Diffusion may have spread talent and ideas, but research with broad spillovers became harder for any one descendant to justify.

## What the successor must learn

There is no neutral container for research. A successor laboratory needs several return paths precisely because any one parent business narrows the feasible frontier. It should connect researchers to operational users and manufacturing partners without allowing either interface to define the entire portfolio. It should track which public benefits escape every sponsor’s accounting and fund those benefits explicitly.

The governance consequence is concrete: research proposals should state not only a technical goal but also the complementary assets required to test and use the result. Portfolio reviews should ask which of those assets are controlled, which are merely promised, and which will disappear before the research matures.

The open question is not whether Lucent or AT&T inherited the “real” Bell Labs. It is which combinations of people, assets, users, and authority each inheritance made possible—and which questions fell into the gap between them.
