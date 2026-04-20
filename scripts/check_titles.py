import re, pathlib

root = pathlib.Path('.')
skip = {'node_modules', '.git', 'scripts', 'partials', '.vercel'}

issues = []
for p in root.rglob('*.html'):
    if any(s in p.parts for s in skip):
        continue
    t = p.read_text(encoding='utf-8', errors='ignore')
    m = re.search(r'<title>(.*?)</title>', t, re.DOTALL)
    if not m:
        continue
    title = m.group(1).strip()
    disp = (title
            .replace('&amp;', '&')
            .replace('&gt;', '>')
            .replace('&lt;', '<')
            .replace('&quot;', '"')
            .replace("&#39;", "'"))
    too_long = len(disp) > 70
    missing_brand = 'Seven Stones' not in title
    if too_long or missing_brand:
        issues.append((len(disp), too_long, missing_brand, p.as_posix(), title))

issues.sort(reverse=True)
print(f'{len(issues)} issues total')
print()
for L, long_, miss, pth, t in issues:
    flags = []
    if long_: flags.append('LONG')
    if miss: flags.append('NO-BRAND')
    print(f'{L:3d} [{",".join(flags)}] {pth}')
    print(f'    {t}')
    print()
