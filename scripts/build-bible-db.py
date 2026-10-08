"""
Gera assets/db/bible.db a partir da Bíblia Livre (BLIVRE), NT Textus Receptus.

Fonte: https://github.com/blivre/BibliaLivre/releases/download/2018.2.0/bliv-tr_vpl.zip
Licença do texto: Creative Commons Atribuição 3.0 Brasil (CC BY 3.0 BR) — uso
comercial permitido, atribuição obrigatória (texto completo na tabela `meta`).

Conteúdo gerado:
  books / chapters / verses   texto bíblico (verses.heading = título de Salmo etc.)
  daily_verses                versículo do dia (lista curada em daily_verses.txt)
  plans / plan_readings       planos de leitura e cronograma dia → capítulos

Uso (dentro da pasta scripts/):
  1. extraia bliv-tr_vpl.txt para scripts/tr/
  2. python build-bible-db.py
  3. copie o bible.db gerado para assets/db/ e suba BIBLE_DB_VERSION em src/db/client.ts
"""
import os
import random
import re
import sqlite3
import unicodedata

DB_VERSION = '2'

BOOKS = [
    ("GEN", "Gênesis"), ("EXO", "Êxodo"), ("LEV", "Levítico"), ("NUM", "Números"), ("DEU", "Deuteronômio"),
    ("JOS", "Josué"), ("JDG", "Juízes"), ("RUT", "Rute"), ("1SA", "1 Samuel"), ("2SA", "2 Samuel"),
    ("1KI", "1 Reis"), ("2KI", "2 Reis"), ("1CH", "1 Crônicas"), ("2CH", "2 Crônicas"), ("EZR", "Esdras"),
    ("NEH", "Neemias"), ("EST", "Ester"), ("JOB", "Jó"), ("PSA", "Salmos"), ("PRO", "Provérbios"),
    ("ECC", "Eclesiastes"), ("SOL", "Cânticos"), ("ISA", "Isaías"), ("JER", "Jeremias"), ("LAM", "Lamentações"),
    ("EZE", "Ezequiel"), ("DAN", "Daniel"), ("HOS", "Oseias"), ("JOE", "Joel"), ("AMO", "Amós"),
    ("OBA", "Obadias"), ("JON", "Jonas"), ("MIC", "Miqueias"), ("NAH", "Naum"), ("HAB", "Habacuque"),
    ("ZEP", "Sofonias"), ("HAG", "Ageu"), ("ZEC", "Zacarias"), ("MAL", "Malaquias"),
    ("MAT", "Mateus"), ("MAR", "Marcos"), ("LUK", "Lucas"), ("JOH", "João"), ("ACT", "Atos"),
    ("ROM", "Romanos"), ("1CO", "1 Coríntios"), ("2CO", "2 Coríntios"), ("GAL", "Gálatas"), ("EPH", "Efésios"),
    ("PHI", "Filipenses"), ("COL", "Colossenses"), ("1TH", "1 Tessalonicenses"), ("2TH", "2 Tessalonicenses"),
    ("1TI", "1 Timóteo"), ("2TI", "2 Timóteo"), ("TIT", "Tito"), ("PHM", "Filemom"), ("HEB", "Hebreus"),
    ("JAM", "Tiago"), ("1PE", "1 Pedro"), ("2PE", "2 Pedro"), ("1JO", "1 João"), ("2JO", "2 João"),
    ("3JO", "3 João"), ("JUD", "Judas"), ("REV", "Apocalipse"),
]
IDX = {code: i + 1 for i, (code, _) in enumerate(BOOKS)}
NAME = {i + 1: name for i, (_, name) in enumerate(BOOKS)}

PLANS = [
    # id, nome, descrição, dias, livros (intervalo de ids)
    (1, 'Bíblia em 1 ano', 'Toda a Bíblia, de Gênesis a Apocalipse, em cerca de 3 a 4 capítulos por dia.', 365, (1, 66)),
    (2, 'Novo Testamento em 90 dias', 'De Mateus a Apocalipse, em cerca de 3 capítulos por dia.', 90, (40, 66)),
    (3, 'Provérbios em 31 dias', 'Um capítulo de Provérbios por dia — um para cada dia do mês.', 31, (20, 20)),
]

ATTRIBUTION = (
    'Todas as Escrituras em português citadas são da Bíblia Livre (BLIVRE), Copyright © Diego Santos, '
    'Mario Sérgio, e Marco Teles, http://sites.google.com/site/biblialivre/ - fevereiro de 2018. Licença '
    'Creative Commons Atribuição 3.0 Brasil (http://creativecommons.org/licenses/by/3.0/br/). '
    'Reprodução permitida desde que devidamente mencionados fonte e autores.'
)


def normalize(s: str) -> str:
    s = s.replace('[', '').replace(']', '')
    s = unicodedata.normalize('NFD', s.lower())
    return ''.join(ch for ch in s if unicodedata.category(ch) != 'Mn')


def split_heading(code: str, chapter: int, verse: int, text: str):
    """Separa títulos que a fonte junta ao texto (ex.: 'Salmo de Davi:O SENHOR é...')."""
    if code == 'PSA' and chapter == 72 and verse == 1 and text.startswith('Para Salomão'):
        return 'Para Salomão', text[len('Para Salomão'):].strip()
    m = None
    if code == 'PSA' and verse == 1:
        m = re.match(r'^(.{3,400}?):(?=[^\s\d])', text)
    elif code == 'PSA' and chapter == 119:
        m = re.match(r'^(\[[^\]]+\])\s*:(?=\S)', text)
    elif (code == 'ISA' and text.startswith('Revelação sobre')) or (code == 'PRO' and chapter == 10 and verse == 1):
        m = re.match(r'^(.{3,200}?):(?=[^\s\d])', text)
    if not m:
        return None, text
    heading = m.group(1).strip().strip('[]')
    return heading, text[m.end():].strip()


def clean_for_display(text: str) -> str:
    """Texto do versículo do dia: sem colchetes de palavras acrescentadas, pontuação final ok."""
    t = re.sub(r'\s*\[-', '-', text)
    t = t.replace('[', '').replace(']', '')
    t = re.sub(r'\s+([,;:.!?])', r'\1', t)
    t = re.sub(r'\s{2,}', ' ', t).strip()
    if t.startswith('(') and t.rstrip('.').endswith(')'):
        t = t.lstrip('(').rstrip('.').rstrip(')')
    if t.count('”') > t.count('“') and t.endswith('”'):
        t = t[:-1]
    t = t.rstrip()
    if t and t[-1] in ',;:':
        t = t[:-1] + '.'
    elif t and t[-1] not in '.!?”':
        t += '.'
    return t[0].upper() + t[1:]


def main():
    rows = []
    for line in open('tr/bliv-tr_vpl.txt', encoding='utf-8-sig'):
        m = re.match(r'^(\S+) (\d+):(\d+) (.*)$', line.rstrip('\r\n'))
        assert m, line
        code, c, v, t = m.group(1), int(m.group(2)), int(m.group(3)), m.group(4).strip()
        heading, t = split_heading(code, c, v, t)
        rows.append((IDX[code], c, v, t, heading))

    out = 'bible.db'
    if os.path.exists(out):
        os.remove(out)
    db = sqlite3.connect(out)
    db.executescript('''
    CREATE TABLE books (id INTEGER PRIMARY KEY, code TEXT NOT NULL, name TEXT NOT NULL,
      testament TEXT NOT NULL CHECK (testament IN ('AT','NT')), sort_order INTEGER NOT NULL,
      chapter_count INTEGER NOT NULL);
    CREATE TABLE chapters (id INTEGER PRIMARY KEY, book_id INTEGER NOT NULL REFERENCES books(id),
      number INTEGER NOT NULL);
    CREATE TABLE verses (id INTEGER PRIMARY KEY, chapter_id INTEGER NOT NULL REFERENCES chapters(id),
      number INTEGER NOT NULL, text TEXT NOT NULL, text_norm TEXT NOT NULL, heading TEXT);
    CREATE INDEX idx_chapters_book ON chapters(book_id, number);
    CREATE INDEX idx_verses_chapter ON verses(chapter_id, number);
    CREATE TABLE daily_verses (day INTEGER PRIMARY KEY, first_verse_id INTEGER NOT NULL,
      chapter_id INTEGER NOT NULL, reference TEXT NOT NULL, text TEXT NOT NULL);
    CREATE TABLE plans (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL,
      duration_days INTEGER NOT NULL);
    CREATE TABLE plan_readings (plan_id INTEGER NOT NULL, day INTEGER NOT NULL, seq INTEGER NOT NULL,
      chapter_id INTEGER NOT NULL, PRIMARY KEY (plan_id, day, seq));
    CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    ''')

    chap_count, verse_count = {}, {}
    for b, c, v, t, h in rows:
        chap_count[b] = max(chap_count.get(b, 0), c)
        verse_count[(b, c)] = verse_count.get((b, c), 0) + 1
    for b in range(1, 67):
        code, name = BOOKS[b - 1]
        db.execute('INSERT INTO books VALUES (?,?,?,?,?,?)', (b, code, name, 'AT' if b <= 39 else 'NT', b, chap_count[b]))
        for c in range(1, chap_count[b] + 1):
            db.execute('INSERT INTO chapters VALUES (?,?,?)', (b * 1000 + c, b, c))
    # IDs estáveis: verso = BBCCCVVV (João 3:16 = 43003016)
    db.executemany('INSERT INTO verses VALUES (?,?,?,?,?,?)',
                   [(b * 1000000 + c * 1000 + v, b * 1000 + c, v, t, normalize(t), h) for b, c, v, t, h in rows])

    # Versículo do dia: lista curada, ordem embaralhada (fixa) para variar os livros; dia 1 = Gênesis 1:1.
    text_by = {(b, c, v): t for b, c, v, t, h in rows}
    refs = [l.strip() for l in open('daily_verses.txt', encoding='utf-8') if l.strip()]
    assert len(refs) == 366 and len(set(refs)) == 366
    first, rest = refs[0], refs[1:]
    random.Random(2026).shuffle(rest)
    for day, ref in enumerate([first] + rest, 1):
        m = re.match(r'^(\S+) (\d+):(\d+)(?:-(\d+))?$', ref)
        b, c, s = IDX[m.group(1)], int(m.group(2)), int(m.group(3))
        e = int(m.group(4) or s)
        text = clean_for_display(' '.join(text_by[(b, c, v)] for v in range(s, e + 1)))
        reference = f"{NAME[b]} {c}:{s}" + (f"-{e}" if e != s else '')
        db.execute('INSERT INTO daily_verses VALUES (?,?,?,?,?)', (day, b * 1000000 + c * 1000 + s, b * 1000 + c, reference, text))

    # Planos: capítulos em ordem, divididos em N dias. O "peso" de cada capítulo mistura
    # nº de capítulos e nº de versículos, para não juntar 12 salmos curtos num dia só
    # nem deixar um dia com um único capítulo enorme.
    for pid, name, desc, days, (b0, b1) in PLANS:
        db.execute('INSERT INTO plans VALUES (?,?,?,?)', (pid, name, desc, days))
        chaps = [(b, c, verse_count[(b, c)]) for b in range(b0, b1 + 1) for c in range(1, chap_count[b] + 1)]
        assert len(chaps) >= days
        avg = sum(n for _, _, n in chaps) / len(chaps)
        weights = [1 + n / avg for _, _, n in chaps]
        total = sum(weights)
        day, acc, seq = 1, 0.0, 0
        for idx, ((b, c, n), w) in enumerate(zip(chaps, weights)):
            remaining_chaps = len(chaps) - idx
            remaining_days = days - day  # dias ainda não abertos
            must_advance = remaining_chaps == remaining_days  # senão sobrariam dias vazios
            wants_advance = acc + w / 2 > total * day / days
            if seq > 0 and day < days and (must_advance or wants_advance):
                day += 1
                seq = 0
            seq += 1
            acc += w
            db.execute('INSERT INTO plan_readings VALUES (?,?,?,?)', (pid, day, seq, b * 1000 + c))
        assert day == days, (pid, day, days)

    meta = {
        'translation': 'Bíblia Livre (BLIVRE) — Novo Testamento Textus Receptus',
        'short_name': 'Bíblia Livre (BLIVRE)',
        'source_version': '2018.2.0 (fevereiro de 2018)',
        'source_url': 'https://github.com/blivre/BibliaLivre',
        'license': 'Creative Commons Atribuição 3.0 Brasil (CC BY 3.0 BR)',
        'license_url': 'https://creativecommons.org/licenses/by/3.0/br/',
        'attribution': ATTRIBUTION,
        'db_version': DB_VERSION,
    }
    db.executemany('INSERT INTO meta VALUES (?,?)', meta.items())
    db.commit()
    db.execute('VACUUM')
    db.close()
    print('versos', len(rows), 'capítulos', sum(chap_count.values()))


if __name__ == '__main__':
    main()
