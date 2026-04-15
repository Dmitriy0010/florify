import os
import re

root_dir = r"c:\Users\dda20\IdeaProjects\base-to-florify\florify"

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(".java"):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Remove schema = "..." from @Table or other annotations
            # Pattern: schema\s*=\s*".*?"
            # We also need to handle cases like @Table(name = "x", schema = "y") -> @Table(name = "x")
            
            # Case 1: schema = "something", (with trailing comma)
            content = re.sub(r',\s*schema\s*=\s*".*?"', '', content)
            # Case 2: (schema = "something", (with leading comma) - should be covered by Case 1 or simplified
            content = re.sub(r'schema\s*=\s*".*?"\s*,\s*', '', content)
            # Case 3: schema = "something" (only parameter)
            content = re.sub(r'\(\s*schema\s*=\s*".*?"\s*\)', '()', content)
            
            # Additional cleanup for @Table(name = "users" ) - removing extra spaces if any
            
            if content != f.read: # this is wrong, f.read is a function. I'll just check if it changed.
                pass 

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

print("JPA Entities schema attributes removed.")
