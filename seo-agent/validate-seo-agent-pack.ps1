$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$expectedFiles = @(
  "README.md",
  "shared-audit-protocol.md",
  "audit-input-template.md",
  "audit-runbook.md",
  "agent-test-plan.md",
  "existing-seo-skills-review.md",
  "external-seo-tool-benchmark.md",
  "large-codebase-review-protocol.md",
  "one-time-audit-output-template.md",
  "00-audit-orchestrator.md",
  "01-keyword-strategy-agent.md",
  "02-page-mapping-cannibalization-agent.md",
  "03-technical-seo-code-agent.md",
  "04-on-page-content-eeat-agent.md",
  "05-local-seo-google-maps-agent.md",
  "06-competitor-serp-gap-agent.md",
  "07-programmatic-location-pages-agent.md",
  "08-schema-entity-trust-agent.md",
  "09-authority-backlinks-citations-agent.md",
  "10-core-web-vitals-ux-conversion-agent.md",
  "11-ai-search-visibility-agent.md",
  "12-google-search-indexability-agent.md",
  "13-gbp-competitor-categories-services-agent.md",
  "14-agent-qa-improvement-agent.md",
  "15-universal-website-crawl-intake-agent.md",
  "16-competitor-evidence-extraction-agent.md",
  "17-seo-measurement-reporting-agent.md",
  "18-seo-quick-wins-implementation-agent.md",
  "19-agent-pack-optimization-loop-agent.md"
)

$files = Get-ChildItem -Path $root -Filter "*.md"
$numbered = $files | Where-Object { $_.Name -match "^\d{2}-.+\.md$" }
$allText = ($files | ForEach-Object { Get-Content -Raw -Path $_.FullName }) -join "`n"

$readme = Get-Content -Raw -Path (Join-Path $root "README.md")
$orchestrator = Get-Content -Raw -Path (Join-Path $root "00-audit-orchestrator.md")
$runbook = Get-Content -Raw -Path (Join-Path $root "audit-runbook.md")
$qa = Get-Content -Raw -Path (Join-Path $root "14-agent-qa-improvement-agent.md")

$requiredCoverageTerms = @(
  "Website URL only",
  "GBP URL only",
  "Company name only",
  "Question-Driven Diagnostic Mode",
  "Why are we last on Google Maps",
  "Title tag",
  "Meta description",
  "H1",
  "H2/H3 outline",
  "Primary category",
  "Secondary categories",
  "Services",
  "Page with redirect",
  "Alternate page with proper canonical tag",
  "Excluded by noindex tag",
  "Discovered - currently not indexed",
  "Crawled - currently not indexed",
  "X-Robots-Tag",
  "Google-selected canonical",
  "cannibalization",
  "Core Web Vitals",
  "Product schema",
  "JavaScript",
  "YMYL",
  "GA4",
  "GSC",
  "GBP insights",
  "Do not promise ranking",
  "No SEO agent can guarantee",
  "One-Time Comprehensive Audit Mode",
  "one-time-audit-output-template.md",
  "30/60/90 Day Plan",
  "Simple Changes To Do Now",
  "SEO Quick Wins Implementation Agent",
  "External SEO Tool Benchmark",
  "Unlighthouse",
  "Lighthouse",
  "crawler tools",
  "large-codebase-review-protocol.md",
  "SEO Agent Pack Optimization Loop Agent",
  "Optimization Loop",
  "monorepo",
  "metadata",
  "sitemap",
  "robots"
)

$requiredOrchestratorRefs = @(
  "Universal Website Crawl And Intake Agent",
  "Competitor Evidence Extraction Agent",
  "Keyword Strategy Agent",
  "Page Mapping and Cannibalization Agent",
  "Technical SEO Code Agent",
  "On-Page Content and E-E-A-T Agent",
  "Local SEO and Google Maps Agent",
  "Competitor SERP Gap Agent",
  "Programmatic Location Pages Agent",
  "Schema Entity Trust Agent",
  "Authority Backlinks And Citations Agent",
  "Core Web Vitals UX And Conversion Agent",
  "AI Search Visibility Agent",
  "Google Search Indexability Agent",
  "GBP Competitor Categories And Services Agent",
  "SEO Agent QA And Improvement Agent",
  "SEO Measurement And Reporting Agent",
  "SEO Quick Wins Implementation Agent",
  "SEO Agent Pack Optimization Loop Agent"
)

$scenarioChecks = [ordered]@{
  "URL_ONLY" = ($allText -like "*Website URL only*" -and $runbook -like "*Public URL Audit*")
  "GBP_ONLY" = ($allText -like "*GBP URL only*")
  "COMPANY_ONLY" = ($allText -like "*Company name only*")
  "MAPS_LAST" = ($runbook -like "*Why are we last on Google Maps?*" -and $runbook -like "*MAPS_LAST_ROUTE: 16,05,13,09,06*" -and $allText -like "*Low Google Maps Ranking Diagnosis*")
  "SEO_PAGES_LAST" = ($runbook -like "*Pages ranking last organically*" -and $runbook -like "*SEO_PAGES_LAST_ROUTE: 16,12,01,02,04,06,09*" -and $allText -like "*Google Search Indexability Agent*")
  "COMPETITOR_BEATS_US" = ($runbook -like "*COMPETITOR_BEATS_US_ROUTE: 16,06,05,13,04,09,10*")
  "TRAFFIC_NO_LEADS" = ($runbook -like "*TRAFFIC_NO_LEADS_ROUTE: 10,04,01,17*")
  "COMPETITOR_EXTRACTION" = ($allText -like "*Competitor Evidence Extraction Agent*" -and $allText -like "*Title tag*" -and $allText -like "*GBP Extraction*")
  "GSC_INDEXABILITY" = ($allText -like "*Page with redirect*" -and $allText -like "*Excluded by noindex tag*" -and $allText -like "*Discovered - currently not indexed*")
  "CANNIBALIZATION" = ($allText -like "*Page Mapping And Cannibalization Agent*" -and $allText -like "*Ecommerce filter/facet URLs*")
  "MEASUREMENT" = ($allText -like "*SEO Measurement And Reporting Agent*" -and $allText -like "*GA4*" -and $allText -like "*GBP insights*")
  "NO_GUARANTEE" = ($allText -like "*No SEO agent can guarantee*" -and $allText -like "*Do not promise ranking timelines*")
  "ONE_TIME_AUDIT" = ($runbook -like "*One-Time Comprehensive Audit Mode*" -and $allText -like "*one-time-audit-output-template.md*" -and $allText -like "*30/60/90 Day Plan*")
  "QUICK_WINS" = ($allText -like "*SEO Quick Wins Implementation Agent*" -and $allText -like "*Simple Changes To Do Now*" -and $runbook -like "*QUICK_WINS_ROUTE: 18*")
  "LARGE_CODEBASE" = ($allText -like "*large-codebase-review-protocol.md*" -and $allText -like "*monorepo*" -and $allText -like "*SEO control files*")
  "OPTIMIZATION_LOOP" = ($allText -like "*SEO Agent Pack Optimization Loop Agent*" -and $runbook -like "*OPTIMIZATION_LOOP_ROUTE: 19*" -and $allText -like "*validate-seo-agent-pack.ps1*")
}

$missingFiles = $expectedFiles | Where-Object { -not (Test-Path (Join-Path $root $_)) }
$missingReadmeRefs = $expectedFiles | Where-Object { $_ -match "^\d\d-" -and $readme -notlike "*$_*" }
$missingOrchestratorRefs = $requiredOrchestratorRefs | Where-Object { $orchestrator -notlike "*$_*" }
$missingCoverageTerms = $requiredCoverageTerms | Where-Object { $allText -notlike "*$_*" }
$missingProtocolRefs = $numbered | Where-Object { (Get-Content -Raw -Path $_.FullName) -notlike "*shared-audit-protocol.md*" } | Select-Object -ExpandProperty Name
$nonAsciiFiles = $files | Where-Object {
  ((Get-Content -Raw -Path $_.FullName).ToCharArray() | Where-Object { [int][char]$_ -gt 127 } | Select-Object -First 1)
} | Select-Object -ExpandProperty Name
$failedScenarios = $scenarioChecks.GetEnumerator() | Where-Object { -not $_.Value } | ForEach-Object { $_.Key }
$missingQARefs = @("SEO Measurement And Reporting Agent", "SEO Quick Wins Implementation Agent", "SEO Agent Pack Optimization Loop Agent", "Competitor Evidence Extraction Agent output", "scraping/browser/API access") | Where-Object { $qa -notlike "*$_*" }

Write-Output "FILES_FOUND=$($files.Count)"
Write-Output "EXPECTED_FOUND=$(($expectedFiles.Count - $missingFiles.Count))/$($expectedFiles.Count)"
Write-Output "NUMBERED_AGENTS=$($numbered.Count)"
Write-Output "MISSING_FILES=$($missingFiles -join ', ')"
Write-Output "MISSING_README_REFS=$($missingReadmeRefs -join ', ')"
Write-Output "MISSING_ORCHESTRATOR_REFS=$($missingOrchestratorRefs -join ', ')"
Write-Output "MISSING_COVERAGE_TERMS=$($missingCoverageTerms -join ', ')"
Write-Output "NUMBERED_WITHOUT_PROTOCOL=$($missingProtocolRefs -join ', ')"
Write-Output "NON_ASCII_FILES=$($nonAsciiFiles -join ', ')"
Write-Output "FAILED_SCENARIOS=$($failedScenarios -join ', ')"
Write-Output "MISSING_QA_REFS=$($missingQARefs -join ', ')"

$passed = (
  -not $missingFiles -and
  -not $missingReadmeRefs -and
  -not $missingOrchestratorRefs -and
  -not $missingCoverageTerms -and
  -not $missingProtocolRefs -and
  -not $nonAsciiFiles -and
  -not $failedScenarios -and
  -not $missingQARefs -and
  $numbered.Count -eq 20
)

if ($passed) {
  Write-Output "VALIDATION=PASS"
  exit 0
}

Write-Output "VALIDATION=FAIL"
exit 1
