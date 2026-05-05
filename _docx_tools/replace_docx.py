import os

original = r"c:\Users\dda20\IdeaProjects\base-to-florify\florify\5-текст.docx"
updated = r"c:\Users\dda20\IdeaProjects\base-to-florify\florify\5-текст_updated.docx"

if os.path.exists(updated):
    os.replace(updated, original)
    print("Replaced original file.")
else:
    print("Updated file not found.")
