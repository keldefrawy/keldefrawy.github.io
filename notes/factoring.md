
# My Educated Guess on the Hardness of Factoring: Not as hard as commonly "believed"!

* **Reason 1:** Factoring is in the intersection of NP and coNP, which means that it is (extremely) unlikely to be NP-complete because otherwise NP=coNP which is (in my assessment) less likely to be true than factoring being hard.

* **Reason 2:** Other problems in the intersection of NP and coNP have been falling like domino pieces one after another, e.g., primality testing (already in P), graphisomorphism (already in quasi-P), ....

* **Reason 3:** Knowing (the most or least significsnt) half the bits of one the factors renders the problem in P, and even more it is a very efficien algorithm via the Koppersmith method.

* **Reason 4:** We are 2/3 of the way down the exponent through with NFS algortihm, one 

* **Reason 5:** Factoring has a lot of structure, it is actually one of th emost fundamentl structures in number theory

* **Reason 6:** Algorithms exploited so far are single-encoding ones

* **Reason 7:** We know that quantumly factoring is in P, and there are very few other natural optimization or numerical problems that enjoy an exponentail speed speedup from (the current understnidng of) quantum algorithms. Just to be clear, I am not

* **Reason 8:** Argument of millenia does not hold. 10 years of research today are easily worth 100s of research fbefore 1900.

* **Reason 9:** Not a lot of people are truly working on it

* **Reason 10:** Intimate relation between RSA and factoring could provide more clues. Aside from the fundamental nature of factoring to number theor and math, a major contributor to its notoriotiy is that it could be usd ot break RSA encryption and signatures. It may still be the case that factoring is hard and RSA is easy becasue we still do not havea general reduction realting both (factoring can break RSA, but unclear if breaking RSA result sin a factoring algorithm necessarly, because it may be that knowning e and that it has an inverse congruen to 1 modulo the Euler Totient function provides additional information not present in the composite modulus alone. The best equivalence between RSA and factoring we know (to my best of knowledge) is in the generic group model, unlike discrete logarithm (DL) and Diffie-Hellman (DH) which are proven to be the same in the standard model. This raises an issue though which is that DL and factoring are so intimatly related so it is likely that one such reduction will be found, and then because as I said there is additiona info availble from 2 in RSA then this may make the problem even easier nd thus transfer to factoring.

