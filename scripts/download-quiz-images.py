#!/usr/bin/env python3
"""
Scrape Unsplash search results (no API key) and download quiz images.
Converts all downloads to webp via Pillow.
Output: assets/quiz-images/{slot}/1.webp … 5.webp
"""

import re
import os
import time
import requests
from pathlib import Path
from PIL import Image
from io import BytesIO

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

OUT_ROOT = Path(__file__).parent.parent / "assets" / "quiz-images"
PER_SLOT  = 5
IMG_W     = 1200  # download width

# ── Search definitions ──────────────────────────────────────────────────────
# Each entry: (slot_name, unsplash_query)
# Queries are tuned for ETHA's poetic aesthetic — atmosphere over literal.
SLOTS = [
    # Q1 — "Which sounds like your morning?"
    ("opener-q1-a", "sheer curtain window breeze"),        # wind through thin curtain
    ("opener-q1-b", "water boiling steam kettle"),         # water coming to boil
    ("opener-q1-c", "rain roof dark moody"),               # rain on a heavy roof

    # Q2 — "Choose the one you'd hold."
    ("opener-q2-a", "silver needle sewing minimal"),       # silver needle cold
    ("opener-q2-b", "cast iron pan warm kitchen"),         # cast-iron handle warm
    ("opener-q2-c", "smooth river pebble stone sea"),      # polished sea stone

    # Q3 — "What do you leave behind in a room?"
    ("opener-q3-a", "door ajar light hallway"),            # door not quite closed
    ("opener-q3-b", "candle flame burning minimal"),       # candle burning after you left
    ("opener-q3-c", "cushion soft indent fabric warm"),    # warm indent in cushion

    # Element images
    ("air",   "wind sky air movement ethereal"),
    ("fire",  "fire flame warm minimal abstract"),
    ("earth", "dark soil ground earth texture"),
]


def scrape_unsplash(query: str, count: int = PER_SLOT) -> list[str]:
    """Return up to `count` full-size Unsplash image URLs for a query."""
    slug = query.replace(" ", "-")
    url  = f"https://unsplash.com/s/photos/{slug}"
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        r.raise_for_status()
    except Exception as e:
        print(f"  [scrape error] {e}")
        return []

    # Unsplash embeds photo IDs in many formats; extract unique photo IDs.
    # Pattern: images.unsplash.com/photo-XXXX or /photo-XXXX in srcset/src
    ids = re.findall(
        r'images\.unsplash\.com/(photo-[A-Za-z0-9_-]+)',
        r.text
    )
    # Deduplicate while preserving order
    seen = set()
    unique_ids = []
    for pid in ids:
        if pid not in seen:
            seen.add(pid)
            unique_ids.append(pid)
        if len(unique_ids) >= count:
            break

    urls = [
        f"https://images.unsplash.com/{pid}?w={IMG_W}&q=85&fm=jpg&fit=crop"
        for pid in unique_ids
    ]
    return urls


def download_and_convert(url: str, dest: Path) -> bool:
    """Download image from URL and save as webp."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=20, stream=True)
        r.raise_for_status()
        img = Image.open(BytesIO(r.content)).convert("RGB")
        img.save(dest, "WEBP", quality=85, method=6)
        print(f"    ✓ {dest.name}  ({img.width}×{img.height})")
        return True
    except Exception as e:
        print(f"    ✗ {url}  → {e}")
        return False


def run():
    OUT_ROOT.mkdir(parents=True, exist_ok=True)

    for slot, query in SLOTS:
        slot_dir = OUT_ROOT / slot
        slot_dir.mkdir(exist_ok=True)

        # Skip if already have enough
        existing = list(slot_dir.glob("*.webp"))
        if len(existing) >= PER_SLOT:
            print(f"[skip] {slot} — already has {len(existing)} images")
            continue

        print(f"\n[{slot}]  query: «{query}»")
        urls = scrape_unsplash(query, count=PER_SLOT)

        if not urls:
            print(f"  no URLs found — try a different query")
            continue

        print(f"  found {len(urls)} image(s)")
        for i, url in enumerate(urls, 1):
            dest = slot_dir / f"{i}.webp"
            if dest.exists():
                print(f"    – {dest.name} exists, skip")
                continue
            download_and_convert(url, dest)
            time.sleep(0.4)   # polite delay

    print("\n\nDone. Images in assets/quiz-images/")
    # Summary
    total = sum(len(list((OUT_ROOT / s).glob("*.webp"))) for s, _ in SLOTS)
    print(f"Total webp files: {total}")


if __name__ == "__main__":
    run()
