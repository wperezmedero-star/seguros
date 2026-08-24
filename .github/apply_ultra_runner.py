from pathlib import Path

source = Path('.github/workflows/apply-ultra-calculators.yml').read_text(encoding='utf-8').splitlines()
start = next(i for i, line in enumerate(source) if "python3 - <<'PY'" in line) + 1
end = next(i for i in range(start, len(source)) if source[i].strip() == 'PY')
block = source[start:end]
code = '\n'.join(line[10:] if line.startswith('          ') else line for line in block) + '\n'
exec(compile(code, '<ultra-calculator-migration>', 'exec'))
