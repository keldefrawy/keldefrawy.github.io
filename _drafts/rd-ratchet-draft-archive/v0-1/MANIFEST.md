# R&D Ratchet private v0.1 draft archive

Created: 2026-07-24  
Purpose: Exact pre-review preservation copies for the thirteen articles first drafted in this execution pass.  
Publication status: Private working archive. These are not public version snapshots and must not be moved into `_rd_revisions`.

## Integrity manifest

| Article | File | Bytes | SHA-256 |
|---:|---|---:|---|
| 2 | `lucent-coming-apart.md` | 16,262 | `e25f90a516d2875c88f0bd11a9cff794a0e574e0569d7b820fd00b7acb4dc4f0` |
| 3 | `one-heritage-two-incentives.md` | 14,875 | `c6a50edb94acd417d17b27618dec890631dc8d2f8ba06b6293d4000d493a0487` |
| 4 | `hrl-mission-driven-bargain.md` | 15,598 | `627686a7448525cd9c08584cd29d53e379d79fad855a2625e8673b13adafe23f` |
| 5 | `sri-project-funded-institution.md` | 14,892 | `8bc5f220a789d8d9fd8b9dc9cc586e7f32d4166e56be000f4ea183eb14097e90` |
| 6 | `darpa-temporary-laboratory.md` | 14,492 | `12c33cb3a11ea704a9208ea8a07eccda4c38c4580572a4208e08d07025fbb63c` |
| 10 | `parc-appropriability-trap.md` | 14,193 | `682813bcfacf329b6c1367853b0356271c5d80015e66cc9c649d7a6b6ab95ae6` |
| 11 | `outputs-and-vanishing-capability.md` | 13,892 | `eb6d7fe3de3c9faf71ca1fb64420b9bc57ccfa2e60cbd111c4f2e968467ea594` |
| 12 | `startup-not-laboratory.md` | 14,719 | `3d50d6f9311284cb6f1f4ada81e9eefafa74e720ed70337cf253043fb23c59b2` |
| 13 | `consolidation-as-triage.md` | 13,297 | `13df590120a935497322723bba97fb06e2c684464e26c2de204fd099d64f06d5` |
| 14 | `last-transfer-window.md` | 15,275 | `aae882e3db2c350f863d413add846bf58229e4d7a1de72c0144cec478f2ad0bd` |
| 15 | `ai-audits-scientific-record.md` | 16,616 | `afc638f076d7618a5cc624366c600b8b65512e34b4c3a83129105f90b2c66fac` |
| 16 | `cargo-cult-science-machine-speed.md` | 18,060 | `fde52603396a22b082a677799d5652b1b8e328cd42ac53d2a9cf20df8cf23d1f` |
| 17 | `ai-native-public-good.md` | 21,032 | `acf54b6e462a23f0ad53be49295309ec6cbd9acca72a14d6146a923e090e3d33` |

## Verification

Recompute with Ruby so verification does not depend on platform-specific `shasum` locale behavior:

```sh
ruby -rdigest -e 'Dir["_drafts/rd-ratchet-draft-archive/v0-1/*.md"].grep_v(/MANIFEST/).sort.each { |path| puts "#{Digest::SHA256.file(path).hexdigest}  #{path}" }'
```

The live `_rd_articles` copies may change to v0.2. Files in this directory must remain byte-for-byte unchanged.
