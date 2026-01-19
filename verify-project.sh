#!/bin/bash

#
# Project Verification Script
#
# This script verifies the project configuration and structure.
# Run after initialization or before deployment.
#
# Usage:
#   ./verify-project.sh
#

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# Counters
PASSED=0
WARNINGS=0
FAILED=0

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Helper functions
pass() { echo -e "  ${GREEN}✓${NC} $1"; ((PASSED++)); }
warn() { echo -e "  ${YELLOW}!${NC} $1"; ((WARNINGS++)); }
fail() { echo -e "  ${RED}✗${NC} $1"; ((FAILED++)); }
check() { echo -e "  ${BLUE}→${NC} $1"; }
header() { echo -e "\n${BOLD}${CYAN}$1${NC}\n${DIM}$(printf '=%.0s' {1..50})${NC}"; }

# Banner
echo -e "${BOLD}${CYAN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║           PROJECT VERIFICATION SCRIPT                ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================
# Configuration Files
# ============================================
header "Configuration Files"

check "Checking system.config.json..."
if [[ -f "system.config.json" ]]; then
    pass "system.config.json exists"

    # Extract slug
    if command -v jq &> /dev/null; then
        APP_SLUG=$(jq -r '.app.slug // "unknown"' system.config.json)
        APP_NAME=$(jq -r '.app.name // "unknown"' system.config.json)
    else
        APP_SLUG=$(grep -o '"slug":\s*"[^"]*"' system.config.json | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
        APP_NAME=$(grep -o '"name":\s*"[^"]*"' system.config.json | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
    fi
    echo -e "    ${DIM}App: $APP_NAME ($APP_SLUG)${NC}"
else
    fail "system.config.json not found - run ./init-project.sh"
    APP_SLUG=""
fi

check "Checking frontend config..."
if [[ -f "frontend/public/system.config.json" ]]; then
    pass "frontend/public/system.config.json exists"
else
    warn "frontend/public/system.config.json not found"
fi

# ============================================
# Docker Configuration
# ============================================
header "Docker Configuration"

check "Checking docker-compose.yml..."
if [[ -f "docker-compose.yml" ]]; then
    pass "docker-compose.yml exists"
else
    fail "docker-compose.yml not found"
fi

# ============================================
# Layout Components
# ============================================
header "Layout Components"

check "Checking Sidebar..."
[[ -f "frontend/src/components/layout/Sidebar.tsx" ]] && pass "Sidebar.tsx exists" || warn "Sidebar.tsx not found"

check "Checking AppShell..."
[[ -f "frontend/src/components/layout/AppShell.tsx" ]] && pass "AppShell.tsx exists" || warn "AppShell.tsx not found"

check "Checking HeaderBar..."
[[ -f "frontend/src/components/layout/HeaderBar.tsx" ]] && pass "HeaderBar.tsx exists" || warn "HeaderBar.tsx not found"

# ============================================
# Design System
# ============================================
header "Design System"

check "Checking design-tokens.css..."
if [[ -f "frontend/src/design-system/design-tokens.css" ]]; then
    pass "design-tokens.css exists"
else
    fail "design-tokens.css not found"
fi

# Quick scan for raw HTML elements (pages only)
check "Scanning pages for raw form elements..."
RAW_ELEMENTS=0
for pattern in '<input' '<button' '<select' '<textarea'; do
    count=$(grep -r "$pattern" frontend/src/pages 2>/dev/null | wc -l | tr -d ' ')
    RAW_ELEMENTS=$((RAW_ELEMENTS + count))
done

if [[ "$RAW_ELEMENTS" -gt 0 ]]; then
    warn "Found $RAW_ELEMENTS raw HTML form elements in pages/"
    echo -e "    ${DIM}Consider using design system components${NC}"
else
    pass "No raw HTML form elements in pages/"
fi

# ============================================
# Guardrail Files
# ============================================
header "Guardrail Files"

check "Checking .cursorrules..."
[[ -f ".cursorrules" ]] && pass ".cursorrules exists" || warn ".cursorrules not found"

check "Checking ai-guidelines.md..."
[[ -f "ai-guidelines.md" ]] && pass "ai-guidelines.md exists" || warn "ai-guidelines.md not found"

# ============================================
# YAML Validation
# ============================================
header "YAML Validation"

check "Validating docker-compose.yml..."
if [[ -f "docker-compose.yml" ]]; then
    if command -v python3 &> /dev/null; then
        if python3 -c "import yaml; yaml.safe_load(open('docker-compose.yml'))" 2>/dev/null; then
            pass "docker-compose.yml is valid YAML"
        else
            fail "docker-compose.yml has invalid YAML"
        fi
    else
        warn "No YAML validator available"
    fi
fi

# ============================================
# Summary
# ============================================
header "Summary"

echo -e "  ${GREEN}Passed:${NC}   $PASSED"
echo -e "  ${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "  ${RED}Failed:${NC}   $FAILED"
echo ""

if [[ $FAILED -gt 0 ]]; then
    echo -e "${RED}${BOLD}Some critical checks failed!${NC}"
    exit 2
elif [[ $WARNINGS -gt 0 ]]; then
    echo -e "${YELLOW}${BOLD}Verification complete with warnings.${NC}"
    exit 1
else
    echo -e "${GREEN}${BOLD}All checks passed!${NC}"
    exit 0
fi
