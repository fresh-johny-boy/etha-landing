#!/usr/bin/env python3
"""Download quiz images from pre-fetched Unsplash URLs and convert to webp."""
import requests
from pathlib import Path
from PIL import Image
from io import BytesIO
import time

HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
OUT_ROOT = Path(__file__).parent.parent / "assets" / "quiz-images"

def url(slug):
    return f"https://images.unsplash.com/{slug}?w=1080&q=85&fm=jpg&fit=crop"

SLOTS = {
    "opener-q1-a": [
        url("photo-1573507811472-909cd17e834d"),
        url("photo-1627876566478-f11d3e68c17b"),
        url("photo-1757516063252-a9b172f88095"),
        url("photo-1505903601354-f92df1e5834b"),
        url("photo-1623421808197-8d9826f072bc"),
    ],
    "opener-q1-b": [
        url("photo-1768768772927-a44003c5e04a"),
        url("photo-1626578506529-2e66d0984d09"),
        url("photo-1675080165804-049eecf31ee2"),
        url("photo-1628691885959-52da61eeaf43"),
        url("photo-1588593765509-99a811d0e8f0"),
    ],
    "opener-q1-c": [
        url("photo-1520016985061-7566334b58d9"),
        url("photo-1705607387749-c5c2d7fcd599"),
        url("photo-1514882714393-f681401906c0"),
        url("photo-1560711098-336d970a2faa"),
        url("photo-1737272148262-48b0188806e5"),
    ],
    "opener-q2-a": [
        url("photo-1737295361905-f47371d85460"),
        url("photo-1619470148699-ce3476e0e1f0"),
        url("photo-1755547721520-22c2ea069bbb"),
        url("photo-1619470148852-c0c1ca477e5e"),
        url("photo-1604238551580-b283a67b475f"),
    ],
    "opener-q2-b": [
        url("photo-1636647511414-c9ec06da32bc"),
        url("photo-1633241394397-927cc4ec0845"),
        url("photo-1590794056226-79ef3a8147e1"),
        url("photo-1590091626142-167ee3798ca8"),
        url("photo-1583777304100-a2a154c51f6b"),
    ],
    "opener-q2-c": [
        url("photo-1611516924303-b80b3286777d"),
        url("photo-1712605119498-14d012ba4284"),
        url("photo-1650755743867-6ad2037a2934"),
        url("photo-1663167173278-ea30c9744711"),
        url("photo-1601160863526-64326743f8e4"),
    ],
    "opener-q3-a": [
        url("photo-1700843553625-920c4798d3a8"),
        url("photo-1760288033665-b602eca6ad38"),
        url("photo-1672346454405-a5773cbea168"),
        url("photo-1633820183923-38bf9ebc7466"),
        url("photo-1625514298467-1c16cefe97e2"),
    ],
    "opener-q3-b": [
        url("photo-1706057986014-f20bf91348b3"),
        url("photo-1707377577128-e792db5d292c"),
        url("photo-1516367165679-86aae9f22237"),
        url("photo-1629883466247-1d5b9e322bab"),
        url("photo-1680673865765-44c650d827df"),
    ],
    "opener-q3-c": [
        url("photo-1737094661981-baad6b211852"),
        url("photo-1629949009765-40fc74c9ec21"),
        url("photo-1629949008265-af1bcaf59786"),
        url("photo-1629949008790-ca50382f7f98"),
        url("photo-1691256676366-370303d55b61"),
    ],
    "air": [
        "https://images.unsplash.com/6/overhead-hi-res.jpg?w=1080&q=85&fm=jpg&fit=crop",
        url("photo-1746437618553-bdf5f63a3745"),
        url("photo-1717919924773-844132763007"),
        url("photo-1645323669757-c44f265f1976"),
        url("photo-1599426671677-42b3771a71a4"),
    ],
    "fire": [
        url("photo-1645562221123-b60c3479d92e"),
        url("photo-1605470179837-2ef5504a3928"),
        url("photo-1676655182921-588e22d188a2"),
        url("photo-1548504773-429e84f586d2"),
        url("photo-1706057986014-f20bf91348b3"),
    ],
    "earth": [
        url("photo-1598041343912-51fbfb1b8760"),
        url("photo-1712248673238-6c42ec3e0918"),
        url("photo-1691598150648-aa0c3f8fd6bb"),
        url("photo-1753732516594-7ce49ab040ca"),
        url("photo-1776344651378-5bbb6d68701c"),
    ],
}

def download_and_convert(src_url, dest):
    try:
        r = requests.get(src_url, headers=HEADERS, timeout=20, stream=True)
        r.raise_for_status()
        img = Image.open(BytesIO(r.content)).convert("RGB")
        img.save(dest, "WEBP", quality=85, method=6)
        print(f"  ✓ {dest.name}  ({img.width}×{img.height})")
        return True
    except Exception as e:
        print(f"  ✗ {src_url[:60]}  → {e}")
        return False

def run():
    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    total = 0
    for slot, urls in SLOTS.items():
        slot_dir = OUT_ROOT / slot
        slot_dir.mkdir(exist_ok=True)
        existing = list(slot_dir.glob("*.webp"))
        if len(existing) >= 5:
            print(f"[skip] {slot} — {len(existing)} images already present")
            total += len(existing)
            continue
        print(f"\n[{slot}]")
        for i, u in enumerate(urls, 1):
            dest = slot_dir / f"{i}.webp"
            if dest.exists():
                print(f"  – {dest.name} exists")
                total += 1
                continue
            if download_and_convert(u, dest):
                total += 1
            time.sleep(0.3)
    print(f"\nDone. {total}/60 webp files in assets/quiz-images/")

if __name__ == "__main__":
    run()
