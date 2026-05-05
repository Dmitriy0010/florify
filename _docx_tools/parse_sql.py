import re
import json

def parse_migrations(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    tables = {}
    # Simple regex to find CREATE TABLE and its columns
    # We look for CREATE TABLE [IF NOT EXISTS] name ( ... );
    table_matches = re.finditer(r'CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)\s*\((.*?)\);', content, re.DOTALL | re.IGNORECASE)
    
    for match in table_matches:
        table_name = match.group(1).lower()
        cols_text = match.group(2)
        
        # Split columns by comma, but be careful with NUMERIC(19,2)
        cols = []
        # This regex tries to split by comma that is NOT inside parentheses
        parts = re.split(r',\s*(?![^()]*\))', cols_text)
        
        for part in parts:
            part = part.strip()
            if not part or part.upper().startswith(('PRIMARY KEY', 'UNIQUE', 'CHECK', 'CONSTRAINT', 'FOREIGN KEY')):
                continue
            
            # Extract column name and type
            col_match = re.match(r'^(\w+)\s+([\w\(\)\[\]\s]+)', part)
            if col_match:
                col_name = col_match.group(1).lower()
                col_type = col_match.group(2).strip()
                cols.append({'name': col_name, 'type': col_type})
        
        tables[table_name] = cols
    
    return tables

migrations_path = r'c:\Users\dda20\IdeaProjects\base-to-florify\florify\LLM_DB_MIGRATIONS_CONTEXT.txt'
table_data = parse_migrations(migrations_path)

with open(r'c:\Users\dda20\IdeaProjects\base-to-florify\florify\_docx_tools\table_schema.json', 'w', encoding='utf-8') as f:
    json.dump(table_data, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(table_data)} tables.")
