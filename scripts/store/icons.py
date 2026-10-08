"""Gera os ícones do Minha Bíblia (SVG -> PNG via Playwright)."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]  # raiz do projeto
OUT = ROOT / 'assets'
FOREST, FOREST_DARK, CREAM, MUSTARD, PAPER = '#2B6E52', '#1F5540', '#FAF6EE', '#C9922E', '#FFFFFF'


def book(scale=1.0, cx=512, cy=512, page=PAPER, edge=CREAM, accent=MUSTARD, mono=False):
    """Bíblia aberta centrada em (cx, cy). Geometria desenhada para o canvas 1024
    e cabe no círculo de segurança do adaptive icon (raio ~338)."""
    g = f'<g transform="translate({cx} {cy}) scale({scale}) translate(-512 -512)">'
    # Espessura das páginas (camada de baixo)
    left_edge = 'M505,402 Q392,350 238,368 L238,684 Q392,664 505,716 Z'
    right_edge = 'M519,402 Q632,350 786,368 L786,684 Q632,664 519,716 Z'
    left = 'M505,382 Q396,328 252,346 L252,660 Q396,642 505,694 Z'
    right = 'M519,382 Q628,328 772,346 L772,660 Q628,642 519,694 Z'
    cross = 'M624,420 h36 v56 h44 v34 h-44 v100 h-36 v-100 h-44 v-34 h44 Z'
    ribbon = 'M490,690 h44 v118 l-22,-22 l-22,22 Z'
    if mono:
        g += (f'<defs><mask id="m"><rect width="1024" height="1024" fill="#fff"/>'
              f'<path d="{cross}" fill="#000"/></mask></defs>'
              f'<g fill="#fff" mask="url(#m)"><path d="{left}"/><path d="{right}"/></g>'
              f'<path d="{ribbon}" fill="#fff"/>')
    else:
        g += (f'<path d="{left_edge}" fill="{edge}" opacity=".55"/><path d="{right_edge}" fill="{edge}" opacity=".55"/>'
              f'<path d="{left}" fill="{page}"/><path d="{right}" fill="{page}"/>'
              # linhas de texto discretas na página esquerda
              + ''.join(f'<rect x="300" y="{y}" width="{w}" height="14" rx="7" fill="{FOREST}" opacity=".16"/>'
                        for y, w in [(420, 160), (462, 168), (504, 150), (546, 164), (588, 120)])
              + f'<path d="{cross}" fill="{accent}"/>'
              f'<path d="{ribbon}" fill="{accent}"/>')
    return g + '</g>'


def svg(body, size=1024, bg=None, rx=0):
    rect = f'<rect width="1024" height="1024" rx="{rx}" fill="{bg}"/>' if bg else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 1024 1024">'
            f'{rect}{body}</svg>')


ICONS = {
    # Ícone legado / Play Store: quadrado cheio (o Android e a loja aplicam a máscara)
    'icon.png': (svg(book(1.3), bg=FOREST), 1024),
    'play-store-icon-512.png': (svg(book(1.3), size=512, bg=FOREST), 512),
    # Adaptive icon (Android 8+)
    'android-icon-foreground.png': (svg(book(1.0)), 1024),
    'android-icon-background.png': (svg('', bg=FOREST), 1024),
    'android-icon-monochrome.png': (svg(book(1.0, mono=True)), 1024),
    # Splash: ícone arredondado sobre o creme
    'splash-icon.png': (svg(book(0.98), bg=FOREST, rx=230), 1024),
    'favicon.png': (svg(book(1.3), size=48, bg=FOREST, rx=230), 48),
}

if __name__ == '__main__':
    with sync_playwright() as p:
        b = p.chromium.launch()
        for name, (s, size) in ICONS.items():
            pg = b.new_page(viewport={'width': size, 'height': size})
            pg.set_content(f'<html><body style="margin:0;background:transparent">{s}</body></html>')
            dest = (ROOT / 'store' / 'play-store' if name.startswith('play-store') else OUT) / name
            dest.parent.mkdir(parents=True, exist_ok=True)
            pg.locator('svg').screenshot(path=str(dest), omit_background=True)
            if name.startswith('play-store'):  # a Play pede PNG 32 bits
                from PIL import Image
                Image.open(dest).convert('RGBA').save(dest)
            pg.close()
        b.close()
    print('ok')
