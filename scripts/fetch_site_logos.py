#!/usr/bin/env python3
"""Descarga logos/favicons de los sitios de Dany Solutions."""
from __future__ import annotations

import re
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests

OUT = Path(r"C:\Shared\Freelancer\Freelancer\backend\uploads\portfolio-logos")
OUT.mkdir(parents=True, exist_ok=True)

SITES = [
    ("podologia", "https://podologia.danysolutions.online/"),
    ("rehabilita", "https://rehabilita.danysolutions.online/"),
    ("moralesbox", "https://moralesbox.danysolutions.online/"),
    ("lozmar", "https://lozmar.danysolutions.online/"),
    ("pancitapio", "https://pancitapio.danysolutions.online/"),
    ("ambar", "https://ambar.danysolutions.online/"),
]

ICON_RE = re.compile(
    r"""<link[^>]+rel=["'](?:shortcut icon|icon|apple-touch-icon[^"']*)["'][^>]+href=["']([^"']+)["']"""
    r"|"
    r"""<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut icon|icon|apple-touch-icon[^"']*)["']""",
    re.I,
)
OG_RE = re.compile(
    r"""<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']""",
    re.I,
)
IMG_LOGO_RE = re.compile(
    r"""<img[^>]+(?:class|id|alt)=["'][^"']*(?:logo|brand)[^"']*["'][^>]+src=["']([^"']+)["']"""
    r"|"
    r"""<img[^>]+src=["']([^"']+)["'][^>]+(?:class|id|alt)=["'][^"']*(?:logo|brand)[^"']*["']""",
    re.I,
)


def pick_icon(html: str, base: str) -> str | None:
    best = None
    for m in ICON_RE.finditer(html):
        href = m.group(1) or m.group(2)
        if not href:
            continue
        full = urljoin(base, href)
        if full.lower().endswith((".png", ".svg", ".webp", ".jpg", ".jpeg")):
            return full
        best = best or full
    if best:
        return best
    m = OG_RE.search(html)
    if m:
        return urljoin(base, m.group(1))
    for m in IMG_LOGO_RE.finditer(html):
        href = m.group(1) or m.group(2)
        if href:
            return urljoin(base, href)
    for path in (
        "/favicon.png",
        "/apple-touch-icon.png",
        "/logo.png",
        "/logo-carnitas.png",
        "/favicon.ico",
    ):
        url = urljoin(base, path)
        try:
            r = requests.head(url, timeout=8, allow_redirects=True)
            if r.status_code == 200:
                return url
        except Exception:
            pass
    return None


def ext_from_url(url: str, content_type: str) -> str:
    path = urlparse(url).path.lower()
    for e in (".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico"):
        if path.endswith(e):
            return e
    ct = (content_type or "").lower()
    if "png" in ct:
        return ".png"
    if "jpeg" in ct or "jpg" in ct:
        return ".jpg"
    if "webp" in ct:
        return ".webp"
    if "gif" in ct:
        return ".gif"
    if "svg" in ct:
        return ".svg"
    if "icon" in ct:
        return ".ico"
    return ".png"


def main() -> None:
    results = {}
    for key, url in SITES:
        print(f"\n== {key} {url}")
        try:
            r = requests.get(url, timeout=20, headers={"User-Agent": "Mozilla/5.0"})
            r.raise_for_status()
            icon = pick_icon(r.text, url)
            print("  icon:", icon)
            if not icon:
                results[key] = None
                continue
            ir = requests.get(icon, timeout=20, headers={"User-Agent": "Mozilla/5.0"})
            ir.raise_for_status()
            ext = ext_from_url(icon, ir.headers.get("content-type", ""))
            out = OUT / f"{key}{ext}"
            out.write_bytes(ir.content)
            print(f"  saved {out.name} ({len(ir.content)} bytes)")
            results[key] = {"file": out.name, "source": icon, "ext": ext}
        except Exception as ex:
            print("  ERROR", ex)
            results[key] = None

    print("\nSUMMARY")
    for k, v in results.items():
        print(k, "->", v)


if __name__ == "__main__":
    main()
