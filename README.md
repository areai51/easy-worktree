# Easy Worktree

A simple wrapper around `git worktree` that makes managing Git worktrees effortless.

## Features

- 🚀 Simple commands to create worktrees as sibling directories
- 📁 Automatically copies all `.env*` and `dev.vars` files (including nested ones)
- 🔄 Sanitizes branch names (replaces `/` with `-` for directory names)
- 📋 List all worktrees
- 🗑️ Easy worktree removal

## Installation

```bash
npm install -g easy-worktree
```

### Prerequisites

- Node.js >= 14
- Git with worktree support

## Usage

### Create a worktree from existing branch

```bash
ew <branch_name>
```

Creates a worktree at `../<branch_name>` for the existing branch. Branch names with `/` are converted to `-` for the directory name.

Example:
```bash
ew feature/new-ui
# Creates worktree at ../feature-new-ui for branch feature/new-ui
```

### Create a worktree with a new branch

```bash
ew -b <branch_name>
```

Creates a new branch and worktree at `../<branch_name>`.

Example:
```bash
ew -b feature/api-update
# Creates new branch feature/api-update and worktree at ../feature-api-update
```

### List all worktrees

```bash
ew list
```

Shows all worktrees in the repository.

### Remove a worktree

```bash
ew remove <worktree_path>
```

Removes the specified worktree.

Example:
```bash
ew remove ../feature-new-ui
```

## How it works

1. Creates a git worktree as a sibling directory (`../`)
2. Sanitizes branch names by replacing `/` with `-` for directory names
3. Recursively copies all `.env*` and `dev.vars` files from the current directory to the new worktree
4. Preserves directory structure when copying environment files

## Environment File Copying

The tool automatically copies:
- All files matching `.env*` pattern (e.g., `.env`, `.env.local`, `.env.production`)
- All `dev.vars` files
- Nested environment files in subdirectories

If no environment files are found, the tool continues without error.

## Why Easy Worktree?

Git worktrees are powerful but can be tedious to set up, especially when you need to:
- Remember the exact syntax
- Copy configuration files
- Handle branch name sanitization

`ew` automates all of this, making worktree management as simple as possible.

## License

MIT
