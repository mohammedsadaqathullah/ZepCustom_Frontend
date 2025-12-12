#!/usr/bin/env python3
import re

# Read the file
with open('src/pages/SpaceRoom.tsx', 'r') as f:
    lines = f.readlines()

# Fix line by line
fixed_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    
    # Fix pattern: {/* Comment */ } -> {/* Comment */}
    if '{/* ' in line and ' */ }' in line:
        line = line.replace(' */ }', ' */')
    
    # Fix standalone { after comment
    if i < len(lines) - 1:
        next_line = lines[i + 1]
        if '{/* ' in line and '*/' in line and next_line.strip() == '{':
            # Skip the standalone { line
            fixed_lines.append(line)
            i += 2
            continue
    
    # Fix patterns like )\n    } to )}
    if line.strip() == ')' and i < len(lines) - 1:
        next_line = lines[i + 1]
        if next_line.strip() == '}':
            fixed_lines.append('    )}\n')
            i += 2
            continue
    
    fixed_lines.append(line)
    i += 1

# Write back
with open('src/pages/SpaceRoom.tsx', 'w') as f:
    f.writelines(fixed_lines)

print(f"Fixed {len(lines) - len(fixed_lines)} malformed lines!")
