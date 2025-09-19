import re
import sys
from html.parser import HTMLParser
from pathlib import Path

titles = {
    'gulaschsuppe': 'Gulaschsuppe',
    'pasta-all-amatriciana': "Pasta all'Amatriciana",
    'spaghetti-alla-carbonara': 'Spaghetti alla Carbonara',
    'risotto-ai-funghi': 'Risotto ai Funghi',
    'risotto-al-radicchio-di-treviso': 'Risotto al Radicchio di Treviso',
    'capesante-gratinate': 'Capesante Gratinate',
    'capesante-all-olio': "Capesante all'Olio",
    'baccala-alla-vicentina': 'Baccalà alla Vicentina',
    'mazzancolle-al-limone': 'Mazzancolle al Limone',
    'seppie-in-umido': 'Seppie in Umido',
    'pollo-al-curry': 'Pollo al Curry',
    'filetto-al-pepe-verde': 'Filetto al Pepe Verde',
    'filetto-alla-wellington': 'Filetto alla Wellington',
    'tiramisu': 'Tiramisù',
    'fritelle-di-mele': 'Frittelle di Mele',
    'crostata-di-ricotta': 'Crostata di Ricotta',
    'crema-catalana': 'Crema Catalana',
}

emoji_map = {
    'gulaschsuppe': '🍲',
    'pasta-all-amatriciana': '🍝',
    'spaghetti-alla-carbonara': '🍝',
    'risotto-ai-funghi': '🍚',
    'risotto-al-radicchio-di-treviso': '🍚',
    'capesante-gratinate': '🐚',
    'capesante-all-olio': '🐚',
    'baccala-alla-vicentina': '🐟',
    'mazzancolle-al-limone': '🦐',
    'seppie-in-umido': '🐙',
    'pollo-al-curry': '🍗',
    'filetto-al-pepe-verde': '🥩',
    'filetto-alla-wellington': '🥩',
    'tiramisu': '🍰',
    'fritelle-di-mele': '🍎',
    'crostata-di-ricotta': '🥧',
    'crema-catalana': '🍮',
}

class TextInnerExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.collecting = False
        self.depth = 0
        self.blocks = []
        self.current = []

    def handle_starttag(self, tag, attrs):
        start_text = self.get_starttag_text()
        if tag == 'div':
            class_attr = next((v for (k, v) in attrs if k == 'class'), '')
            if 'text-inner' in class_attr.split():
                if not self.collecting:
                    self.collecting = True
                    self.depth = 1
                    self.current.append(start_text)
                    return
        if self.collecting:
            self.depth += 1
            self.current.append(start_text)

    def handle_endtag(self, tag):
        if self.collecting:
            self.current.append(f'</{tag}>')
            self.depth -= 1
            if self.depth == 0:
                self.blocks.append(''.join(self.current))
                self.current = []
                self.collecting = False

    def handle_data(self, data):
        if self.collecting:
            self.current.append(data)

    def handle_startendtag(self, tag, attrs):
        if self.collecting:
            start_text = self.get_starttag_text()
            self.current.append(start_text)


def clean_text(html):
    text = re.sub('<[^<]+?>', ' ', html)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def build_intro(html):
    text = clean_text(html)
    if not text:
        return 'Ricetta storica dal quaderno di ZanellaZen con ingredienti e passaggi originali.'
    return text[:200] + ('…' if len(text) > 200 else '')


def convert_file(path: Path):
    raw = path.read_text(encoding='utf-8', errors='ignore')
    parser = TextInnerExtractor()
    parser.feed(raw)
    if not parser.blocks:
        raise RuntimeError(f'No text-inner block found in {path}')
    content = max(parser.blocks, key=lambda x: len(clean_text(x)))

    recipe_id = path.stem
    title = titles.get(recipe_id, recipe_id.replace('-', ' ').title())
    emoji = emoji_map.get(recipe_id, '🍽️')
    intro = build_intro(content)

    description = f"Ricetta di {title} dalla raccolta ZanellaZen: ingredienti originali e procedura completa."

    template = f"""<!DOCTYPE html>
<html lang=\"it\">
<head>
  <meta charset=\"UTF-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
  <title>{title} - ZanellaZen</title>
  <meta name=\"description\" content=\"{description}\">
  <link rel=\"stylesheet\" href=\"../../css/style.css\">
</head>
<body>
  <div data-include=\"/components/header.html\"></div>

  <main class=\"main-content\">
    <div class=\"container\">
      <article class=\"recipe-page\" data-recipe-id=\"{recipe_id}\">
        <header class=\"recipe-page__header\">
          <div class=\"recipe-page__emoji\">{emoji}</div>
          <div>
            <h1 data-recipe-title>{title}</h1>
            <p class=\"recipe-page__intro\">{intro}</p>
          </div>
        </header>

        <div class=\"legacy-content\" data-recipe-content>
{content}
        </div>
      </article>
    </div>
  </main>

  <div data-include=\"/components/footer.html\"></div>
  <script src=\"../../js/include.js\"></script>
  <script src=\"../../js/script.js\"></script>
</body>
</html>
"""
    path.write_text(template, encoding='utf-8')


def main():
    if len(sys.argv) < 2:
        print('Usage: python tools/convert_recipe.py <file1> [file2...]')
        sys.exit(1)
    for arg in sys.argv[1:]:
        p = Path(arg)
        if not p.exists():
            raise SystemExit(f'File not found: {p}')
        convert_file(p)

if __name__ == '__main__':
    main()
