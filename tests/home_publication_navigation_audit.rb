# encoding: UTF-8
# frozen_string_literal: true

root = File.expand_path("..", __dir__)
homepage = File.read(File.join(root, "index.md"), encoding: "UTF-8")
styles = File.read(File.join(root, "assets/css/style.scss"), encoding: "UTF-8")

chronological_link = "[Publications ({{ site.data.publications | size }}) — chronological list]({{ '/pubs.html' | relative_url }})"

checks = {
  "links the homepage statistic to the chronological publication list" =>
    homepage.include?(%(<a href="{{ '/pubs.html' | relative_url }}"><strong>{{ site.data.publications | size }}</strong>)),
  "puts the chronological list first in the publications card" =>
    homepage.include?(chronological_link) &&
      homepage.index(chronological_link) < homepage.index("[Patents (31)]"),
  "separates direct lists from publication exploration" =>
    homepage.include?('class="home-card home-card--publication-exploration"') &&
      homepage.include?("## Explore Publications") &&
      homepage.include?("[Browse publications by research area]") &&
      homepage.include?("[Scientific knowledge maps]"),
  "keeps external publication profiles in the exploration card" =>
    homepage.include?("https://scholar.google.com/citations?user=e9UP75IAAAAJ&hl=en") &&
      homepage.include?("https://www.researchgate.net/profile/Karim-Eldefrawy-2"),
  "uses six equal cards in the wide homepage grid" =>
    styles.match?(/\.home-card--awards,\s*\.home-card--publications,\s*\.home-card--publication-exploration,\s*\.home-card--projects,\s*\.home-card--commercial,\s*\.home-card--talks\s*\{\s*grid-column:\s*span 2;/m),
  "keeps the tablet grid balanced without a full-width commercial card" =>
    !styles.match?(/@media screen and \(min-width: 700px\).*?\.home-card--commercial\s*\{\s*grid-column:\s*1 \/ -1;/m)
}

failures = checks.reject { |_label, passed| passed }.keys
if failures.any?
  warn "Homepage publication navigation audit failed:"
  failures.each { |failure| warn "- #{failure}" }
  exit 1
end

puts "Homepage publication navigation audit passed (#{checks.length} checks)."
