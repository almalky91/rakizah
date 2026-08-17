# Quick Start: Data Export from Supabase

This is a quick reference guide for running the Supabase data export script.

## Prerequisites ✅

Before running the export, ensure you have:

1. **Node.js and npm installed** (already set up for this project)
2. **Access to Supabase instance** - credentials are in the script
3. **Supabase client library** - needs to be installed temporarily

## Quick Steps 🚀

### Step 1: Install Supabase Client
```bash
npm install @supabase/supabase-js
```

> **Note:** This package was previously removed from the project. We're temporarily installing it only for the migration. You can uninstall it after migration is complete.

### Step 2: Run the Export
```bash
npm run db:export
```

That's it! The script will:
- Connect to your Supabase instance
- Export all 15 tables
- Transform data to MySQL format
- Save everything to `migration-data/` directory

### Step 3: Verify Export
```bash
# Check what was exported
dir migration-data

# View the summary
type migration-data\_metadata.json
```

## Expected Output 📊

```
🚀 Starting Supabase Data Export
   Source: https://ladijmiywlfvufclcpzg.supabase.co
   Output: C:\path\to\project\migration-data

📦 Exporting table: profiles
   Found 15 records
✅ Exported 15 records to profiles.json

📦 Exporting table: user_roles
   Found 18 records
✅ Exported 18 records to user_roles.json

... (continues for all tables)

📊 Export Summary:
   Total tables exported: 15
   Total records: 328

✅ Export completed successfully!
```

## What Gets Exported? 📁

The script exports these tables:

**Authentication:**
- profiles (user data)
- user_roles (admin/teacher/student)

**Content:**
- quizzes (quiz questions)
- videos (YouTube URLs)
- games (memory, wheel configs)

**Results:**
- quiz_results (authenticated)
- public_quiz_results (anonymous)
- video_views (authenticated)
- public_video_views (anonymous)
- game_scores (leaderboard)

**Skills:**
- grades (3rd, 6th, 9th)
- subjects (Math, Science)
- fields (domains)
- skills (individual skills)
- teacher_skills (teacher assignments)
- student_skills (student progress)

## Data Transformations 🔄

The script automatically handles:

| What | From | To |
|------|------|-----|
| **UUIDs** | Native UUID type | VARCHAR(36) string |
| **Timestamps** | `2024-03-27T14:30:00.000Z` | `2024-03-27 14:30:00` |
| **JSON** | JSONB (binary) | JSON string |
| **Enums** | PostgreSQL ENUM | VARCHAR string |

## Troubleshooting 🔧

### Error: Package not installed
```
❌ ERROR: @supabase/supabase-js is not installed
```
**Fix:** Run `npm install @supabase/supabase-js`

### Error: Missing credentials
```
❌ ERROR: Missing Supabase credentials
```
**Fix:** Credentials are hardcoded in the script. Check if they're still valid.

### Error: Connection failed
```
❌ Error fetching [table]: [message]
```
**Fix:** 
- Check if Supabase project is active
- Verify the service role key hasn't expired
- Test connection in Supabase dashboard

### Warning: Empty table
```
⚠️  Table [name] is empty
```
**Not an error!** Some tables might be legitimately empty. The script still creates an empty JSON file.

## Next Steps ➡️

After successful export:

1. **Review the data:**
   - Open `migration-data/_metadata.json` to see counts
   - Spot-check a few JSON files for correctness

2. **Proceed to import:**
   - Run Task 4.2 to import data into MySQL
   - Use `npm run db:import` (when implemented)

3. **Clean up:**
   - After migration is complete and validated
   - Run `npm uninstall @supabase/supabase-js`
   - Keep `migration-data/` as backup for 2 weeks

## Need More Info? 📚

- **Detailed documentation:** `scripts/README.md`
- **Completion report:** `.kiro/specs/supabase-to-nextjs-migration/TASK_4.1_COMPLETION.md`
- **Requirements:** `.kiro/specs/supabase-to-nextjs-migration/requirements.md`
- **Design docs:** `.kiro/specs/supabase-to-nextjs-migration/design.md`

## Important Notes ⚠️

- ✅ Script is **READ-ONLY** - won't modify your Supabase database
- ✅ Script is **IDEMPOTENT** - safe to run multiple times
- ✅ Export preserves **ALL relationships** and foreign keys
- ✅ Data is exported in **dependency order** (parents first)
- ❌ Does **NOT** include password hashes (handled separately in Task 5.4)

---

**Ready to export? Run:** `npm run db:export` 🚀
