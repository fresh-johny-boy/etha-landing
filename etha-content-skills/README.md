# ETHA Content Skills for Claude Code

A complete content-writing pipeline for the ETHA brand, packaged as Claude Code skills. Same agents and quality gates we use in the AI Marketing Machine — dropped into Claude Code so anyone can run them from the terminal.

## What's inside

Seven skills that mirror the production content pipeline:

| Skill | What it does |
|---|---|
| `/etha-content` | **Main pipeline.** Runs Board → Write → Hard Rules → Evaluate → Mr. Different → Joana in sequence. Use this for a single polished piece. |
| `/etha-board` | 6 expert advisors (Alex Hormozi, Rory Sutherland, Gary Vee, Steve Jobs, Andrew Huberman, Frédéric Malle) review the brief and give strategic direction before writing. |
| `/etha-write` | The core content writer. Takes topic + platform + pillar, produces a polished piece in ETHA voice with all rules enforced. |
| `/etha-hard-rules` | Deterministic scan for banned phrases (health overclaims, product promotion, ingredient name-drops). |
| `/etha-evaluate` | Independent 0-10 quality scoring against the brand's quality checklist. |
| `/etha-mr-different` | Differentiation check — flags content that sounds like generic wellness copy. |
| `/etha-joana-check` | Persona reaction test — how Joana (the ETHA audience) would actually react. |

## Install

### Step 1 — Drop in Brand Knowledge

The skills read brand context from a file called `BRAND-KNOWLEDGE.md` in your current working directory (the folder you launch `claude` from).

Replace the placeholder file in this folder with the real ETHA brand knowledge MD file you were sent. Keep the filename `BRAND-KNOWLEDGE.md`.

### Step 2 — Install the skills

Copy the `skills/` contents into your Claude Code skills directory.

**macOS / Linux:**
```bash
cp -R skills/* ~/.claude/skills/
```

**Windows (PowerShell):**
```powershell
Copy-Item -Recurse skills\* $env:USERPROFILE\.claude\skills\
```

If `~/.claude/skills/` doesn't exist yet, create it first:
```bash
mkdir -p ~/.claude/skills
```

### Step 3 — Verify

Open Claude Code in any folder that has `BRAND-KNOWLEDGE.md`:
```bash
claude
```

Then type `/etha-content` — if the skill shows up in the menu, you're good.

## How to use

**Generate a single piece (most common):**
```
/etha-content
```
Claude will ask for topic, platform, and content pillar, then run the full pipeline (board → write → rules check → evaluate → differentiation → Joana reaction) and return the final piece.

**Run just one step (for iteration):**
```
/etha-write
/etha-evaluate <paste content here>
/etha-mr-different <paste content here>
```

## How it works

Every skill loads `BRAND-KNOWLEDGE.md` from your working directory and applies ETHA's rules:

- **Voice:** Ayurvedic, sensory, invitation-over-sales
- **Audience:** Joana — emotionally intelligent, overstimulated, allergic to hype
- **Hard rules:** No product names, no herb names (Ashwagandha, Brahmi, etc.), no ingredient names, no health overclaims, no salesy CTAs
- **Quality bar:** Body must use Dosha/Agni/ritual framework (no generic wellness fluff). Differentiation score ≥ 7/10.

## Tips

- **Keep the knowledge file close.** The skills read `./BRAND-KNOWLEDGE.md` by default. Launch Claude Code from the folder that has it.
- **One piece at a time.** The pipeline is tuned for a single polished output, not batches.
- **Reject → rewrite loop.** If the piece fails the evaluator or Mr. Different, Claude will offer to rewrite it. Say "yes" to run another pass.
- **Edit freely.** These are skills, not magic — read the SKILL.md files in each folder and tweak them if your friend's use case shifts.

## Troubleshooting

- **Skill not showing up?** Restart Claude Code — it reads the skills folder on startup.
- **"Can't find BRAND-KNOWLEDGE.md"?** Check your current working directory (`pwd`) and make sure the file is there.
- **Output feels generic?** Run `/etha-mr-different` on it — it'll tell you exactly what's too wellness-cliche and suggest a specific rewrite.
