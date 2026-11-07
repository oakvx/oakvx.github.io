#!/usr/bin/env python3
"""Generate crawler-friendly English pages for this static GitHub Pages site.

The Italian HTML remains the source of truth. Text comes from the existing
site.js/pages-en.js dictionaries, so the generated pages stay aligned with the
client-side language switch without adding a runtime or package dependency.
"""
from __future__ import annotations

import html
import json
import posixpath
import subprocess
import sys
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://oakvx.github.io"

# Every page with a language switch gets a real, indexable English counterpart.
PAGE_FILES = [
    "index.html",
    "chi-sono/index.html",
    "projects/autoofficina/index.html",
    "projects/beautify/index.html",
    "projects/brat-animator/index.html",
    "projects/synk/index.html",
    "assets/CREDITS.html",
    "fuori-orario/index.html",
    "fuori-orario/classic/index.html",
    "404.html",
]
SITEMAP_FILES = [
    "index.html",
    "chi-sono/index.html",
    "projects/synk/index.html",
    "projects/beautify/index.html",
    "projects/autoofficina/index.html",
    "projects/brat-animator/index.html",
    "assets/CREDITS.html",
    "fuori-orario/index.html",
]
VOID_ELEMENTS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
    "meta", "param", "source", "track", "wbr",
}
RAW_TEXT_ELEMENTS = {"script", "style"}


@dataclass
class Text:
    value: str


@dataclass
class Raw:
    value: str


@dataclass
class Comment:
    value: str


@dataclass
class Element:
    tag: str
    attrs: list[tuple[str, str | None]] = field(default_factory=list)
    children: list[object] = field(default_factory=list)

    def get(self, name: str, default: str | None = None) -> str | None:
        name = name.lower()
        for key, value in self.attrs:
            if key == name:
                return value
        return default

    def set(self, name: str, value: str | None) -> None:
        name = name.lower()
        for index, (key, _) in enumerate(self.attrs):
            if key == name:
                self.attrs[index] = (name, value)
                return
        self.attrs.append((name, value))

    def remove(self, name: str) -> None:
        name = name.lower()
        self.attrs = [(key, value) for key, value in self.attrs if key != name]

    def has(self, name: str) -> bool:
        name = name.lower()
        return any(key == name for key, _ in self.attrs)


class DocumentParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.root = Element("#document")
        self.stack = [self.root]

    def handle_decl(self, decl: str) -> None:
        self.stack[-1].children.append(Raw(f"<!{decl}>"))

    def handle_comment(self, data: str) -> None:
        self.stack[-1].children.append(Comment(data))

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        node = Element(tag.lower(), [(key.lower(), value) for key, value in attrs])
        self.stack[-1].children.append(node)
        if tag.lower() not in VOID_ELEMENTS:
            self.stack.append(node)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        node = Element(tag.lower(), [(key.lower(), value) for key, value in attrs])
        self.stack[-1].children.append(node)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break

    def handle_data(self, data: str) -> None:
        self.stack[-1].children.append(Text(data))


def parse_html(source: str) -> Element:
    parser = DocumentParser()
    parser.feed(source)
    parser.close()
    return parser.root


def serialize(node: object, parent_tag: str = "") -> str:
    if isinstance(node, Text):
        return node.value if parent_tag in RAW_TEXT_ELEMENTS else html.escape(node.value, quote=False)
    if isinstance(node, Raw):
        return node.value
    if isinstance(node, Comment):
        return f"<!--{node.value}-->"
    if not isinstance(node, Element):
        return ""
    if node.tag == "#document":
        return "".join(serialize(child) for child in node.children)
    attrs = "".join(
        f" {key}" if value is None else f' {key}="{html.escape(str(value), quote=True)}"'
        for key, value in node.attrs
    )
    start = f"<{node.tag}{attrs}>"
    if node.tag in VOID_ELEMENTS:
        return start
    body = "".join(serialize(child, node.tag) for child in node.children)
    return f"{start}{body}</{node.tag}>"


def walk(node: Element):
    yield node
    for child in node.children:
        if isinstance(child, Element):
            yield from walk(child)


def inner_text(node: Element) -> str:
    return "".join(
        child.value if isinstance(child, (Text, Raw)) else inner_text(child) if isinstance(child, Element) else ""
        for child in node.children
    )


def set_text(node: Element, value: str, raw_html: bool = False) -> None:
    if raw_html:
        fragment = parse_html(value)
        node.children = fragment.children
    else:
        node.children = [Text(value)]


def source_route(relative_file: str) -> str:
    if relative_file == "index.html":
        return "/"
    if relative_file.endswith("/index.html"):
        return "/" + relative_file[:-len("index.html")]
    return "/" + relative_file


ROUTE_TO_EN = {source_route(file): "/en/" + source_route(file).lstrip("/") for file in PAGE_FILES}
ROUTE_TO_EN["/"] = "/en/"


def canonical_route(path: str) -> str:
    if not path:
        return "/"
    if not path.startswith("/"):
        path = "/" + path
    path = posixpath.normpath(path)
    if path == ".":
        path = "/"
    if path.endswith("/index.html"):
        path = path[:-len("index.html")]
    existing_file = ROOT / path.lstrip("/")
    if path != "/" and not existing_file.is_file() and path.endswith("/") is False and path not in {"/404.html", "/assets/CREDITS.html"}:
        # Preserve extensionless files; slash-terminate extensionless directory routes.
        if Path(path).suffix == "":
            path += "/"
    return path


def route_url(route: str, query: str = "", fragment: str = "") -> str:
    route = canonical_route(route)
    return urlunsplit(("", "", route, query, fragment))


def clean_query(query: str) -> str:
    return urlencode([(key, value) for key, value in parse_qsl(query, keep_blank_values=True) if key != "lang"])


def resolve_local(value: str, from_route: str) -> tuple[str, str, str] | None:
    value = value.strip()
    if not value or value.startswith(("#", "data:", "blob:", "javascript:", "mailto:", "tel:", "sms:", "about:")):
        return None
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc:
        return None
    if not parsed.path:
        path = from_route
    elif parsed.path.startswith("/"):
        path = parsed.path
    else:
        path = posixpath.join(posixpath.dirname(from_route), parsed.path)
    path = canonical_route(path)
    return path, clean_query(parsed.query), parsed.fragment


def translated_url(path: str, query: str = "", fragment: str = "") -> str:
    en_path = ROUTE_TO_EN.get(path)
    if en_path:
        return route_url(en_path, query, fragment)
    query_pairs = parse_qsl(query, keep_blank_values=True)
    if not any(key == "lang" for key, _ in query_pairs):
        query_pairs.append(("lang", "en"))
    return route_url(path, urlencode(query_pairs), fragment)


def root_url(path: str, query: str = "", fragment: str = "") -> str:
    return route_url(path, query, fragment)


def rewrite_srcset(value: str, from_route: str) -> str:
    rewritten = []
    for candidate in value.split(","):
        parts = candidate.strip().split()
        if not parts:
            continue
        resolved = resolve_local(parts[0], from_route)
        if resolved:
            parts[0] = root_url(*resolved)
        rewritten.append(" ".join(parts))
    return ", ".join(rewritten)


def public(route: str) -> str:
    return ORIGIN + canonical_route(route)


def find_by_id(root: Element, ident: str) -> Element | None:
    return next((node for node in walk(root) if node.get("id") == ident), None)


def get_seo(root: Element, route: str) -> dict[str, str]:
    script = find_by_id(root, "seo-translations")
    translations = {}
    if script:
        try:
            translations = json.loads(inner_text(script))
        except (json.JSONDecodeError, TypeError):
            translations = {}
    seo = dict(translations.get("en", {}))
    if route == "/fuori-orario/":
        seo.update({
            "title": "AFTER HOURS | Gabriele Lucia — Developer & Graphic Designer",
            "description": "AFTER HOURS: the channel for what stays open after I log off. Personal projects, consoles, games, languages and curiosities by Gabriele Lucia (oakvx).",
            "image": ORIGIN + "/assets/social-home-en.png",
            "image_alt": "Gabriele Lucia / oakvx — After Hours.",
        })
    elif route == "/fuori-orario/classic/":
        seo.update({
            "title": "After Hours | Gabriele Lucia — Developer & Graphic Designer",
            "description": "The classic AFTER HOURS page: projects, consoles, games, languages and curiosities by Gabriele Lucia (oakvx).",
            "image": ORIGIN + "/assets/social-home-en.png",
            "image_alt": "Gabriele Lucia / oakvx — After Hours.",
        })
    if not seo:
        title = next((inner_text(n) for n in walk(root) if n.tag == "title"), "Gabriele Lucia / oakvx")
        description = next((n.get("content", "") for n in walk(root) if n.tag == "meta" and n.get("name", "").lower() == "description"), "")
        seo = {"title": title, "description": description, "image": ORIGIN + "/assets/social-home-en.png", "image_alt": "Gabriele Lucia / oakvx — portfolio."}
    en_route = ROUTE_TO_EN[route]
    canonical_en_route = ROUTE_TO_EN["/fuori-orario/"] if route == "/fuori-orario/classic/" else en_route
    seo["canonical"] = public(canonical_en_route)
    seo.setdefault("image", ORIGIN + "/assets/social-home-en.png")
    seo.setdefault("image_alt", "Gabriele Lucia / oakvx — portfolio.")
    return seo


def update_schema(value: object, seo: dict[str, str], current_route: str) -> object:
    if isinstance(value, list):
        return [update_schema(item, seo, current_route) for item in value]
    if not isinstance(value, dict):
        return value
    result = {key: update_schema(item, seo, current_route) for key, item in value.items()}
    types = result.get("@type", [])
    if isinstance(types, str):
        types = [types]
    if "WebPage" in types:
        result["url"] = seo["canonical"]
        result["name"] = seo["title"]
        result["description"] = seo["description"]
        result["inLanguage"] = "en"
        result["@id"] = seo["canonical"].rstrip("/") + "#webpage"
    if "ImageObject" in types:
        result["url"] = seo["image"]
        result["contentUrl"] = seo["image"]
        result["caption"] = seo["image_alt"]
        result["inLanguage"] = "en"
    for key in ("url", "item"):
        url = result.get(key)
        if isinstance(url, str) and url.startswith(ORIGIN):
            parsed = urlsplit(url)
            route = canonical_route(parsed.path)
            if route in ROUTE_TO_EN:
                result[key] = public(ROUTE_TO_EN[route]) + (("?" + parsed.query) if parsed.query else "") + (("#" + parsed.fragment) if parsed.fragment else "")
    ident = result.get("@id")
    if isinstance(ident, str) and ident.startswith(ORIGIN):
        parsed = urlsplit(ident)
        route = canonical_route(parsed.path)
        if route in ROUTE_TO_EN and parsed.fragment not in {"person", "website"}:
            result["@id"] = public(ROUTE_TO_EN[route]).rstrip("/") + ("#" + parsed.fragment if parsed.fragment else "")
    language = result.get("inLanguage")
    if language == "it":
        result["inLanguage"] = "en"
    return result


def translate_document(doc: Element, source_file: str, en: dict[str, str], dyn: dict[str, str]) -> tuple[str, dict[str, str]]:
    route = source_route(source_file)
    en_route = ROUTE_TO_EN[route]
    seo = get_seo(doc, route)

    # Replace the small, runtime-only labels as well as the text nodes. The
    # script still owns interactive state after load, while crawlers get English.
    for node in walk(doc):
        if node.tag == "html":
            node.set("lang", "en")
            node.set("data-static-lang", "en")
            node.set("data-lang-it-url", route)
            node.set("data-lang-en-url", en_route)
        key = node.get("data-i18n")
        if key and key in en:
            set_text(node, str(en[key]))
        html_key = node.get("data-i18n-html")
        if html_key and html_key in en:
            set_text(node, str(en[html_key]), raw_html=True)
        aria_key = node.get("data-i18n-aria")
        if aria_key and aria_key in en:
            node.set("aria-label", str(en[aria_key]))
        alt_key = node.get("data-i18n-alt")
        if alt_key and alt_key in en:
            node.set("alt", str(en[alt_key]))
        if node.has("data-burger-label"):
            set_text(node, str(dyn.get("menuOpen", "Open menu")))
        if node.has("data-motion-label"):
            set_text(node, str(dyn.get("pause", "Pause animations")))
        if node.has("data-sound-label") or node.get("aria-label") == "Attiva audio":
            node.set("aria-label", "Enable sound")
            if node.has("data-sound-label"):
                set_text(node, "Enable sound")
        if node.tag == "title":
            set_text(node, seo["title"])
        if node.tag == "meta":
            name = (node.get("name") or "").lower()
            prop = (node.get("property") or "").lower()
            if name == "description":
                node.set("content", seo["description"])
            elif name == "twitter:title":
                node.set("content", seo["title"])
            elif name == "twitter:description":
                node.set("content", seo["description"])
            elif name in {"twitter:image", "twitter:image:secure_url"}:
                node.set("content", seo["image"])
            elif name == "twitter:image:alt":
                node.set("content", seo["image_alt"])
            elif prop == "og:title":
                node.set("content", seo["title"])
            elif prop == "og:description":
                node.set("content", seo["description"])
            elif prop in {"og:image", "og:image:secure_url"}:
                node.set("content", seo["image"])
            elif prop == "og:image:alt":
                node.set("content", seo["image_alt"])
            elif prop == "og:url":
                node.set("content", seo["canonical"])
            elif prop == "og:locale":
                node.set("content", "en_GB")
            elif prop == "og:locale:alternate":
                node.set("content", "it_IT")
        if node.tag == "script" and node.get("type", "").lower() == "application/ld+json":
            try:
                parsed = json.loads(inner_text(node))
                set_text(node, json.dumps(update_schema(parsed, seo, route), ensure_ascii=False, separators=(",", ":")))
            except (json.JSONDecodeError, TypeError):
                pass
        if node.tag == "script" and node.get("id") == "seo-translations":
            try:
                translations = json.loads(inner_text(node))
                translations.setdefault("en", {}).update(seo)
                set_text(node, json.dumps(translations, ensure_ascii=False, separators=(",", ":")))
            except (json.JSONDecodeError, TypeError):
                pass

    # Static files live one directory deeper than their Italian source. Root
    # URLs keep CSS, scripts, images and in-page links stable from every route.
    for node in walk(doc):
        if node.tag == "link":
            rel = (node.get("rel") or "").lower().split()
            hreflang = (node.get("hreflang") or "").lower()
            if "canonical" in rel:
                node.set("href", seo["canonical"])
                continue
            if "alternate" in rel and hreflang in {"it", "en", "x-default"}:
                alternate_route = "/fuori-orario/" if route == "/fuori-orario/classic/" else route
                alternate_en_route = ROUTE_TO_EN[alternate_route]
                node.set("href", public(alternate_en_route if hreflang == "en" else alternate_route))
                continue
        if node.tag == "a" and node.get("href"):
            original = node.get("href") or ""
            resolved = resolve_local(original, route)
            if resolved:
                path, query, fragment = resolved
                italian_href = root_url(path, query, fragment)
                if node.has("data-langlink"):
                    english_href = translated_url(path, query, fragment)
                    node.set("href", english_href)
                    node.set("data-en-href", english_href)
                    node.set("data-it-href", italian_href)
                elif path in ROUTE_TO_EN:
                    node.set("href", translated_url(path, query, fragment))
                else:
                    node.set("href", italian_href)
        for attr in ("src", "poster", "formaction"):
            value = node.get(attr)
            if value:
                resolved = resolve_local(value, route)
                if resolved:
                    node.set(attr, root_url(*resolved))
        srcset = node.get("srcset")
        if srcset:
            node.set("srcset", rewrite_srcset(srcset, route))
        if node.tag == "link" and node.get("href"):
            resolved = resolve_local(node.get("href") or "", route)
            if resolved:
                node.set("href", root_url(*resolved))
        node.set("data-lang-en-url", node.get("data-lang-en-url") or en_route) if node.tag == "html" else None

    # Ensure the static EN copy never inherits an Italian preference before
    # the shared script starts; language changes route between real documents.
    output = serialize(doc)
    return output, seo


def extract_dictionaries() -> tuple[dict[str, str], dict[str, str]]:
    result = subprocess.run(
        ["node", str(ROOT / "scripts/extract-translations.cjs")],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    data = json.loads(result.stdout)
    return data["en"], data["dyn"]


def generate_sitemap() -> None:
    # Use straightforward XML so the sitemap stays readable in code review.
    ns = "http://www.sitemaps.org/schemas/sitemap/0.9"
    xhtml = "http://www.w3.org/1999/xhtml"
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<urlset xmlns="{ns}" xmlns:xhtml="{xhtml}">',
    ]
    for relative in SITEMAP_FILES:
        route = source_route(relative)
        en_route = ROUTE_TO_EN[route]
        for loc in (route, en_route):
            lines.append(f'  <url><loc>{public(loc)}</loc>')
            lines.append(f'    <xhtml:link rel="alternate" hreflang="it" href="{public(route)}"/>')
            lines.append(f'    <xhtml:link rel="alternate" hreflang="en" href="{public(en_route)}"/>')
            lines.append(f'    <xhtml:link rel="alternate" hreflang="x-default" href="{public(route)}"/>')
            lines.append("  </url>")
    lines.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    en, dyn = extract_dictionaries()
    missing: set[str] = set()
    generated = 0
    for relative in PAGE_FILES:
        source_path = ROOT / relative
        if not source_path.exists():
            raise FileNotFoundError(source_path)
        document = parse_html(source_path.read_text(encoding="utf-8"))
        for node in walk(document):
            for attr in ("data-i18n", "data-i18n-html", "data-i18n-aria", "data-i18n-alt"):
                key = node.get(attr)
                if key and key not in en:
                    missing.add(key)
        output, _ = translate_document(document, relative, en, dyn)
        output_path = ROOT / "en" / relative
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(output, encoding="utf-8")
        generated += 1
    generate_sitemap()
    if missing:
        print("Missing EN dictionary entries:", file=sys.stderr)
        for key in sorted(missing):
            print(f"  {key}", file=sys.stderr)
        return 1
    print(f"Generated {generated} English HTML pages under /en/ and refreshed sitemap.xml.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
