# frozen_string_literal: true

require "fileutils"
require "open3"
require "tmpdir"

ROOT = File.expand_path("..", __dir__)
SCRIPT = File.join(ROOT, "scripts", "rd_article_revision.rb")
errors = []

Dir.mktmpdir("rd-ratchet-revision-audit") do |directory|
  source = File.join(directory, "article.md")
  output = File.join(directory, "revisions")
  File.write(source, <<~ARTICLE, encoding: "UTF-8")
    ---
    title: Test article
    article_number: 1
    article_slug: workflow-test
    permalink: /rd-ratchet/workflow-test/
    article_status: Published
    published: true
    date: 2026-07-23
    updated: 2026-07-23
    version: "1.0"
    version_sequence: 100
    revision_summary: Initial public version
    source_ids:
      - ncses-rd-2026
    ---
    The archived body must remain immutable.
  ARTICLE

  _stdout, stderr, status = Open3.capture3("ruby", SCRIPT, "snapshot", source, "--output-dir", output)
  errors << "snapshot creation failed: #{stderr}" unless status.success?

  snapshot = File.join(output, "workflow-test-v1-0.md")
  errors << "snapshot was not created" unless File.file?(snapshot)

  _stdout, stderr, status = Open3.capture3("ruby", SCRIPT, "verify", output)
  errors << "fresh snapshot did not verify: #{stderr}" unless status.success?

  _stdout, _stderr, status = Open3.capture3("ruby", SCRIPT, "snapshot", source, "--output-dir", output)
  errors << "snapshot tool overwrote or accepted a duplicate version" if status.success?

  if File.file?(snapshot)
    File.open(snapshot, "a", encoding: "UTF-8") { |file| file.write("\nTampered after publication.\n") }
    _stdout, _stderr, status = Open3.capture3("ruby", SCRIPT, "verify", snapshot)
    errors << "integrity verification accepted a modified snapshot" if status.success?
  end
end

if errors.any?
  warn "R&D revision workflow audit failed:"
  errors.each { |error| warn "- #{error}" }
  exit 1
end

puts "R&D revision workflow audit passed (create, verify, refuse overwrite, detect tampering)."
