import re, json

SQL_PATH = r"c:\Users\dda20\IdeaProjects\base-to-florify\florify\LLM_DB_MIGRATIONS_CONTEXT.txt"
OUT_PATH  = r"c:\Users\dda20\IdeaProjects\base-to-florify\florify\_docx_tools\table_sql_blocks.json"

with open(SQL_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# We'll collect, per table, its CREATE TABLE + related CREATE INDEX lines
# Step 1: find all CREATE TABLE blocks
ct_pattern = re.compile(
    r'(CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)\s*\(.*?\);)',
    re.DOTALL | re.IGNORECASE
)

# Step 2: find all CREATE INDEX lines
ci_pattern = re.compile(
    r'(CREATE (?:UNIQUE )?INDEX\s+\w+\s+ON\s+(\w+)\s*\([^;]+\);)',
    re.DOTALL | re.IGNORECASE
)

# Step 3: find ALTER TABLE blocks
at_pattern = re.compile(
    r'(ALTER TABLE\s+(\w+)[^;]+;)',
    re.DOTALL | re.IGNORECASE
)

table_sql = {}

for m in ct_pattern.finditer(content):
    tname = m.group(2).lower()
    sql = m.group(1).strip()
    # Normalize whitespace inside
    table_sql[tname] = {"create": sql, "indexes": [], "alters": []}

for m in ci_pattern.finditer(content):
    tname = m.group(2).lower()
    if tname in table_sql:
        table_sql[tname]["indexes"].append(m.group(1).strip())

for m in at_pattern.finditer(content):
    tname = m.group(2).lower()
    if tname in table_sql:
        table_sql[tname]["alters"].append(m.group(1).strip())

# Build full SQL block per table
result = {}
for tname, parts in table_sql.items():
    full = parts["create"]
    for idx in parts["indexes"]:
        full += "\n\n" + idx
    for alt in parts["alters"]:
        full += "\n\n" + alt
    result[tname] = full

with open(OUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"Extracted SQL blocks for {len(result)} tables:")
for t in result:
    print(f"  {t}")
