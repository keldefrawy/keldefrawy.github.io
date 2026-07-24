# The R&D Ratchet editor guide

This file is an internal operating guide. The public policy is at `/rd-ratchet/method/`.

## 1. Start an article privately

Copy `_drafts/rd-ratchet-article-template.md` to `_rd_articles/SLUG.md`. Keep `published: false` while drafting. Set both `article_slug: SLUG` and `permalink: /rd-ratchet/SLUG/`. In `_data/rd_ratchet.yml`, use `status: researching` or `status: planned`; use `visible: false` to remove its card from the public series map without deleting the editorial record.

## 2. Prepare the first public version

Before publication, require:

- a stable `article_slug` matching the permanent URL;
- `version: "1.0"` and `version_sequence: 100`;
- a specific `revision_summary`, normally “Initial public version”;
- a complete `source_ids` list;
- article-specific visuals stored under `assets/images/rd-ratchet/SLUG/v1-0/`;
- `published: true` and `article_status: Published` only after review.

Create the immutable public snapshot:

```sh
ruby scripts/rd_article_revision.rb snapshot _rd_articles/SLUG.md
```

The command refuses to overwrite an existing version. In `_data/rd_ratchet.yml`, set the card to `status: published` and add `url: /rd-ratchet/SLUG/`.

## 3. Revise a published article

1. Change the current article.
2. Increase both `version` and `version_sequence` (`1.1` → `101`, `2.0` → `200`).
3. Set `updated` and write a concrete `revision_summary`.
4. Add accepted feedback to `corrections` with its date, disposition, summary, version, and optional credit.
5. Put changed visual assets in the new version directory; never overwrite assets referenced by an archived version.
6. Create the new snapshot with the same command.
7. Change the series-card status to `revised` if desired.

Verify every archived snapshot:

```sh
ruby scripts/rd_article_revision.rb verify
```

If verification fails, do not edit the old snapshot. Restore it from Git and create a new version for the correction.

## 4. Withdraw an article

Keep the article file and permanent URL. Set:

```yaml
article_status: Withdrawn
withdrawn: true
withdrawn_date: 2027-03-12
withdrawal_reason: >-
  A precise explanation of the evidence or safety problem.
last_reliable_version_url: /rd-ratchet/SLUG/versions/v1-1/
```

Set the series-card status to `withdrawn`. The layout replaces the current body with a tombstone while retaining its public version history.

## 5. Remove something that was never published

- Set `published: false` on the article file to suppress the page.
- Set `visible: false` on the series-card record to suppress the card.
- Deleting an unpublished draft is acceptable. Do not delete a published article or any file in `_rd_revisions`.

## 6. Triage feedback

Classify each submission as Pending, Accepted, Partially accepted, Declined, or Deferred. Verify cited evidence independently. Ask permission before crediting a private contributor. Never copy sensitive submission material into an article, issue, commit message, or archive.

## 7. Pre-publication check

Run:

```sh
bundle exec jekyll build
ruby tests/rd_ratchet_audit.rb
ruby scripts/rd_article_revision.rb verify
```

The last command is expected to report that no snapshots exist until the first article is published.
