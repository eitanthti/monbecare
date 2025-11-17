# Version Management Guide

## Current Version: 1.3.0

## How to Increment Version with Each Commit

### Version Format: MAJOR.MINOR.PATCH

- **MAJOR** (1.x.x) - Big changes, redesigns, breaking changes
- **MINOR** (x.1.x) - New features, new pages, significant updates
- **PATCH** (x.x.1) - Bug fixes, small improvements, text changes

### Before Each Commit:

1. **Edit `script.js`** (around line 455)
2. **Update this line:**
   ```javascript
   const APP_VERSION = '1.3.0';
   ```
3. **Increment based on change type:**
   - Bug fix → `1.3.0` → `1.3.1`
   - New feature → `1.3.0` → `1.4.0`
   - Major update → `1.3.0` → `2.0.0`

4. **Commit with version in message:**
   ```bash
   git add .
   git commit -m "v1.3.1: Fix email submission bug"
   git push
   ```

## Version History

- **v1.3.0** - November 17, 2025 - Fixed Netlify form submission + added email backup
- **v1.2.0** - November 2025 - Added interview form with multi-child support
- **v1.1.0** - October 2025 - Design updates and mobile improvements
- **v1.0.0** - August 2025 - Initial release

## Quick Reference

| Change Type | Example | Before → After |
|-------------|---------|----------------|
| Bug fix | Fixed broken link | 1.3.0 → 1.3.1 |
| Small improvement | Updated text | 1.3.0 → 1.3.1 |
| New feature | Added blog page | 1.3.0 → 1.4.0 |
| Major redesign | Complete UI overhaul | 1.3.0 → 2.0.0 |

## Current Commit (Next Version)

**Next version should be:** `1.3.1`  
**Reason:** Email submission setup + version management

**Commit command:**
```bash
git add .
git commit -m "v1.3.1: Add email submission backup and version management"
git push origin main
```

