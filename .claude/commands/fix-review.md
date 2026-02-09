# Copyright (c) 2026 Forrest Morrisey
# Fix code review comments on a pull request.

## Instructions

1. Use `gh api repos/fmorrisey/Spokerv2/pulls/$ARGUMENTS/comments` to fetch all review comments on the PR
2. For each comment:
   - Read the file and line referenced
   - Understand the suggestion
   - If the comment includes a `suggestion` code block, apply it exactly
   - If it's a general comment, use your judgment to fix it
3. After fixing each comment, briefly note what you changed
4. Do NOT commit anything — leave changes unstaged for the user to review
5. Do NOT modify database data or run destructive commands
6. If a comment requires a change you're unsure about (architectural decision, breaking change), flag it and skip it

## Usage

Provide the PR number as the argument: `/fix-review 62`

