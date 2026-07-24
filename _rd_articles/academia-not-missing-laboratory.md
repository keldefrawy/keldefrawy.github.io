---
title: The University Is Not the Missing Laboratory
article_number: 7
article_slug: academia-not-missing-laboratory
permalink: /rd-ratchet/academia-not-missing-laboratory/
article_status: Draft
published: false
dek: Universities are indispensable to basic research and scientific training. Their grant, publication, labor, and overhead systems still cannot substitute for an institution that owns durable capability from question through deployment.
date: 2026-07-23
updated: 2026-07-23
version: "0.1"
version_sequence: 1
revision_summary: Private working draft; not a public version
reading_time: 18
central_claim: The academic research system is optimized to fund projects, publish knowledge, and train people; it underfunds the stable technical teams, shared infrastructure, negative-result memory, and transition ownership needed to function as a complete long-horizon R&D institution.
claim_status: Provisional; national expenditure and cost rules are documented, while incentive effects vary by field and institution
hero_image: /assets/images/rd-ratchet/rd-ratchet-hero.webp
hero_alt: A university research network produces papers and trained people while long-lived engineering, infrastructure, and transition functions remain only partially connected.
hero_caption: Conceptual illustration. It does not represent one university or imply that all fields share the same funding model.
source_ids:
  - ncses-herd-2024
  - ncses-rd-2026
  - azoulay-incentives
  - wang-novelty
  - smaldino-bad-science
  - nasem-integrity
  - gao-grant-burden
  - gao-nih-indirect
  - gao-nsf-indirect
  - nih-indirect-guidance-2025
  - first-circuit-nih-2026
  - feynman-cargo-cult
  - shannon-bandwagon
  - far-ffrdc
corrections: []
---

The American university did not fail to become Bell Labs. It was never designed to be Bell Labs.

That distinction matters because universities are now asked to absorb nearly every function shed by other parts of the R&D system. They are expected to produce basic knowledge, train the workforce, maintain expensive facilities, comply with expanding public rules, generate regional startups, license inventions, repair social inequality, and deliver technologies ready for national missions—all while competing for finite project grants and publishing enough visible novelty to sustain institutional prestige.

The result is not simply underfunding. It is a mismatch between the unit being financed and the capability being demanded.

## Begin with what academia does exceptionally well

[U.S. higher-education institutions reported **$117.7 billion** in R&D expenditure in FY2024](#source-ncses-herd-2024), up 8.1 percent in current dollars from FY2023. The federal government funded 55 percent; the institutions themselves funded 26 percent; nonprofits, businesses, and state and local governments supplied most of the rest. [Academic R&D is structurally different from business R&D](#source-ncses-rd-2026): 63 percent was basic research, 27 percent applied research, and 10 percent experimental development.

The scale is concentrated. The 30 largest performers accounted for 42 percent of higher-education R&D, and 28 of those 30 had medical schools. Field composition is concentrated too: health sciences and biological and biomedical sciences together accounted for half of total academic R&D. These facts do not diminish the work. They show that “academia” is not one diversified national laboratory. It is a federation of institutions, fields, funders, and principal investigators with very different cost structures and missions. [NCSES documents the full distribution](#source-ncses-herd-2024). <span class="rd-evidence-token" data-evidence="D">D</span>

Universities preserve three things that no successor R&D system should weaken:

1. permission to publish knowledge openly;
2. intellectual communities not wholly owned by one product or mission customer;
3. education through participation in unresolved problems.

The claim of this article is not that academia is unproductive or corrupt. It is that these virtues do not, by themselves, supply permanent systems engineers, instrument builders, research software maintainers, manufacturing paths, procurement authority, deployment owners, or long-lived mission memory.

## The principal investigator as a temporary firm

Much academic research is organized around a principal investigator who assembles a temporary production unit from grants. The grant may support students, postdoctoral researchers, staff, equipment, travel, and part of the investigator's salary. A successful group wins another grant before the first expires. A very successful investigator operates several overlapping units and spends increasing time raising, coordinating, and reporting their capital.

This resembles entrepreneurship, and often in its best form. It also has three structural consequences.

First, labor continuity and scientific continuity separate. A paper's question can persist for a decade while the students and postdocs who know the apparatus turn over every few years. The university retains the publication; it may not retain the working team.

Second, shared technical capability becomes residual. A research software engineer, instrument specialist, data steward, or long-term project manager rarely maps cleanly to one hypothesis. If no project can charge the whole role, every project has an incentive to pay only its marginal share and hope another account sustains the person between awards.

Third, proposal competence becomes a survival trait. Writing a persuasive forecast of discovery is not the same activity as making the discovery. Yet the system must select using proposals because the work does not yet exist. This is unavoidable to a point. It becomes destructive when the forecast consumes the work or when deviation from it threatens renewal.

The university can therefore contain brilliant long-horizon researchers while the operating system beneath them remains short-horizon.

## Four clocks, one laboratory

An academic group is governed simultaneously by at least four clocks:

- **The grant clock:** the period of performance, annual reporting, renewal, and the next proposal.
- **The publication clock:** the interval in which a result must become visible enough to support the next job, promotion, citation, or grant.
- **The training clock:** the finite degree or postdoctoral appointment, which properly serves a person's development rather than an institution's indefinite staffing need.
- **The budget clock:** the fiscal period in which direct and shared costs must be allocated, recovered, and audited.

None of these clocks is irrational. The problem is their intersection. A technically important activity can be rejected by all four: too uncertain for the next grant, too infrastructural for a paper, too long for a student, and too cross-cutting to charge directly.

Tenure partially solves the problem for some faculty by extending the employment horizon. It does not automatically fund a team, a cleanroom, a longitudinal dataset, or a deployment organization. Nor does it cover the growing share of research labor performed by people who do not hold tenured positions.

## Evidence that incentive design changes the direction of research

The strongest claim would be that short project clocks cause worse science. The evidence does not support that statement universally. Fields differ, project grants fund foundational work, and selection into alternative funding programs makes causal comparison difficult.

There is, however, important evidence that contract design changes exploration. [Azoulay, Graff Zivin, and Manso](#source-azoulay-incentives) compared Howard Hughes Medical Institute investigators—funded with greater freedom, longer horizons, and more tolerance for early failure—with similarly accomplished NIH-funded scientists. Using matching and difference-in-differences methods, they found that HHMI investigators produced high-impact work at a higher rate and moved toward more novel lines of inquiry. The study concerns selected life scientists, not every discipline, and cannot prove that simply lengthening every grant would reproduce the result. It does show that incentives are not neutral containers around creativity.

[Wang, Veugelers, and Stephan](#source-wang-novelty) approached the problem through bibliometrics. Papers making unusual combinations of prior journals had more variable outcomes, greater probability of very high long-run impact, broader cross-field influence, and delayed recognition. They were also associated with lower-than-expected journal impact factors. Short evaluation windows can therefore select against the right tail of novelty precisely because that tail arrives with more failures and longer delay.

[Smaldino and McElreath](#source-smaldino-bad-science) formalized a darker mechanism. In their population model, research groups with methods that generate more publishable findings can culturally outcompete more rigorous groups even without fraud or conscious bad intent. Selection operates on the visible output, not on the invisible truth-seeking process. [The National Academies](#source-nasem-integrity) has likewise treated publication pressure and institutional incentives as system-level research-integrity conditions, not only matters of individual character.

[Feynman's warning about cargo-cult science](#source-feynman-cargo-cult) and [Shannon's warning about a bandwagon](#source-shannon-bandwagon) meet here. A community can preserve the vocabulary, venues, and outward motions of science while reward selection gradually lowers the information those signals carry about truth.

## Overhead: the debate is usually wrong before it begins

“Overhead” is often discussed as if a grant contains a pile of money for science and a university removes an arbitrary percentage before the scientist can work. That description is false.

Federal research awards distinguish **direct costs** from **facilities and administrative costs**, usually abbreviated F&A. Direct costs can be assigned to a project with high accuracy: project salary, supplies, travel, and some equipment. F&A costs are shared expenses that support more than one activity and cannot be assigned project by project without disproportionate effort. They include building depreciation, operations and maintenance, utilities, libraries, information systems, financial administration, sponsored-research offices, and parts of departmental and general administration.

The negotiated F&A rate is usually applied not to the entire award but to a **modified total direct cost** base. Major equipment, portions of subawards, and other categories may be excluded. This produces a common arithmetic error. If the applicable base is $100 and the negotiated rate is 60 percent, F&A is $60; it is 37.5 percent of the resulting $160 total, not 60 percent. If excluded direct costs are present, the share of the total award is lower still.

The rate is also a bundle. Under the federal framework described in the First Circuit's 2026 opinion, the administrative component for universities has long been capped at 26 percent of the modified direct-cost base, while the facilities component reflects institution-specific costs. A high negotiated rate is not proof that administrators receive that share of a grant. It can reflect a costly scientific plant. Conversely, a negotiated rate does not prove that every shared dollar is well spent or allocated transparently.

Available federal evidence rejects both simple camps:

- [GAO found](#source-gao-nsf-indirect) that indirect costs represented roughly 16 to 24 percent of NSF's total annual award funding from FY2000 through FY2016.
- [GAO reported](#source-gao-nih-indirect) that facilities reimbursements can support state-of-the-art research infrastructure and also warned NIH to assess whether long-term indirect-cost growth could crowd out the number of grants.
- [GAO found](#source-gao-grant-burden) that federal requirements themselves create administrative workload and recommended more standardization, delayed pre-award requirements, and greater flexibility.

Shared costs are real. Administrative accretion is also real. “All overhead is waste” and “every negotiated cost is optimal” are competing evasions.

## The 2025 NIH fight exposed the wrong binary

On February 7, 2025, NIH issued guidance replacing separately negotiated university indirect-cost rates with a standard 15 percent rate for existing and new grants going forward. The notice argued that more funding should reach direct scientific work. Universities, medical associations, and states challenged the policy.

A federal district court permanently enjoined the guidance and vacated it. On January 5, 2026, the U.S. Court of Appeals for the First Circuit affirmed, concluding that the NIH action violated applicable statutory and regulatory constraints. As of this draft, the guidance is not in force. [The agency notice](#source-nih-indirect-guidance-2025) and [the appellate opinion](#source-first-circuit-nih-2026) should be read together; quoting only one side would misstate both the policy and its legal status. <span class="rd-evidence-token" data-evidence="D">D</span>

The controversy was framed as science versus administration. That is the wrong systems question. A uniform cap does not distinguish an efficient shared facility from duplicative administration, a wet laboratory from a theoretical group, or an institution with accumulated infrastructure from one renting ordinary offices. It can force universities to cross-subsidize federal research from tuition, clinical revenue, philanthropy, or endowment—or to stop doing some research.

The status quo is not therefore vindicated. Negotiated rates are difficult for outsiders and even investigators to interpret. Universities differ in whether recovered F&A returns to the lab, department, school, central administration, or debt service. More grant volume can support more shared infrastructure, but it can also become part of an institutional growth model in which faculty must keep raising external revenue to maintain the system built around raising external revenue.

The useful question is not “What percentage should overhead be?” It is:

> Which shared capabilities does the country want to exist, what do they actually cost, who should own them, and which funding stream remains accountable for their performance?

## Overhead is the shadow price of projectization

This leads to the article's most controversial claim.

> Much academic overhead is not external to science. It is the accounting shadow cast when a society funds research as temporary projects but expects permanent institutions to make those projects possible.

If the federal government funds a microscope's experiments one grant at a time, somebody must still pay for the building, calibration, safety system, cybersecurity, procurement, janitorial work, grant accounting, and periods between experiments. Because those costs do not belong cleanly to one hypothesis, they migrate into F&A pools.

Projectization also creates administration endogenously. Sponsors add controls to reduce misuse and improve accountability. Universities hire people and systems to implement those controls. Investigators spend time supplying the required information. The resulting cost justifies larger administrative capacity, while the number and complexity of grants create further coordination work. No malicious administrator is required.

This is a feedback loop, not a conspiracy:

1. uncertain public work is divided into auditable projects;
2. each project creates compliance and coordination requirements;
3. institutions build shared systems to satisfy them;
4. shared systems are recovered through F&A and institutional cross-subsidy;
5. grant volume becomes necessary to sustain the systems;
6. investigators pursue more grants and spend more time in the grant system.

The loop can finance essential infrastructure and still consume too much scientific attention. The defect is not the existence of indirect cost. It is the failure to distinguish three different purchases:

- a **research project** intended to answer a bounded question;
- **institutional capability** intended to persist and serve many questions;
- **public accountability** intended to protect funds, people, data, and safety.

Bundling all three into a percentage on project expenditure makes the debate opaque.

## Why more grants cannot supply the missing systems layer

Suppose every academic project were fully funded at its correct direct and indirect cost. Four functions would still be underprovided.

**Long-lived technical labor.** Research software engineers, instrumentation experts, data curators, and systems integrators create value across projects. Their careers should not depend on whether one principal investigator has a charge code this quarter.

**Negative-result memory.** Journals, promotion systems, and grant reports favor successful novelty. The institution needs an internal memory of failed hypotheses, unusable code paths, calibration problems, and boundary conditions. AI trained only on published successes will amplify the same survivorship bias.

**Integration authority.** A university technology-transfer office can license an invention. It usually cannot compel a product organization, standards body, procurement officer, manufacturer, regulator, and maintainer to follow one technical roadmap.

**Mission persistence.** Departments and disciplines preserve knowledge communities. They do not necessarily own a public technical mission whose success is evaluated ten years later in the field.

These are not arguments for turning universities into contractors. They are arguments for connecting universities to institutions that are explicitly funded to retain the missing layers.

## The strongest counterargument: the university produced the great work

Turing wrote the 1936 computability paper at Cambridge. Universities gave generations of scientists unusual freedom. Tenure, endowed chairs, institutes, sabbaticals, shared facilities, and long collaborations can sustain questions far beyond a grant. Modern academic biology, physics, mathematics, and computer science supply obvious counterexamples to any claim that universities cannot think long.

The answer is to narrow the proposition. Universities can and do house long thought. The system does not reliably provide the complete path from question to maintained capability, and access to its long-horizon mechanisms is uneven. An endowed theorist, a medical-school laboratory, a soft-money research group, a public-university engineer, and an adjunct instructor do not inhabit the same institution in any economically meaningful sense.

A second counterargument is that university turnover is a feature: students disseminate knowledge by leaving, and competition prevents stagnation. Correct. The problem is not mobility. It is mobility without a funded memory and technical core.

A third is that administrative growth reflects real obligations—human-subject protections, export controls, biosafety, data security, conflicts management, and stewardship of public money. Also correct. The reform target should be duplicated, premature, low-risk, and nonstandard requirements, not accountability itself.

## A different funding architecture

The remedy is not one larger grant. It is an explicit separation of functions.

### 1. Fund projects, capabilities, and accountability separately

Project awards should buy bounded research. Multi-institution capability awards should maintain shared instruments, research software, data, technical staff, and negative-result archives. Sponsors should budget the compliance regime they require and standardize it across agencies where the underlying risk is the same.

### 2. Add long, reviewable people-and-team funding

Expand funding that gives selected investigators and stable teams seven-to-ten-year horizons, permission to change direction, and evaluation against a portfolio rather than annual linear progress. Early failure should be tolerable; concealment and uncorrected methodological weakness should not be.

### 3. Replace opaque F&A arguments with a capability ledger

For major research institutions, publish comparable categories showing:

- facilities operation and depreciation;
- research-computing and data infrastructure;
- safety, security, and regulatory compliance;
- sponsored-project administration;
- general and departmental administration;
- institution-funded research and the source of that subsidy;
- the internal distribution of recovered F&A.

This should not expose sensitive salaries or force false field comparisons. It should allow a sponsor and researcher to see what permanent capability an indirect dollar maintains.

### 4. Reduce proposal waste before reducing scientific support

Use short preproposals, reusable institutional information, common federal forms, later submission of detailed budgets, longer renewals, and experiments with lotteries among proposals that clear a high merit threshold. The objective is not to remove judgment. It is to stop demanding full transaction costs from applicants who have not passed an initial screen.

### 5. Create durable technical careers

Fund research engineers, instrument scientists, data stewards, reproducibility specialists, and transition leads as first-class professions with promotion paths. Their value should be evaluated across a portfolio of projects and over maintenance horizons, not only by first-author papers.

### 6. Reward contradiction, maintenance, and transition

Create dedicated budgets and prestigious roles for replication, red teaming, benchmark repair, software maintenance, dataset stewardship, standards work, and negative-result synthesis. These are the error-correcting codes of the research system.

### 7. Keep universities in a larger institutional network

Universities should remain sources of open inquiry and talent. [FFRDCs are formally designed](#source-far-ffrdc) to supply sponsor continuity, access, independence, systems engineering, and trusted analysis. Mission laboratories can maintain facilities and long-lived teams. Companies and startups can supply product integration, manufacturing, and users. The policy task is to fund the interfaces and retained state, not pretend one node can perform the whole graph.

## Five different verdicts

- **Scientific success:** Universities remain the country's largest institutional home for basic research and produce knowledge that no firm can fully appropriate.
- **Technical success:** They build major instruments, methods, software, and prototypes, with large variation by field and institution.
- **Transition success:** Licensing and spinouts work for some technologies, but the system lacks a universal owner for integration, procurement, deployment, and maintenance.
- **Institutional success:** Departments and tenure preserve some memory; project labor, proposal churn, and fragile technical roles lose other critical state.
- **Public-value success:** Academic research creates immense spillovers and trains the national workforce, while its full costs and downstream benefits remain poorly aligned with any one payer.

Academia is not the weak link in an otherwise complete R&D chain. It is an overloaded link being asked to impersonate the chain.

The constructive conclusion is not to give universities less responsibility for discovery. It is to stop using grant volume and an opaque overhead percentage as substitutes for an institutional design. Fund the project. Fund the capability. Fund the accountability. Then connect the university to an organization that is actually responsible for what happens after the paper.
