---
layout: default
homepage: true
title: Home
---

<div class="home-page-content" markdown="1">

<figure class="home-research-banner">
  <img src="{{ '/assets/images/home-research-ribbon-banner.svg' | relative_url }}" alt="" width="2200" height="200" fetchpriority="high">
  <figcaption class="home-research-banner__stats" aria-label="Selected research figures">
    <a href="{{ '/pubs.html' | relative_url }}"><strong>{{ site.data.publications | size }}</strong><span>publications &amp; current work</span></a>
    <a href="{{ '/patents.html' | relative_url }}"><strong>31</strong><span>granted patents</span></a>
    <a href="{{ '/projects.html' | relative_url }}"><strong>12</strong><span>funded R&amp;D projects</span></a>
    <a href="https://scholar.google.com/citations?user=e9UP75IAAAAJ&amp;hl=en"><strong>4.7K+</strong><span>Google Scholar citations</span></a>
  </figcaption>
</figure>

<article class="home-bio" markdown="1">

# Brief Bio

Karim Eldefrawy, Ph.D., is the Co-founder & CTO of [Confidencial.io](https://www.confidencial.io/). Prior to that he was a Principal Computer Scientist at the Computer Science Laboratory ([CSL](http://www.csl.sri.com/)) at [SRI (previously Stanford Research Institute)](https://www.sri.com/). His R&D interests focus on [secure and privacy-preserving computation for distributed systems]({{ '/knowledge/' | relative_url }}#knowledge-area-secure-encrypted-computation), [computer-aided formal verification of cryptographic algorithms and protocols]({{ '/knowledge/' | relative_url }}#knowledge-collection-formal-verification), and [security in cyber-physical and embedded systems]({{ '/knowledge/' | relative_url }}#knowledge-area-secure-systems-networks). His interests also include [post-quantum cryptography]({{ '/knowledge/' | relative_url }}#knowledge-collection-post-quantum-cryptography) and recent work in [quantum communication]({{ '/knowledge/papers/paper-70/' | relative_url }}) and [quantum algorithms]({{ '/knowledge/papers/paper-60/' | relative_url }}). His research has been funded by the Defense Advanced Research Project Agency ([DARPA](https://www.darpa.mil/)), the Department of Homeland Security ([DHS](https://www.dhs.gov/science-and-technology)), the Intelligence Advanced Research Projects Activity ([IARPA](https://www.iarpa.gov/)), the National Science Foundation ([NSF](https://www.nsf.gov)), the US AirForce ([AFWERX](https://www.afwerx.af.mil)), and Boeing and General Motors. His work has received the 2024 [Test of Time Award](https://www.ndss-symposium.org/ndss-test-of-time-award/) by the [Internet Society's](https://www.internetsociety.org/) [Network and Distributed System Security Symposium (NDSS)](https://www.ndss-symposium.org/). Karim authored over 100 scientific works ([75+ peer-reviewed papers and book chapters](https://keldefrawy.github.io/pubs.html), and [31 granted and 10+ pending patents](https://keldefrawy.github.io/patents.html)). His opinions and writing on cybersecurity and cryptography topics have been featured on [Forbes](https://councils.forbes.com/profile/Karim-Eldefrawy-CTO-Founder-Confidencial-io/35ea9cb7-7f3c-4fe9-a7d3-780eee7da954) and other venues. Karim served on technical program committees of top academic conferences on security and cryptography and was the information director of ACM Transactions on Privacy and Security (formerly ACM TISSEC) from 2011 to 2015. Karim taught security and cryptography courses at the University of California at Irvine ([UCI](https://www.ics.uci.edu/)) and the University of San Francisco ([USF](https://www.usfca.edu/)).

</article>

<div class="home-primary-grid" markdown="1">

<article class="home-card home-card--awards" markdown="1">

## Awards and Recognitions

* [Awards and recognitions]({{ '/awards.html' | relative_url }})
* [News coverage]({{ '/news.html' | relative_url }})

</article>

<article class="home-card home-card--publications" markdown="1">

## Publications, Patents, and Writings

* [Publications ({{ site.data.publications | size }}) — chronological list]({{ '/pubs.html' | relative_url }})
* [Patents (31)]({{ '/patents.html' | relative_url }})
* [Short informal articles]({{ '/thoughts.html' | relative_url }})

</article>

<article class="home-card home-card--publication-exploration" markdown="1">

## Explore Publications

* [Browse publications by research area]({{ '/publications/' | relative_url }})
* [Scientific knowledge maps]({{ '/knowledge/' | relative_url }})
* [Google Scholar](https://scholar.google.com/citations?user=e9UP75IAAAAJ&hl=en) · [ResearchGate](https://www.researchgate.net/profile/Karim-Eldefrawy-2)

</article>

<article class="home-card home-card--projects" markdown="1">

## Projects and Software

* [Extramurally funded R&D]({{ '/projects.html' | relative_url }})
* [Open-source software for selected projects]({{ '/software.html' | relative_url }})

</article>

<article class="home-card home-card--talks" markdown="1">

## Talks and Articles

* [Online talks]({{ '/talks.html' | relative_url }})
* [Featured interviews and profiles]({{ '/profiles.html' | relative_url }})

</article>

<article class="home-card home-card--commercial" markdown="1">

## Commercial Transitions

* Co-founder & CTO of [Confidencial.io](https://www.confidencial.io/)

</article>

</div>



<div class="home-bottom-grid" markdown="1">

<article class="home-card home-card--resume" markdown="1">

## Resume

* [Full resume]({{ '/karim_resume.pdf' | relative_url }}) (last updated in July 2020)
* [SRI profile](https://www.sri.com/bios/karim-eldefrawy/)
* [LinkedIn profile](https://www.linkedin.com/pub/karim-eldefrawy/3/6b5/b70)

</article>

<article class="home-card home-card--contact" markdown="1">

## Contact

* **Startup:** {firstname_dot_lastname} + {@} + {name_of_my_startup_dot_io}
* **Research:** {firstname_dot_lastname} + {@} + {sri_dot_com}
* **Personal:** {lastname} + {@} + {email_of_most_famous_search_engine}
* **Personal Encrypted:** {lastname} + {@} + {proton_email}

</article>

</div>

{% include home-adversary-game.html %}

<p class="home-last-updated">Last updated: <time datetime="{{ site.time | date_to_xmlschema }}">{{ site.time | date: "%B %-d, %Y at %-I:%M %p %Z" }}</time></p>

</div>
