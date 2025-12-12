import re

file_path = 'src/pages/SpaceRoom.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Fix Chat Sidebar
# Pattern: {/* Chat Sidebar */ } followed by newline, indent, {, newline, indent, showChat
pattern1 = r'\{\/\* Chat Sidebar \*\/ \}\s*\n\s*\{\s*\n\s*showChat'
replacement1 = '{/* Chat Sidebar */}\n        {showChat'

new_content = re.sub(pattern1, replacement1, content)

# Fix Notification Closing
# Pattern: ) followed by newline, indent, }, newline, indent, </div >
pattern2 = r'\)\s*\n\s*\}\s*\n\s*<\/div >'
replacement2 = ')}\n    </div>'

new_content = re.sub(pattern2, replacement2, new_content)

if content == new_content:
    print("No changes made.")
else:
    with open(file_path, 'w') as f:
        f.write(new_content)
    print("File updated successfully.")
