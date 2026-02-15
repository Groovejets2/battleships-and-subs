# Gitflow Skill - JH Standard Workflow
**Version:** 1.0.0
**Created:** 2026-02-14
**Last Modified:** 2026-02-14
**Author:** JH
**Status:** Active

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-02-14 | Initial gitflow skill creation from battleships-and-subs project patterns | JH/Claude |

---

## Purpose

This skill provides clinical, step-by-step instructions for executing gitflow workflow according to JH's standardized process. This skill can be imported into any project to ensure consistent git practices across all repositories.

---

## Branch Structure

### Core Branches

#### `main`
- **Purpose:** Production-ready code only
- **Protection:** Protected branch, requires PR for changes
- **Merges From:** `develop` branch only (via PR)
- **Merges To:** Never merge main to other branches
- **Tagging:** All production releases tagged here
- **Lifetime:** Permanent

#### `develop`
- **Purpose:** Integration branch for features, pre-production staging
- **Protection:** Protected branch, requires PR for changes
- **Merges From:** Feature branches (via PR)
- **Merges To:** `main` (via release PR)
- **Lifetime:** Permanent

### Temporary Branches

#### Feature Branches
- **Naming Convention:** `feature/{scope}-{description}-from-develop`
  - `{scope}`: Context identifier (e.g., week number, sprint, ticket ID)
  - `{description}`: Kebab-case description of feature
  - Always suffix with `-from-develop` to indicate origin
- **Examples:**
  - `feature/week2-ship-placement-validation-from-develop`
  - `feature/week1-grid-foundation-responsive-design`
  - `feature/TICKET-123-user-authentication-from-develop`
- **Created From:** `develop` branch
- **Merged To:** `develop` branch (via PR)
- **Lifetime:** Temporary, delete after merge

#### Bugfix Branches
- **Naming Convention:** `bugfix/{scope}-{description}-from-develop`
- **Examples:**
  - `bugfix/week3-grid-rendering-crash-from-develop`
  - `bugfix/ISSUE-456-memory-leak-from-develop`
- **Created From:** `develop` branch
- **Merged To:** `develop` branch (via PR)
- **Lifetime:** Temporary, delete after merge

#### Hotfix Branches
- **Naming Convention:** `hotfix/{version}-{description}-from-main`
- **Examples:**
  - `hotfix/v1.0.1-critical-security-patch-from-main`
  - `hotfix/v1.2.3-production-crash-fix-from-main`
- **Created From:** `main` branch
- **Merged To:** Both `main` AND `develop` (via separate PRs)
- **Lifetime:** Temporary, delete after both merges complete

#### Release Branches
- **Naming Convention:** `release/v{major}.{minor}.{patch}-from-develop`
- **Examples:**
  - `release/v1.0.0-from-develop`
  - `release/v2.1.0-from-develop`
- **Created From:** `develop` branch
- **Merged To:** `main` (then tagged), and back to `develop`
- **Lifetime:** Temporary, delete after merge

---

## Commit Message Standards

### Format Options

#### Standard Format (for most commits)
```
{Action} {subject}
```
- **Action:** Verb in past tense (Added, Fixed, Updated, Removed, Refactored, etc.)
- **Subject:** Brief description of what changed
- **Examples:**
  - `Added in all new files for ship, grid, fleet, validation, etc`
  - `Fixed high score and settings scenes`
  - `Removed deprecated API calls`

#### Detailed Format (for milestone/significant commits)
```
Week {N}: {Category} - {Description}
```
- **Week N:** Numeric week/sprint identifier
- **Category:** Functional area (UI Framework, Combat System, AI Opponent, etc.)
- **Description:** Detailed description of changes
- **Examples:**
  - `Week 2: UI Framework and Scene Architecture - Day 1 and 2 functionally complete and debugged.`
  - `Week 3: Combat System - Implemented hit/miss detection and turn management`

#### Terse Format (for trivial changes)
```
{Action/Subject}
```
- **Examples:**
  - `Cleanup`
  - `Renamed game.js to main.js`
  - `Typo fix`

### Commit Message Rules
1. **Capitalize** the first word
2. **No period** at the end (unless multiple sentences)
3. **Past tense** preferred for actions (Added, Fixed, not Add, Fix)
4. **Be specific** - avoid vague messages like "Updates" or "Changes"
5. **Include context** for non-obvious changes

### Commit Frequency
- Commit **frequently** - at logical stopping points
- Each commit should represent **one logical change**
- Don't bundle unrelated changes in a single commit

---

## Workflow Procedures

### 1. Starting a New Feature

#### Step-by-Step:
```bash
# 1. Ensure you're on develop and it's up to date
git checkout develop
git pull origin develop

# 2. Create feature branch with proper naming
git checkout -b feature/{scope}-{description}-from-develop

# 3. Verify branch creation
git branch --show-current

# 4. Push branch to remote immediately (establishes tracking)
git push -u origin feature/{scope}-{description}-from-develop
```

#### Example:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/week3-combat-system-from-develop
git push -u origin feature/week3-combat-system-from-develop
```

---

### 2. Working on a Feature

#### Step-by-Step:
```bash
# 1. Make changes to files (edit, create, delete)

# 2. Stage changes (be selective, don't use 'git add .')
git add path/to/file1.js path/to/file2.js

# 3. Commit with meaningful message
git commit -m "Added attack validation logic and hit detection"

# 4. Push to remote regularly (at least daily, or after significant work)
git push origin feature/{scope}-{description}-from-develop
```

#### Best Practices:
- **Stage selectively:** Review each file before adding
- **Commit frequently:** Every 30-60 minutes of work, or at logical breakpoints
- **Push regularly:** At least once per work session
- **Test before committing:** Ensure code runs without breaking errors

---

### 3. Keeping Feature Branch Updated

If `develop` has moved ahead while you're working on a feature:

#### Step-by-Step:
```bash
# 1. Commit or stash your current work
git add .
git commit -m "Work in progress - saving state before rebase"

# 2. Fetch latest changes
git fetch origin

# 3. Rebase onto latest develop (preferred method)
git rebase origin/develop

# 4. Resolve any conflicts
# - Edit conflicted files
# - Stage resolved files: git add path/to/file
# - Continue rebase: git rebase --continue

# 5. Force push (required after rebase)
git push origin feature/{scope}-{description}-from-develop --force-with-lease

# Alternative: Merge method (if rebase causes issues)
git merge origin/develop
git push origin feature/{scope}-{description}-from-develop
```

#### When to Update:
- **Daily** if develop is very active
- **Before creating PR** (mandatory)
- **When conflicts are likely** (e.g., working on same files as others)

---

### 4. Creating a Pull Request

#### Prerequisites Checklist:
- [ ] All changes committed
- [ ] Feature branch pushed to remote
- [ ] Branch rebased/merged with latest `develop`
- [ ] All tests passing (if applicable)
- [ ] Code reviewed by yourself (self-review)
- [ ] No unnecessary files included (check git status)

#### Step-by-Step:
```bash
# 1. Ensure branch is up to date with develop
git fetch origin
git rebase origin/develop

# 2. Push final changes
git push origin feature/{scope}-{description}-from-develop --force-with-lease

# 3. Create PR via GitHub CLI or web interface
gh pr create --base develop --head feature/{scope}-{description}-from-develop --title "{Title}" --body "{Description}"

# Example with gh CLI:
gh pr create \
  --base develop \
  --head feature/week3-combat-system-from-develop \
  --title "Week 3: Combat System Implementation" \
  --body "$(cat <<'EOF'
## Summary
- Implemented hit/miss detection
- Added turn management system
- Created attack validation logic

## Test Plan
- [x] Manual testing on desktop
- [x] Manual testing on mobile
- [ ] Automated tests (pending Week 8)

## Related
- Closes #123
- Related to #456

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

#### PR Title Format:
- **Format:** `{Scope}: {Brief Description}`
- **Examples:**
  - `Week 3: Combat System Implementation`
  - `Week 2: Ship Placement Validation`
  - `Bugfix: Grid Rendering Crash on Mobile`

#### PR Description Template:
```markdown
## Summary
- Bullet point summary of changes
- Key features added
- Issues resolved

## Test Plan
- [ ] Manual testing on desktop
- [ ] Manual testing on mobile
- [ ] Cross-browser testing
- [ ] Automated tests (if applicable)

## Related
- Closes #{issue_number}
- Related to #{issue_number}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

### 5. Merging Pull Request

#### Step-by-Step:
```bash
# 1. Review PR on GitHub (or via gh CLI)
gh pr view {pr_number}

# 2. Ensure all checks pass (CI/CD, if configured)

# 3. Merge via GitHub interface or CLI
gh pr merge {pr_number} --squash --delete-branch

# Options:
# --squash: Squash all commits into one (recommended for feature branches)
# --merge: Standard merge commit (use for release branches)
# --rebase: Rebase and merge (optional, keeps linear history)
# --delete-branch: Auto-delete branch after merge
```

#### Merge Strategies:
- **Feature branches → develop:** Use `--squash` (consolidates commits)
- **Release branches → main:** Use `--merge` (preserves history)
- **Hotfix branches:** Use `--merge` (preserves critical fix history)

#### Post-Merge:
```bash
# 1. Switch to develop
git checkout develop

# 2. Pull latest (includes your merged changes)
git pull origin develop

# 3. Delete local feature branch
git branch -d feature/{scope}-{description}-from-develop

# 4. Verify remote branch was deleted
git branch -r | grep feature/{scope}-{description}-from-develop
# (should return nothing)
```

---

### 6. Creating a Release

#### Step-by-Step:
```bash
# 1. Ensure develop is stable and tested
git checkout develop
git pull origin develop

# 2. Create release branch
git checkout -b release/v{major}.{minor}.{patch}-from-develop

# 3. Update version numbers in project files
# - Update package.json (if applicable)
# - Update version constants in code
# - Update CHANGELOG.md

# 4. Commit version bump
git add .
git commit -m "Bump version to v{major}.{minor}.{patch}"

# 5. Push release branch
git push -u origin release/v{major}.{minor}.{patch}-from-develop

# 6. Create PR to main
gh pr create --base main --head release/v{major}.{minor}.{patch}-from-develop \
  --title "Release v{major}.{minor}.{patch}" \
  --body "Production release v{major}.{minor}.{patch}"

# 7. Merge to main (after approval)
gh pr merge {pr_number} --merge --delete-branch

# 8. Tag the release on main
git checkout main
git pull origin main
git tag -a v{major}.{minor}.{patch} -m "Release v{major}.{minor}.{patch}"
git push origin v{major}.{minor}.{patch}

# 9. Merge main back to develop (to include version bump)
git checkout develop
git merge main
git push origin develop
```

#### Example:
```bash
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0-from-develop
# ... update version files ...
git add .
git commit -m "Bump version to v1.0.0"
git push -u origin release/v1.0.0-from-develop
gh pr create --base main --head release/v1.0.0-from-develop --title "Release v1.0.0"
# ... wait for approval, merge ...
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
git checkout develop
git merge main
git push origin develop
```

---

### 7. Hotfix Workflow (Critical Production Bugs)

#### Step-by-Step:
```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/v{major}.{minor}.{patch}-{description}-from-main

# 2. Fix the bug
# ... make changes ...
git add .
git commit -m "Fixed {critical bug description}"

# 3. Push hotfix branch
git push -u origin hotfix/v{major}.{minor}.{patch}-{description}-from-main

# 4. Create PR to main
gh pr create --base main --head hotfix/v{major}.{minor}.{patch}-{description}-from-main \
  --title "Hotfix v{major}.{minor}.{patch}: {Description}"

# 5. Merge to main
gh pr merge {pr_number} --merge

# 6. Tag the hotfix release
git checkout main
git pull origin main
git tag -a v{major}.{minor}.{patch} -m "Hotfix v{major}.{minor}.{patch}"
git push origin v{major}.{minor}.{patch}

# 7. Create PR to develop (to backport fix)
git checkout develop
git pull origin develop
git checkout -b hotfix/backport-v{major}.{minor}.{patch}-to-develop
git merge main
git push -u origin hotfix/backport-v{major}.{minor}.{patch}-to-develop
gh pr create --base develop --head hotfix/backport-v{major}.{minor}.{patch}-to-develop \
  --title "Backport hotfix v{major}.{minor}.{patch} to develop"

# 8. Merge to develop
gh pr merge {pr_number} --merge --delete-branch

# 9. Clean up
git checkout develop
git pull origin develop
git branch -d hotfix/v{major}.{minor}.{patch}-{description}-from-main
git branch -d hotfix/backport-v{major}.{minor}.{patch}-to-develop
```

---

## Tagging Standards

### Semantic Versioning

Use **Semantic Versioning 2.0.0** format: `v{MAJOR}.{MINOR}.{PATCH}`

#### Version Increment Rules:
- **MAJOR:** Breaking changes, incompatible API changes
  - Example: v1.0.0 → v2.0.0
- **MINOR:** New features, backward-compatible changes
  - Example: v1.0.0 → v1.1.0
- **PATCH:** Bug fixes, backward-compatible patches
  - Example: v1.0.0 → v1.0.1

### Tag Types

#### Release Tags
- **Format:** `v{major}.{minor}.{patch}`
- **Examples:** `v1.0.0`, `v2.3.1`, `v1.0.0-beta.1`
- **Created On:** `main` branch only
- **Annotated:** Yes (use `git tag -a`)

#### Pre-release Tags
- **Format:** `v{major}.{minor}.{patch}-{prerelease}`
- **Examples:** `v1.0.0-alpha.1`, `v2.0.0-beta.2`, `v1.0.0-rc.1`
- **Pre-release Identifiers:**
  - `alpha`: Early testing, unstable
  - `beta`: Feature-complete, testing phase
  - `rc` (release candidate): Final testing before release

#### Metadata Tags (optional)
- **Format:** `v{major}.{minor}.{patch}+{metadata}`
- **Examples:** `v1.0.0+20260214`, `v1.0.0+build.123`

### Creating Tags

#### Annotated Tags (Required for Releases):
```bash
git tag -a v1.0.0 -m "Release v1.0.0 - Initial public release"
git push origin v1.0.0
```

#### Lightweight Tags (Not Recommended):
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Viewing Tags
```bash
# List all tags
git tag

# List tags matching pattern
git tag -l "v1.*"

# Show tag details
git show v1.0.0

# List remote tags
git ls-remote --tags origin
```

### Deleting Tags
```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin --delete v1.0.0
```

---

## Git Configuration Best Practices

### One-Time Setup (Per Repository)

```bash
# Set user identity
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Set default branch name
git config init.defaultBranch main

# Enable rebase by default for pulls
git config pull.rebase true

# Enable auto-stash during rebase
git config rebase.autoStash true

# Colorize output
git config color.ui auto

# Set default editor (optional)
git config core.editor "code --wait"  # VS Code
# or
git config core.editor "vim"  # Vim
```

---

## Common Scenarios

### Scenario 1: Accidentally Committed to Wrong Branch

```bash
# 1. Note the commit hash
git log --oneline -1  # Copy the commit hash

# 2. Reset current branch to before the commit
git reset --hard HEAD~1

# 3. Switch to correct branch
git checkout correct-branch-name

# 4. Cherry-pick the commit
git cherry-pick {commit-hash}

# 5. Push to correct branch
git push origin correct-branch-name
```

### Scenario 2: Need to Undo Last Commit (Not Pushed)

```bash
# Option 1: Keep changes, undo commit
git reset --soft HEAD~1

# Option 2: Keep changes in working directory, unstage
git reset HEAD~1

# Option 3: Discard changes completely (DANGEROUS)
git reset --hard HEAD~1
```

### Scenario 3: Need to Undo Last Commit (Already Pushed)

```bash
# 1. Revert the commit (creates new commit that undoes changes)
git revert HEAD

# 2. Push the revert
git push origin branch-name
```

### Scenario 4: Need to Rename a Branch

```bash
# 1. Rename local branch
git branch -m old-branch-name new-branch-name

# 2. Delete old remote branch
git push origin --delete old-branch-name

# 3. Push new branch
git push -u origin new-branch-name
```

### Scenario 5: Resolve Merge Conflicts

```bash
# 1. Attempt merge/rebase (conflict occurs)
git merge develop
# or
git rebase develop

# 2. View conflicted files
git status

# 3. Open each conflicted file and resolve
# - Look for <<<<<<< HEAD, =======, >>>>>>> markers
# - Edit to desired state
# - Remove conflict markers

# 4. Stage resolved files
git add path/to/resolved-file.js

# 5. Complete merge/rebase
git commit  # For merge
# or
git rebase --continue  # For rebase

# 6. Push changes
git push origin branch-name --force-with-lease  # If rebased
# or
git push origin branch-name  # If merged
```

---

## Quick Reference Commands

### Branch Management
```bash
# List branches
git branch                    # Local branches
git branch -r                 # Remote branches
git branch -a                 # All branches

# Create branch
git checkout -b branch-name

# Switch branch
git checkout branch-name

# Delete branch
git branch -d branch-name     # Local (safe delete)
git branch -D branch-name     # Local (force delete)
git push origin --delete branch-name  # Remote

# Rename branch
git branch -m old-name new-name
```

### Commit Management
```bash
# Stage changes
git add file1 file2           # Specific files
git add .                     # All changes (use cautiously)
git add -p                    # Interactive staging

# Commit
git commit -m "Message"
git commit --amend            # Modify last commit

# View history
git log
git log --oneline
git log --graph --all --oneline
```

### Remote Management
```bash
# View remotes
git remote -v

# Fetch changes
git fetch origin

# Pull changes
git pull origin branch-name

# Push changes
git push origin branch-name
git push origin branch-name --force-with-lease  # After rebase
```

### Status & Inspection
```bash
# View status
git status
git status -s                 # Short format

# View changes
git diff                      # Working directory vs staging
git diff --staged             # Staging vs last commit
git diff branch1..branch2     # Compare branches

# Show commit details
git show commit-hash
```

---

## Troubleshooting

### Problem: "Cannot push - rejected (non-fast-forward)"

**Cause:** Remote has commits you don't have locally

**Solution:**
```bash
# Option 1: Pull and merge
git pull origin branch-name

# Option 2: Pull and rebase (cleaner history)
git pull origin branch-name --rebase

# Option 3: Force push (DANGEROUS - only if you're sure)
git push origin branch-name --force-with-lease
```

### Problem: "Detached HEAD state"

**Cause:** Checked out a specific commit instead of a branch

**Solution:**
```bash
# Create new branch from current state
git checkout -b new-branch-name

# Or go back to a branch
git checkout branch-name
```

### Problem: "Untracked files would be overwritten"

**Cause:** Uncommitted changes conflict with incoming changes

**Solution:**
```bash
# Option 1: Commit changes
git add .
git commit -m "Work in progress"

# Option 2: Stash changes
git stash
# ... perform operation ...
git stash pop

# Option 3: Discard changes (DANGEROUS)
git clean -fd
git reset --hard
```

---

## Integration with Claude Code

When Claude Code is executing git operations on your behalf, it will:

1. **Follow this gitflow skill exactly** - All branch naming, commit messages, and workflows match this document
2. **Always confirm destructive operations** - Force pushes, hard resets, etc. will require approval
3. **Provide git command explanations** - Each git operation will be explained before execution
4. **Maintain commit message standards** - All commits will follow the formats defined above
5. **Create PRs with templates** - Pull requests will use the PR description template

### Activating This Skill

To use this skill in a Claude Code session:

```
Use the gitflow skill for all git operations
```

Or to reference specific workflows:

```
Follow gitflow skill procedure for creating a new feature
Follow gitflow skill procedure for creating a release
```

---

## Skill Maintenance

### Updating This Skill

When improvements or changes are needed:

1. **Increment version number** according to semantic versioning
2. **Update version history table** with change summary
3. **Update "Last Modified" date**
4. **Commit changes** with message: `Updated gitflow skill to v{version}`
5. **Tag the commit** (optional): `git tag -a gitflow-v{version}`

### Rollback Procedure

To revert to a previous version:

```bash
# 1. View skill history
git log --oneline -- .claude/skills/gitflow.md

# 2. Restore specific version
git checkout {commit-hash} -- .claude/skills/gitflow.md

# 3. Commit the rollback
git add .claude/skills/gitflow.md
git commit -m "Rolled back gitflow skill to v{version}"
```

---

## License & Attribution

**Author:** JH
**License:** Proprietary - For use in JH projects only
**Attribution Required:** Yes - When adapting for other projects, credit original author

---

**END OF GITFLOW SKILL v1.0.0**
