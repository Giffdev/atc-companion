# ATC Companion — Ceremonies

## Defined Ceremonies

### Design Review
- **trigger:** manual
- **when:** before
- **condition:** architecture changes, new data source integration
- **facilitator:** Kranz
- **participants:** [Kranz, affected specialists]
- **duration:** 1 round

### Safety Check
- **trigger:** auto
- **when:** before
- **condition:** changes to data display, aviation data pipelines, user-facing content
- **facilitator:** Lovell
- **participants:** [Lovell, Aaron, Kranz]
- **duration:** 1 round
- **notes:** Aviation data must NEVER be fabricated. All sources must be cited with timestamps.

### Pre-Ship Review
- **trigger:** auto
- **when:** before
- **condition:** PR merge, release
- **facilitator:** Kranz
- **participants:** [Kranz, Lovell, Rai]
- **duration:** 1 round
