#!/usr/bin/env python3
import re

# Read the file
with open('src/pages/SpaceRoom.tsx', 'r') as f:
    content = f.read()

# Fix patterns:
# 1. {/* Comment */ } with space -> {/* Comment */}
content = re.sub(r'\{/\* (.*?) \*/\s*\}', r'{/* \1 */}', content)

# 2. Standalone { on new line after comment  
content = re.sub(r'(\{/\* .*? \*/\})\s*\n\s*\{\s*\n', r'\1\n', content)

# 3. Broken conditionals: )\n    } -> )}
content = re.sub(r'\)\s*\n\s*\}\s*\n\s*{/\* ', r')}\n\n        {/* ', content)

# Write back
with open('src/pages/SpaceRoom.tsx', 'w') as f:
    f.write(content)

print("Fixed JSX syntax patterns!")
