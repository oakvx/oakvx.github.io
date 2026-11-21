#!/usr/bin/env python3
"""Dependency-free smoke, link, SEO and accessibility checks for the static site."""
from __future__ import annotations

import posixpath
import subprocess
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

sys.dont_write_bytecode = True
from build_static import ORIGIN, PAGE_FILES, ROUTE_TO_EN, SITEMAP_FILES, source_route

ROOT = Path(__file__).resolve().parents[1]
EXTERNAL_GITHUB_PAGES = ("/autoOfficina/", "/bratAnimator/", "/topGun/")


class AuditParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.attrs: dict[str, list[dict[str, str | None]]] = {}
        self.text: dict[str, list[list[str]]] = {"a": [], "button": []}
        self.stack: list[str] = []
        self.title_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        self.attrs.setdefault(tag, []).append(values)
        if tag in self.text:
            self.text[tag].append([])
        if tag == "img" and "a" in self.stack and values.get("alt"):
            self.text["a"][-1].append(str(values["alt"]))
        if tag not in {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}:
            self.stack.append(tag)

    def handle_endtag(self, tag: str) -> None:
        if tag in self.stack:
            index = len(self.stack) - 1 - self.stack[::-1].index(tag)
            del self.stack[index:]

    def handle_data(self, data: str) -> None:
        if "title" in self.stack:
            self.title_parts.append(data)
        for tag in self.text:
            if tag in self.stack and self.text[tag]:
                self.text[tag][-1].append(data)


def local_target(url: str, from_route: str = "/") -> Path | None:
    parsed = urlsplit(url)
    if parsed.scheme or parsed.netloc:
        if parsed.scheme in {"http", "https"} and parsed.netloc.lower() in {"oakvx.github.io", "www.oakvx.github.io"}:
            path = parsed.path
        else:
            return None
    else:
        path = parsed.path
        if path and not path.startswith("/"):
            path = posixpath.join(posixpath.dirname(from_route), path)
    if not path:
        return None
    if path.startswith(EXTERNAL_GITHUB_PAGES):
        return None
    target = (ROOT / path.lstrip("/")).resolve()
    if target.is_file():
        return target
    if target.is_dir() or path.endswith("/"):
        target = target / "index.html"
    elif not target.suffix:
        target = target / "index.html"
    return target


def audit_page(relative: str, language: str, route: str, check_seo: bool = False) -> tuple[int, int]:
    path = ROOT / relative
    if not path.is_file():
        raise AssertionError(f"missing page: {relative}")
    parser = AuditParser()
    parser.feed(path.read_text(encoding="utf-8"))
    html_attrs = parser.attrs.get("html", [{}])[0]
    if html_attrs.get("lang") != language:
        raise AssertionError(f"{relative}: expected <html lang=\"{language}\">")
    if not "".join(parser.title_parts).strip():
        raise AssertionError(f"{relative}: missing page title")
    descriptions = [a.get("content", "") for a in parser.attrs.get("meta", []) if (a.get("name") or "").lower() == "description"]
    if not descriptions or not descriptions[0]:
        raise AssertionError(f"{relative}: missing meta description")
    if check_seo:
        canonicals = [a.get("href", "") for a in parser.attrs.get("link", []) if "canonical" in (a.get("rel") or "").lower().split()]
        if len(canonicals) != 1 or not canonicals[0].startswith(ORIGIN + "/"):
            raise AssertionError(f"{relative}: missing or invalid canonical URL")
        if "?lang=en" in canonicals[0]:
            raise AssertionError(f"{relative}: canonical should not use the client-side language query")
        alternates = {(a.get("hreflang") or "").lower(): a.get("href", "") for a in parser.attrs.get("link", []) if "alternate" in (a.get("rel") or "").lower().split()}
        if alternates.get("en") != canonicals[0] and not relative.endswith("fuori-orario/classic/index.html"):
            raise AssertionError(f"{relative}: English hreflang must match the canonical URL")
        if not alternates.get("it", "").startswith(ORIGIN + "/"):
            raise AssertionError(f"{relative}: missing Italian hreflang alternate")

    checked = 0
    images = 0
    for tag, attrs_list in parser.attrs.items():
        for control_index, attrs in enumerate(attrs_list):
            if tag == "img":
                images += 1
                if "alt" not in attrs:
                    raise AssertionError(f"{relative}: image is missing alt text")
            if tag in {"a", "button"}:
                label = "".join(parser.text[tag][control_index]).strip()
                if not (label or attrs.get("aria-label") or attrs.get("aria-labelledby") or attrs.get("title")):
                    raise AssertionError(f"{relative}: unnamed {tag} control")
            if "data-cycle" in attrs and not (attrs.get("aria-label") or attrs.get("aria-labelledby")):
                raise AssertionError(f"{relative}: avatar pose control is missing an accessible label")
            if tag == "a" and attrs.get("target") == "_blank":
                rel = set((attrs.get("rel") or "").lower().split())
                if "noopener" not in rel:
                    raise AssertionError(f"{relative}: target=_blank link should use rel=noopener")
            refs = []
            for name in ("href", "src", "poster", "formaction", "data-avatar-animated", "data-avatar-still"):
                value = attrs.get(name)
                if value:
                    refs.append(value)
            if attrs.get("srcset"):
                refs.extend(candidate.strip().split()[0] for candidate in (attrs["srcset"] or "").split(",") if candidate.strip())
            for ref in refs:
                target = local_target(ref, route)
                if target is not None:
                    checked += 1
                    if not target.is_file():
                        try:
                            display_target = target.relative_to(ROOT)
                        except ValueError:
                            display_target = target
                        raise AssertionError(f"{relative}: broken local reference {ref!r} -> {display_target}")
    return checked, images


def audit_wii_home(relative: str) -> None:
    parser = AuditParser()
    parser.feed((ROOT / relative).read_text(encoding="utf-8"))
    active = [attrs for attrs in parser.attrs.get("a", []) if attrs.get("data-channel")]
    empty = [attrs for attrs in parser.attrs.get("span", []) if "home-channel-empty" in (attrs.get("class") or "").split()]
    pages = [attrs for attrs in parser.attrs.get("div", []) if "data-home-channel-page" in attrs]
    arrows = [attrs for attrs in parser.attrs.get("button", []) if "data-home-wii-page-prev" in attrs or "data-home-wii-page-next" in attrs]
    if len(active) != 6 or len(empty) != 42 or len(active) + len(empty) != 48 or len(pages) != 4 or len(arrows) != 2:
        raise AssertionError(f"{relative}: Wii home must have four 4×3 pages, with six live portfolio channels")
    css = (ROOT / "assets/wiiu/home.css").read_text(encoding="utf-8")
    if "aspect-ratio: 16 / 9" not in css or "grid-template-columns: repeat(4,minmax(0,1fr))" not in css or "width: 400%" not in css:
        raise AssertionError("homepage Wii menu must preserve its 16:9, four-column, four-page layout")
    if "font-family: Wii,Arial,sans-serif" not in css:
        raise AssertionError("homepage titles should use the preserved Wii menu font")
    resources = (
        "assets/wii-boot/original/native/ui/menu-chrome.webp",
        "assets/wii-boot/original/native/ui/focus-chrome.webp",
        "assets/wii-boot/original/native/ui/empty-chrome.webp",
        "assets/wii-boot/original/native/ui/button-ring.png",
        "assets/wii-boot/original/native/ui/wii-button.png",
        "assets/wii-boot/original/native/ui/sd.png",
        "assets/wii-boot/original/native/ui/mail-button-base.png",
        "assets/wii-boot/original/native/ui/mail-symbol.png",
        "assets/wii-boot/original/ui/bg-pattern.png",
        "assets/wii-boot/original/ui/arrow-left.png",
        "assets/wii-boot/original/ui/arrow-right.png",
        "assets/wii-boot/original/native/clock/0.png",
        "assets/wii-boot/original/native/clock/colon.png",
        "assets/wii-boot/original/fonts/menu.woff2",
    )
    missing = [asset for asset in resources if not (ROOT / asset).is_file()]
    if missing:
        raise AssertionError(f"homepage Wii menu is missing native UI assets: {', '.join(missing)}")


def main() -> int:
    failures = []
    for relative in ("index.html", "en/index.html"):
        audit_wii_home(relative)
    js_files = sorted([*ROOT.rglob("*.js"), *ROOT.rglob("*.cjs")])
    js_files = [path for path in js_files if ".git" not in path.parts]
    for path in js_files:
        result = subprocess.run(["node", "--check", str(path)], cwd=ROOT, capture_output=True, text=True)
        if result.returncode:
            failures.append(f"JavaScript syntax error in {path.relative_to(ROOT)}:\n{result.stderr.strip()}")
    if failures:
        raise AssertionError("\n".join(failures))

    checked_refs = image_count = 0
    for source in PAGE_FILES:
        source_route_path = source_route(source)
        english_route = ROUTE_TO_EN[source_route_path]
        for relative, language, route, check_seo in (
            (source, "it", source_route_path, False),
            ((Path("en") / source).as_posix(), "en", english_route, True),
        ):
            refs, images = audit_page(relative, language, route, check_seo)
            checked_refs += refs
            image_count += images

    sitemap = ET.parse(ROOT / "sitemap.xml").getroot()
    namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9", "xhtml": "http://www.w3.org/1999/xhtml"}
    locations = [node.text or "" for node in sitemap.findall("sm:url/sm:loc", namespace)]
    if not locations:
        raise AssertionError("sitemap.xml has no URLs")
    expected_locations = set()
    for source in SITEMAP_FILES:
        route = source_route(source)
        expected_locations.update({ORIGIN + route, ORIGIN + ROUTE_TO_EN[route]})
    if set(locations) != expected_locations or len(locations) != len(expected_locations):
        raise AssertionError("sitemap.xml does not contain exactly the configured IT/EN page pairs")
    for location in locations:
        target = local_target(location)
        if target is None or not target.is_file():
            raise AssertionError(f"sitemap URL does not resolve to a file: {location}")
    for url in locations:
        node = next((item for item in sitemap.findall("sm:url", namespace) if item.findtext("sm:loc", namespaces=namespace) == url), None)
        alternates = {link.get("hreflang", ""): link.get("href", "") for link in (node.findall("xhtml:link", namespace) if node is not None else [])}
        if "it" not in alternates or "en" not in alternates:
            raise AssertionError(f"sitemap entry is missing language alternates: {url}")

    print(f"OK: {len(js_files)} JavaScript files parse; {len(PAGE_FILES)} IT/EN page pairs, {checked_refs} local references, {image_count} images and {len(locations)} sitemap URLs checked.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (AssertionError, OSError, ET.ParseError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1)
