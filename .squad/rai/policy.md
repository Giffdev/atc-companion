# ATC Companion — RAI Policy

## Check Categories

### Code Safety
- Credential/secret detection in source files
- Injection vulnerability patterns (SQL, XSS, command injection)
- PII exposure in logs, error messages, or client-side code
- Bias indicators in data processing or display logic

### Content Safety
- Harmful or deceptive content patterns
- Exclusionary language
- Misleading data presentation

### Aviation-Specific (Critical)
- **AI Data Leakage:** Any code path where LLM/AI output could be displayed as authoritative aviation data → 🔴 RED
- **Source Attribution:** Aviation data displayed without source and timestamp → 🔴 RED
- **Staleness:** Data displayed without freshness indicators → 🟡 YELLOW
- **Fabrication Risk:** Any pattern that could produce plausible-looking but unsourced aviation data → 🔴 RED

### Prompt/Charter Safety
- Safety bypass instructions
- Insufficient grounding constraints
- Privacy risks in prompt design

## Terminology Standards
- Use inclusive language throughout
- Prefer "allowlist/denylist" over "whitelist/blacklist"
- Use person-first language

## Opt-Out Model
- 🔴 Critical checks: CANNOT be disabled
- 🟡 Advisory checks: Can be disabled with justification logged to audit trail
