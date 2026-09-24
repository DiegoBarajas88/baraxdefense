#!/usr/bin/env python3
"""Genera en/index.html a partir de index.html (español) y tools/i18n-en.json.

Uso (desde la raíz del sitio):  python3 tools/build_en.py
Requiere: pip install beautifulsoup4
Regla: todo texto nuevo en index.html debe llevar data-i18n="clave" (o data-i18n-html)
y su traducción en tools/i18n-en.json; el script avisa de las claves faltantes.
"""
import json, pathlib, sys
from bs4 import BeautifulSoup

ROOT = pathlib.Path(__file__).resolve().parent.parent
EN = json.loads((ROOT / "tools/i18n-en.json").read_text(encoding="utf-8"))
soup = BeautifulSoup((ROOT / "index.html").read_text(encoding="utf-8"), "html.parser")
missing = []

soup.html["lang"] = "en"
soup.title.string = EN["meta.title"]
soup.find("meta", attrs={"name": "description"})["content"] = EN["meta.desc"]
soup.find("meta", property="og:description")["content"] = EN["og.desc"]
soup.find("meta", property="og:url")["content"] = "https://www.baraxdefense.com/en/"
soup.find("meta", property="og:locale")["content"] = "en_US"
soup.find("meta", property="og:locale:alternate")["content"] = "es_CO"
soup.find("link", rel="canonical")["href"] = "https://www.baraxdefense.com/en/"

for el in soup.select("[data-i18n]"):
    k = el["data-i18n"]
    if k in EN: el.string = EN[k]
    else: missing.append(k)
for el in soup.select("[data-i18n-html]"):
    k = el["data-i18n-html"]
    if k in EN:
        el.clear(); el.append(BeautifulSoup(EN[k], "html.parser"))
    else: missing.append(k)

for a in soup.select(".lang a"):
    if a.get("hreflang") == "en": a["aria-current"] = "page"
    elif a.has_attr("aria-current"): del a["aria-current"]
soup.select_one(".lang")["aria-label"] = "Language / Idioma"
soup.select_one("#burger")["aria-label"] = EN["aria.menu"]
soup.select_one("nav.nav-links")["aria-label"] = "Main"

ATTRS = {
    "Credenciales": "Credentials", "Niveles de solución": "Solution levels",
    "Operación logística en puerto": "Port logistics operation",
    "Buques navegando en formación": "Ships sailing in formation",
    "BARAX Defense & Technology — inicio": "BARAX Defense & Technology — home",
    "BARAX — volver arriba": "BARAX — back to top", "Saltar al contenido": "Skip to content",
}
for el in soup.find_all(True):
    for attr in ("aria-label", "alt"):
        v = el.get(attr)
        if v in ATTRS: el[attr] = ATTRS[v]

out = ROOT / "en" / "index.html"
out.parent.mkdir(exist_ok=True)
out.write_text(str(soup), encoding="utf-8")
print(f"OK: {out.relative_to(ROOT)}")
if missing:
    print("Claves sin traducción:", ", ".join(sorted(set(missing)))); sys.exit(1)
