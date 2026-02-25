#!/usr/bin/env node

import { program } from 'commander';
import { execSync } from 'child_process';
import { readdirSync, statSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { join, resolve, relative, dirname } from 'path';

const PACKAGE_NAME = 'ew';
const PACKAGE_VERSION = '0.1.0';

program
  .name(PACKAGE_NAME)
  .version(PACKAGE_VERSION)
  .description('Easy Worktree - A simple wrapper around git worktree');

program
  .command('list')
  .description('List all worktrees')
  .action(() => {
    listWorktrees();
  });

program
  .command('remove <worktree>')
  .description('Remove a worktree')
  .action((worktree: string) => {
    removeWorktree(worktree);
  });

program
  .argument('[branch]', 'Branch name to create worktree for')
  .option('-b, --new-branch <branch>', 'Create a new branch')
  .action((branch: string | undefined, options: { newBranch?: string }) => {
    if (options.newBranch) {
      createWorktree(options.newBranch, true);
    } else if (branch) {
      createWorktree(branch, false);
    } else {
      console.error('Error: Please provide a branch name or use a subcommand');
      console.error(`Usage: ${PACKAGE_NAME} <branch> | ${PACKAGE_NAME} -b <branch> | ${PACKAGE_NAME} list | ${PACKAGE_NAME} remove <worktree>`);
      process.exit(1);
    }
  });

program.parse();

function sanitizeBranchName(branch: string): string {
  return branch.replace(/\//g, '-');
}

function createWorktree(branch: string, createBranch: boolean): void {
  const sanitized = sanitizeBranchName(branch);
  const worktreePath = `../${sanitized}`;

  console.log(`Creating worktree at ${worktreePath} for branch ${branch}`);

  try {
    const args = ['worktree', 'add', worktreePath];
    if (createBranch) {
      args.unshift('-b');
    }
    args.push(branch);

    const output = execSync(`git ${args.join(' ')}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    console.log(output);

    copyEnvFiles(worktreePath);

    console.log(`✓ Worktree created successfully at ${worktreePath}`);
  } catch (error: any) {
    console.error('Error creating worktree:');
    console.error(error.stderr || error.message);
    process.exit(1);
  }
}

function copyEnvFiles(destPath: string): void {
  const currentDir = process.cwd();
  let copiedCount = 0;

  console.log('Copying environment files...');

  const files = walkDir(currentDir);

  for (const filePath of files) {
    const fileName = filePath.split('/').pop() || filePath;

    if (fileName.startsWith('.env') || fileName === 'dev.vars') {
      const relPath = relative(currentDir, filePath);
      const destFile = join(destPath, relPath);

      const destDir = dirname(destFile);
      if (!existsSync(destDir)) {
        try {
          mkdirSync(destDir, { recursive: true });
        } catch (e: any) {
          console.warn(`Warning: Failed to create directory ${destDir}: ${e.message}`);
          continue;
        }
      }

      try {
        copyFileSync(filePath, destFile);
        console.log(`  Copied: ${relPath}`);
        copiedCount++;
      } catch (e: any) {
        console.warn(`  Warning: Failed to copy ${relPath}: ${e.message}`);
      }
    }
  }

  if (copiedCount === 0) {
    console.log('  No environment files found to copy');
  } else {
    console.log(`✓ Copied ${copiedCount} environment file(s)`);
  }
}

function walkDir(dir: string): string[] {
  const files: string[] = [];

  try {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory() && !entry.isSymbolicLink()) {
        files.push(...walkDir(fullPath));
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  } catch (e) {
    // Ignore errors during directory traversal
  }

  return files;
}

function listWorktrees(): void {
  try {
    const output = execSync('git worktree list', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    console.log(output);
  } catch (error: any) {
    console.error('Error listing worktrees:');
    console.error(error.stderr || error.message);
    process.exit(1);
  }
}

function removeWorktree(worktree: string): void {
  console.log(`Removing worktree: ${worktree}`);

  try {
    const output = execSync(`git worktree remove ${worktree}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    console.log(output);
    console.log('✓ Worktree removed successfully');
  } catch (error: any) {
    console.error('Error removing worktree:');
    console.error(error.stderr || error.message);
    process.exit(1);
  }
}
