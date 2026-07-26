# frozen_string_literal: true

require "open3"
require "optparse"
require "thread"
require "yaml"

ROOT = File.expand_path("..", __dir__)
DATA_PATH = File.join(ROOT, "_data", "rd_ratchet.yml")

options = { concurrency: 8, timeout: 20 }
OptionParser.new do |parser|
  parser.banner = "Usage: ruby scripts/rd_source_link_audit.rb [options]"
  parser.on("-j", "--concurrency N", Integer, "Concurrent checks (default: 8)") { |value| options[:concurrency] = value }
  parser.on("-t", "--timeout SECONDS", Integer, "Per-link timeout (default: 20)") { |value| options[:timeout] = value }
end.parse!

sources = YAML.load_file(DATA_PATH).fetch("sources")
queue = Queue.new
sources.each { |source| queue << source }

results = []
mutex = Mutex.new
workers = Array.new([options[:concurrency], sources.length].min) do
  Thread.new do
    loop do
      source = queue.pop(true)
      stdout, stderr, status = Open3.capture3(
        "curl", "-sS", "-L",
        "--max-time", options[:timeout].to_s,
        "-o", "/dev/null",
        "-w", "%{http_code}",
        source.fetch("url")
      )
      code = stdout.strip
      result = {
        id: source.fetch("id"),
        code: code.empty? ? "000" : code,
        exit_status: status.exitstatus,
        error: stderr.strip
      }
      mutex.synchronize { results << result }
    rescue ThreadError
      break
    end
  end
end
workers.each(&:join)

hard_failures = results.select { |result| result[:code] == "000" || %w[404 410].include?(result[:code]) }
blocked = results.select { |result| %w[401 403 405 429].include?(result[:code]) }
unexpected = results.reject do |result|
  result[:code].match?(/\A[23]\d\d\z/) || hard_failures.include?(result) || blocked.include?(result)
end

puts "R&D Ratchet source-link audit: #{results.length} URLs"
puts "- reachable/redirected: #{results.length - hard_failures.length - blocked.length - unexpected.length}"
puts "- reachable but access/rate limited: #{blocked.length}"
puts "- unexpected HTTP status: #{unexpected.length}"
puts "- hard failures: #{hard_failures.length}"

unless blocked.empty?
  puts "\nAccess-limited endpoints (manual browser verification may be required):"
  blocked.sort_by { |result| result[:id] }.each { |result| puts "- #{result[:id]}: HTTP #{result[:code]}" }
end

unless unexpected.empty?
  puts "\nUnexpected statuses:"
  unexpected.sort_by { |result| result[:id] }.each { |result| puts "- #{result[:id]}: HTTP #{result[:code]}" }
end

unless hard_failures.empty?
  puts "\nHard failures:"
  hard_failures.sort_by { |result| result[:id] }.each do |result|
    detail = result[:error].empty? ? "curl exit #{result[:exit_status]}" : result[:error]
    puts "- #{result[:id]}: HTTP #{result[:code]} (#{detail})"
  end
end

exit 1 unless hard_failures.empty?
