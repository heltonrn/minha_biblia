"""Uso: pip install playwright && python -m playwright install chromium
    python scripts/store/icons.py   (ícones em assets/)
    python scripts/store/store.py   (gráficos em store/play-store/)

Gera feature graphic e screenshots (mockups fiéis às telas do app) via Playwright."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import icons

ROOT = Path(__file__).resolve().parents[2]  # raiz do projeto
FONTS = ROOT / 'node_modules' / '@expo-google-fonts'
OUT = ROOT / 'store' / 'play-store'; OUT.mkdir(parents=True, exist_ok=True)
HTML = ROOT / 'store' / 'store.html'

ICON = {  # Feather (subset)
 'home': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
 'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
 'search': '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
 'heart': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
 'calendar': '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
 'settings': '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68 1.65 1.65 0 0 0 10 3.17V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
 'share-2': '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
 'chevron-right': '<polyline points="9 18 15 12 9 6"/>',
 'chevron-left': '<polyline points="15 18 9 12 15 6"/>',
 'arrow-left': '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
 'bell': '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
}


def ic(name, size=18, color='currentColor', fill='none'):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="{fill}" stroke="{color}" '
            f'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{ICON[name]}</svg>')


def heart(filled):
    return ic('heart', 17, '#8B3A4B' if filled else '#6E6255', '#8B3A4B' if filled else 'none')


CSS = f"""
@font-face{{font-family:Q;font-weight:500;src:url({FONTS.as_uri()}/quicksand/500Medium/Quicksand_500Medium.ttf)}}
@font-face{{font-family:Q;font-weight:600;src:url({FONTS.as_uri()}/quicksand/600SemiBold/Quicksand_600SemiBold.ttf)}}
@font-face{{font-family:Q;font-weight:700;src:url({FONTS.as_uri()}/quicksand/700Bold/Quicksand_700Bold.ttf)}}
@font-face{{font-family:I;font-weight:400;src:url({FONTS.as_uri()}/inter/400Regular/Inter_400Regular.ttf)}}
@font-face{{font-family:I;font-weight:400;font-style:italic;src:url({FONTS.as_uri()}/inter/400Regular_Italic/Inter_400Regular_Italic.ttf)}}
@font-face{{font-family:I;font-weight:500;src:url({FONTS.as_uri()}/inter/500Medium/Inter_500Medium.ttf)}}
@font-face{{font-family:I;font-weight:500;font-style:italic;src:url({FONTS.as_uri()}/inter/500Medium_Italic/Inter_500Medium_Italic.ttf)}}
@font-face{{font-family:I;font-weight:600;src:url({FONTS.as_uri()}/inter/600SemiBold/Inter_600SemiBold.ttf)}}
:root{{--cream:#FAF6EE;--paper:#fff;--forest:#2B6E52;--fd:#1F5540;--fl:#E4EFE6;--mus:#C9922E;--ml:#F6E8CE;--plum:#8B3A4B;--ink:#2B2620;--soft:#6E6255;--line:#E9E2D6}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:I;color:var(--ink);background:#ccc}}
.shot{{width:360px;height:640px;position:relative;overflow:hidden;background:var(--forest)}}
.shot.alt{{background:var(--cream)}}
.cap{{position:absolute;top:44px;left:0;right:0;text-align:center;padding:0 28px}}
.cap h2{{font-family:Q;font-weight:700;font-size:27px;line-height:1.18;color:#fff;letter-spacing:-.2px}}
.cap p{{font-size:13.5px;line-height:1.45;color:#D3E6D9;margin-top:10px}}
.alt .cap h2{{color:var(--fd)}} .alt .cap p{{color:var(--soft)}}
.phone{{position:absolute;left:50%;top:178px;transform:translateX(-50%);width:276px;height:520px;border:7px solid #2B2620;
  border-bottom:none;border-radius:34px 34px 0 0;overflow:hidden;background:var(--cream);box-shadow:0 18px 50px rgba(0,0,0,.28)}}
.alt .phone{{box-shadow:0 18px 50px rgba(43,38,32,.22)}}
.scr{{width:360px;height:680px;transform:scale(.728);transform-origin:0 0;background:var(--cream);position:relative}}
.sb{{height:26px;display:flex;justify-content:space-between;align-items:center;padding:0 18px;font-size:11px;font-weight:600;color:var(--ink)}}
.hdr{{display:flex;align-items:center;justify-content:space-between;padding:14px 20px 8px}}
.ttl{{font-family:Q;font-weight:700;font-size:19px;color:var(--fd)}}
.gear{{width:34px;height:34px;border-radius:17px;background:var(--fl);display:flex;align-items:center;justify-content:center;color:var(--fd)}}
.nav{{display:flex;align-items:center;gap:22px;padding:12px 16px;font-family:I;font-weight:500;font-size:18px;color:var(--ink)}}
.body{{padding:8px 20px}}
.lbl{{font-family:Q;font-weight:700;font-size:13px;color:var(--fd)}}
.row{{display:flex;justify-content:space-between;align-items:baseline}}
.date{{font-size:12px;color:var(--soft)}}
.ticket{{background:#fff;border-radius:16px;padding:28px;margin-top:8px;box-shadow:0 6px 22px rgba(43,38,32,.08)}}
.chip{{display:inline-block;background:var(--fl);border-radius:20px;padding:5px 12px;font-family:Q;font-weight:600;font-size:11px;color:var(--fd);margin-bottom:14px}}
.qm{{font-family:Q;font-weight:700;font-size:38px;line-height:38px;color:var(--mus);margin-bottom:4px}}
.qt{{font-family:Q;font-weight:600;font-size:19px;line-height:27px;margin-bottom:14px}}
.au{{font-size:13px;color:var(--soft)}}
.acts{{display:flex;gap:8px;margin-top:14px}}
.btn{{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;border-radius:10px;padding:12px 0;font-weight:600;font-size:14px}}
.btn.p{{background:var(--forest);color:#fff}} .btn.s{{background:var(--fl);color:var(--fd)}}
.hint{{text-align:center;font-size:12px;color:var(--soft);margin-top:14px}}
.card{{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:8px}}
.rc{{display:flex;align-items:center;justify-content:space-between;color:var(--soft)}}
.rt{{font-weight:600;font-size:14px;color:var(--ink)}} .rs{{font-size:12px;color:var(--soft);margin-top:2px}}
.tabs{{position:absolute;bottom:0;left:0;right:0;height:62px;background:#fff;border-top:1px solid var(--line);display:flex;justify-content:space-around;align-items:center}}
.tab{{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10.5px;color:var(--soft)}} .tab.on{{color:var(--fd);font-weight:600}}
.hd{{font-family:I;font-weight:500;font-style:italic;font-size:12.5px;color:var(--soft);margin-bottom:8px}}
.v{{display:flex;gap:8px;margin-bottom:14px;align-items:flex-start;border-radius:10px}}
.v.t{{background:var(--ml);margin-left:-8px;margin-right:-8px;padding:4px 8px}}
.vn{{font-family:Q;font-weight:700;color:var(--mus);font-size:13px;min-width:22px;padding-top:2px}}
.vt{{flex:1;font-size:14.5px;line-height:23px}}
.sub{{font-size:12.5px;color:var(--soft);margin-top:4px}}
.pn{{font-family:Q;font-weight:700;font-size:15px}}
.badge{{font-family:Q;font-weight:600;font-size:10.5px;color:var(--fd);background:var(--fl);border-radius:20px;padding:3px 9px}}
.desc{{font-size:12.5px;line-height:18px;margin-top:6px}} .meta{{font-size:12px;color:var(--soft);margin:8px 0}}
.track{{height:8px;border-radius:6px;background:var(--line);overflow:hidden}} .fill{{height:100%;background:var(--forest);border-radius:6px}}
.ref{{font-family:Q;font-weight:700;font-size:13px;color:var(--fd)}}
.ft{{font-size:13.5px;line-height:20px;margin-top:6px}}
.note{{font-size:12px;font-style:italic;margin-top:8px;border-top:1px solid var(--line);padding-top:8px;color:var(--ink)}}
.note.e{{color:var(--soft)}}
.sbox{{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:11px 14px;margin-bottom:14px;font-size:14px;color:var(--soft)}}
.sbox b{{color:var(--ink);font-weight:400}}
mark{{background:var(--ml);color:inherit;border-radius:3px;padding:0 1px}}
.set-row{{display:flex;justify-content:space-between;align-items:center;padding:8px 0}}
.set-row+.set-row{{border-top:1px solid var(--line)}}
.sw{{width:44px;height:26px;border-radius:13px;background:var(--forest);position:relative}} .sw:after{{content:"";position:absolute;right:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#fff}}
.pill{{font-family:Q;font-weight:700;font-size:14px;color:var(--fd);background:var(--fl);border-radius:10px;padding:8px 14px}}
.ab{{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--line);font-size:13px;color:var(--soft)}} .ab span+span{{color:var(--ink);font-weight:500}}
.cr{{font-size:12px;line-height:18px}} .lk{{font-size:12.5px;color:var(--forest);font-weight:600;margin-top:8px}}
.chips{{display:flex;gap:8px;margin-bottom:12px}}
.c2{{border-radius:20px;padding:7px 14px;font-family:Q;font-weight:600;font-size:12px;background:#fff;border:1px solid var(--line);color:var(--soft)}} .c2.on{{background:var(--forest);border-color:var(--forest);color:#fff}}
/* feature graphic */
#feature{{width:1024px;height:500px;background:var(--forest);position:relative;overflow:hidden;display:flex;align-items:center}}
"""

STATUS = '<div class="sb"><span>9:41</span><span>▴ ◢ ▮</span></div>'


def tabs(on):
    items = [('home', 'Início'), ('book-open', 'Leitura'), ('search', 'Busca'), ('heart', 'Favoritos'), ('calendar', 'Planos')]
    return '<div class="tabs">' + ''.join(
        f'<div class="tab{" on" if l == on else ""}">{ic(n, 22)}<span>{l}</span></div>' for n, l in items) + '</div>'


def shot(sid, title, sub, screen, alt=False):
    return (f'<div class="shot{" alt" if alt else ""}" id="{sid}"><div class="cap"><h2>{title}</h2><p>{sub}</p></div>'
            f'<div class="phone"><div class="scr">{STATUS}{screen}</div></div></div>')


INICIO = f'''<div class="hdr"><div class="ttl">Minha Bíblia</div><div class="gear">{ic("settings",16)}</div></div>
<div class="body"><div class="row"><span class="lbl">Versículo do dia</span><span class="date">2 de outubro de 2026</span></div>
<div class="ticket"><span class="chip">Isaías 41:10</span><div class="qm">&ldquo;</div>
<div class="qt">Não temas, porque eu estou contigo; não te assombres, porque eu sou teu Deus.</div><div class="au">Bíblia Livre (BLIVRE)</div></div>
<div class="acts"><div class="btn p">{ic("share-2",16)}Compartilhar</div><div class="btn s">{ic("book-open",16)}Ler no capítulo</div></div>
<div class="hint">Volte amanhã para um novo versículo</div>
<div class="lbl" style="margin:28px 0 8px">Continuar leitura</div>
<div class="card rc"><div><div class="rt">Salmos 23</div><div class="rs">Você parou no versículo 4</div></div>{ic("chevron-right",18)}</div></div>{tabs("Início")}'''

SL23 = [(1, 'O SENHOR é meu pastor, nada me faltará.'),
        (2, 'Ele me faz deitar em pastos verdes, [e] me leva a águas quietas.'),
        (3, 'Ele restaura minha alma, [e] me guia pelos caminhos da justiça por seu nome.'),
        (4, 'Ainda que eu venha a andar pelo vale da sombra da morte, não temerei mal algum, porque tu estás comigo; tua vara e teu cajado me consolam.'),
        (5, 'Tu preparas uma mesa diante de mim à vista de meus adversários; unges a minha cabeça com azeite, meu cálice transborda.'),
        (6, 'Certamente o bem e a bondade me seguirão todos os dias de minha vida; e habitarei na casa do SENHOR por muitos e muitos dias.')]
CAPITULO = (f'<div class="nav">{ic("arrow-left",22)}<span>Salmos 23</span></div><div class="body" style="padding-top:12px">'
            '<div class="hd">Salmo de Davi</div>'
            + ''.join(f'<div class="v{" t" if n == 4 else ""}"><span class="vn">{n}</span><span class="vt">{t}</span>{heart(n == 1)}</div>'
                      for n, t in SL23)
            + f'<div class="acts" style="margin-top:4px"><div class="btn s">{ic("chevron-left",16)}Salmos 22</div>'
              f'<div class="btn p">Salmos 24{ic("chevron-right",16)}</div></div></div>')

PLANOS = f'''<div class="hdr" style="display:block"><div class="ttl">Planos de leitura</div><div class="sub">Escolha um plano e avance no seu ritmo, um dia de cada vez.</div></div>
<div class="body">
<div class="card"><div class="row" style="align-items:center"><span class="pn">Provérbios em 31 dias</span><span class="badge">Em andamento</span></div>
<div class="desc">Um capítulo de Provérbios por dia — um para cada dia do mês.</div><div class="meta">Dia 12 de 31 · 11 concluídos</div>
<div class="track"><div class="fill" style="width:35%"></div></div></div>
<div class="card"><div class="row" style="align-items:center"><span class="pn">Bíblia em 1 ano</span></div>
<div class="desc">Toda a Bíblia, de Gênesis a Apocalipse, em cerca de 3 a 4 capítulos por dia.</div><div class="meta">365 dias · não iniciado</div></div>
<div class="card"><div class="row" style="align-items:center"><span class="pn">Novo Testamento em 90 dias</span><span class="badge" style="background:var(--ml);color:var(--ink)">Concluído</span></div>
<div class="desc">De Mateus a Apocalipse, em cerca de 3 capítulos por dia.</div><div class="meta">Concluído · 90 de 90 dias</div>
<div class="track"><div class="fill" style="width:100%"></div></div></div></div>{tabs("Planos")}'''

FAVS = [('Salmos 23:1', 'O SENHOR é meu pastor, nada me faltará.', 'Lembrar disso nas semanas difíceis.'),
        ('Mateus 11:28', 'Vinde a mim todos vós que estais cansados e sobrecarregados, e eu vos farei descansar.', None),
        ('Filipenses 4:13', 'Posso todas as coisas em Cristo que me fortalece.', 'Versículo da família 🙏'.replace(' 🙏', '')),
        ('1 João 4:8', 'Aquele que não ama não conhece a Deus, porque Deus é amor.', None)]
FAVORITOS = ('<div class="hdr"><div class="ttl">Favoritos</div></div><div class="body">'
             + ''.join(f'<div class="card"><div class="row" style="align-items:center"><span class="ref">{r}</span>{heart(True)}</div>'
                       f'<div class="ft">{t}</div><div class="note{"" if n else " e"}">{n or "Adicionar uma nota..."}</div></div>'
                       for r, t, n in FAVS) + '</div>' + tabs('Favoritos'))

RES = [('Romanos 15:13', 'O Deus da <mark>esperança</mark> vos encha de toda alegria e paz na fé, para que abundeis em <mark>esperança</mark> no poder do Espírito Santo.'),
       ('Romanos 12:12', 'Alegrai-vos na <mark>esperança</mark>. Sede pacientes na aflição. Perseverai na oração.'),
       ('Romanos 5:5', 'E a <mark>esperança</mark> não frustra, porque o amor de Deus está derramado em nossos corações pelo Espírito Santo que nos foi dado.'),
       ('Hebreus 6:19', 'Temos essa <mark>esperança</mark> como uma segura e firme âncora da alma, que entra ao interior, além do véu,')]
BUSCA = (f'<div class="hdr"><div class="ttl">Busca</div></div><div class="body"><div class="sbox">{ic("search",16)}<b>esperança</b></div>'
         + ''.join(f'<div class="card"><div class="ref" style="margin-bottom:4px">{r}</div><div class="ft" style="margin:0">{t}</div></div>' for r, t in RES)
         + '</div>' + tabs('Busca'))

CONFIG = f'''<div class="nav">{ic("arrow-left",22)}<span>Configurações</span></div><div class="body" style="padding-top:12px">
<div class="card" style="margin-bottom:14px"><div class="lbl" style="margin-bottom:8px">Notificação diária</div>
<div class="set-row"><div style="flex:1;padding-right:14px"><div style="font-size:14px;font-weight:500">Lembrete diário</div><div style="font-size:11.5px;color:var(--soft);margin-top:2px">Avisa quando o versículo do dia estiver disponível</div></div><div class="sw"></div></div>
<div class="set-row"><div style="font-size:14px;font-weight:500">Horário</div><div class="pill">07:00</div></div></div>
<div class="card" style="margin-bottom:14px"><div class="lbl" style="margin-bottom:4px">Sobre o app</div>
<div class="ab"><span>Versão</span><span>1.0.0</span></div><div class="ab"><span>Tradução</span><span>Bíblia Livre (BLIVRE)</span></div><div class="ab" style="border:none"><span>Edição do texto</span><span>2018.2.0</span></div></div>
<div class="card"><div class="lbl" style="margin-bottom:8px">Créditos do texto bíblico</div><div class="cr">Todas as Escrituras em português citadas são da Bíblia Livre (BLIVRE), Copyright © Diego Santos, Mario Sérgio, e Marco Teles… Licença Creative Commons Atribuição 3.0 Brasil.</div>
<div class="lk">Ver a licença (CC BY 3.0 BR)</div></div></div>'''

SHOTS = [
    ('01-versiculo-do-dia', 'Um versículo para cada dia', 'Comece o dia com uma palavra e compartilhe com quem você ama.', INICIO, False),
    ('02-leitura', 'A Bíblia completa, sem internet', 'Antigo e Novo Testamento, 66 livros, sempre à mão.', CAPITULO, True),
    ('03-planos', 'Planos de leitura que criam hábito', 'Bíblia em 1 ano, Novo Testamento em 90 dias e Provérbios em 31.', PLANOS, False),
    ('04-busca', 'Encontre qualquer versículo', 'Busque por palavra em toda a Bíblia em segundos.', BUSCA, True),
    ('05-favoritos', 'Guarde seus favoritos', 'Marque versículos com um toque e escreva suas anotações.', FAVORITOS, False),
    ('06-lembrete', 'Lembrete diário no seu horário', 'Sem cadastro, sem login: tudo fica no seu aparelho.', CONFIG, True),
]


def feature():
    mark = icons.svg(icons.book(1.3), size=230, bg='#2B6E52', rx=230)
    deco = icons.svg(icons.book(1.0, mono=True), size=760)
    return f'''<div id="feature">
<div style="position:absolute;right:-300px;top:-160px;opacity:.06">{deco}</div>
<div style="margin-left:86px;border-radius:52px;box-shadow:0 18px 44px rgba(0,0,0,.25);background:#2B6E52;border:3px solid rgba(255,255,255,.14);line-height:0">{mark}</div>
<div style="margin-left:56px;color:#fff">
<div style="font-family:Q;font-weight:700;font-size:68px;letter-spacing:-1px;line-height:1">Minha Bíblia</div>
<div style="font-family:Q;font-weight:600;font-size:26px;color:#F6E8CE;margin-top:16px">Leitura diária, planos e versículo do dia</div>
<div style="display:flex;gap:10px;margin-top:30px">{"".join(f'<span style="font-family:I;font-weight:600;font-size:17px;background:rgba(255,255,255,.12);border-radius:30px;padding:9px 18px">{t}</span>' for t in ["Offline","Sem cadastro","Grátis"])}</div>
</div></div>'''


if __name__ == '__main__':
    html = f'<html><head><meta charset="utf-8"><style>{CSS}</style></head><body>' + \
        ''.join(shot(*s) for s in SHOTS) + feature() + '</body></html>'
    HTML.write_text(html, encoding='utf-8')
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1100, 'height': 800}, device_scale_factor=3)
        pg.goto(HTML.as_uri()); pg.wait_for_timeout(400)
        for sid, *_ in SHOTS:
            pg.locator(f'[id="{sid}"]').screenshot(path=str(OUT / f'screenshot-{sid}.png'))
        pg2 = b.new_page(viewport={'width': 1100, 'height': 600}, device_scale_factor=1)
        pg2.goto(HTML.as_uri()); pg2.wait_for_timeout(400)
        pg2.locator('#feature').screenshot(path=str(OUT / 'feature-graphic-1024x500.png'))
        b.close()
    print('ok')
