import os
import re

directory = r"c:\Users\dda20\IdeaProjects\base-to-florify\florify\florify-app\src\main\resources\db\migration"

schemas = ["auth", "customer", "inventory", "orders", "catalog"]

# Infrastructure patterns to remove
infra_patterns = [
    r"CREATE TABLE.*outbox_events.*?\);",
    r"CREATE INDEX.*idx_outbox.*?;",
    r"CREATE TABLE.*shedlock.*?\);",
    r"CREATE INDEX.*idx_shedlock.*?;",
    r"CREATE SCHEMA IF NOT EXISTS.*?;",
]

for filename in os.listdir(directory):
    if filename.endswith(".sql"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. Remove schema prefixes like "auth."
        for schema in schemas:
            content = content.replace(f"{schema}.", "")
        
        # 2. Remove CREATE SCHEMA
        content = re.sub(r"CREATE SCHEMA IF NOT EXISTS.*?;", "", content, flags=re.IGNORECASE)
        
        # 3. Remove infrastructure tables (we'll create them in a shared migration)
        # Using DOTALL to handle multiline
        content = re.sub(r"CREATE TABLE\s+(IF NOT EXISTS\s+)?(outbox_events|shedlock)\s*\(.*?\);", "", content, flags=re.IGNORECASE | re.DOTALL)
        content = re.sub(r"CREATE INDEX.*?(idx_outbox|idx_shedlock).*?;", "", content, flags=re.IGNORECASE | re.DOTALL)
        content = re.sub(r"CREATE INDEX.*?(idx_outbox|idx_shedlock).*?ON.*?\);", "", content, flags=re.IGNORECASE | re.DOTALL) # for multi-line index
        
        # 4. Remove comments related to outbox/shedlock if they are alone
        content = re.sub(r"-- Outbox для гарантированной доставки.*?\n", "", content)
        content = re.sub(r"-- Только непубликованные:.*\n", "", content)

        # Cleanup extra newlines
        content = re.sub(r"\n{3,}", "\n\n", content).strip() + "\n"

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Migration files cleaned up.")
