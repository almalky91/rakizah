# Data Migration Scripts

This directory contains scripts for migrating data from Supabase PostgreSQL to MySQL as part of the Supabase to Next.js migration.

## Scripts Overview

### 1. `export-supabase-data.ts` - Export Data from Supabase

Exports all tables from Supabase PostgreSQL database and transforms the data to be MySQL-compatible.

**Features:**
- Exports all tables in dependency order (parent tables first)
- Transforms UUIDs to VARCHAR(36) format
- Converts JSONB fields to standard JSON strings
- Converts PostgreSQL TIMESTAMPTZ to MySQL TIMESTAMP format
- Preserves foreign key relationships and null values
- Generates metadata summary with record counts
- Logs warnings for any data transformation issues

**Tables Exported:**
- Authentication: `profiles`, `user_roles`
- Content: `quizzes`, `videos`, `games`
- Results: `quiz_results`, `public_quiz_results`, `game_scores`
- Tracking: `video_views`, `public_video_views`
- Skills: `grades`, `subjects`, `fields`, `skills`, `teacher_skills`, `student_skills`

### 2. `import-mysql-data.ts` - Import Data into MySQL

Imports the exported data into MySQL database.

**Features:**
- Imports data in correct dependency order to preserve foreign key relationships
- Transforms snake_case field names to camelCase for Drizzle ORM
- Handles null values and default values correctly
- Parses JSON strings back to objects for JSON fields
- Converts timestamp strings to Date objects
- Batch processing for efficient import (100 records per batch)
- Automatic fallback to individual inserts if batch fails
- Comprehensive error logging with record identifiers
- Option to clear existing data before import

**Tables Imported:**
- All tables from the export in the correct dependency order
- Foreign key checks are temporarily disabled during import for performance

### 3. `validate-migration.ts` - Validate Migration (To be implemented in Task 4.3)

Validates data integrity after migration.

---

## Usage Instructions

### Prerequisites

1. **Install @supabase/supabase-js temporarily:**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Verify Supabase credentials:**
   - The script uses credentials from `.env` file or hardcoded values
   - Current Supabase URL: `https://ladijmiywlfvufclcpzg.supabase.co`
   - Service role key is embedded in the script (for convenience during migration)

3. **Ensure you have access to the Supabase instance:**
   - The service role key must be valid and not expired
   - Your Supabase project must be accessible

### Step 1: Export Data from Supabase

Run the export script:

```bash
npm run db:export
```

Or directly with tsx:

```bash
npx tsx scripts/export-supabase-data.ts
```

**Output:**
- Creates `migration-data/` directory in the project root
- Exports each table to a separate JSON file (e.g., `profiles.json`, `quizzes.json`)
- Creates `_metadata.json` with export summary and record counts

**Example Output:**
```
🚀 Starting Supabase Data Export
   Source: https://ladijmiywlfvufclcpzg.supabase.co
   Output: /path/to/project/migration-data

📦 Exporting table: profiles
   Found 15 records
✅ Exported 15 records to profiles.json

📦 Exporting table: quizzes
   Found 42 records
✅ Exported 42 records to quizzes.json

...

📊 Export Summary:
   Total tables exported: 15
   Total records: 328

   Records per table:
   - profiles: 15 records
   - user_roles: 18 records
   - quizzes: 42 records
   - videos: 30 records
   ...

✅ Export completed successfully!
```

### Step 2: Review Exported Data

1. **Check the `migration-data/` directory:**
   ```bash
   ls -la migration-data/
   ```

2. **Review metadata file:**
   ```bash
   cat migration-data/_metadata.json
   ```

3. **Inspect sample data from a table:**
   ```bash
   cat migration-data/profiles.json | head -n 50
   ```

4. **Verify transformations:**
   - Check that UUIDs are 36-character strings
   - Verify JSON fields are properly stringified
   - Confirm timestamps are in format: `YYYY-MM-DD HH:MM:SS`

### Step 3: Handle Warnings (if any)

The script logs warnings for:
- UUIDs with incorrect length
- Invalid JSON in `questions` or `config` fields
- Other data quality issues

Review and fix any warnings before proceeding to import.

### Step 4: Set Up MySQL Database

Before importing, ensure your MySQL database is set up:

1. **Create the database:**
   ```sql
   CREATE DATABASE rakizah CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Configure environment variables:**
   Create or update `.env` file:
   ```
   DATABASE_HOST=localhost
   DATABASE_PORT=3306
   DATABASE_USER=root
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=rakizah
   ```

3. **Run Drizzle migrations:**
   ```bash
   npm run db:push
   ```
   This will create all tables in the MySQL database.

### Step 5: Import Data into MySQL

Run the import script:

```bash
npm run db:import
```

Or directly with tsx:

```bash
npx tsx scripts/import-mysql-data.ts
```

**Import Options:**

- **Standard import** (preserves existing data):
  ```bash
  npm run db:import
  ```

- **Clear and import** (deletes all existing data first):
  ```bash
  npx tsx scripts/import-mysql-data.ts --clear
  ```

**Output:**
```
📥 Starting MySQL Data Import
   Database: rakizah
   Host: localhost
   Tables to import: 16

🔓 Disabling foreign key checks...

Importing table: profiles
  📦 Loaded 15 records from export file
  ✓ Imported batch: 15/15 records
  ✅ Completed: 15 imported, 0 skipped

Importing table: quizzes
  📦 Loaded 42 records from export file
  ✓ Imported batch: 42/42 records
  ✅ Completed: 42 imported, 0 skipped

...

🔒 Re-enabling foreign key checks...

📊 Import Summary:
   Total Records Imported: 328
   Total Records Skipped: 0
   Total Duration: 3.45s

✅ Import completed successfully!
```

### Step 6: Validate Migration

After import, run validation (Task 4.3):
```bash
npm run db:validate
```

---

## Data Transformation Details

### UUID Transformation
- **PostgreSQL:** Native UUID type
- **MySQL:** VARCHAR(36) storing UUID as string
- **Example:** `550e8400-e29b-41d4-a716-446655440000` → `"550e8400-e29b-41d4-a716-446655440000"`

### Timestamp Transformation
- **PostgreSQL:** TIMESTAMP WITH TIME ZONE (e.g., `2024-03-27T14:30:00.000Z`)
- **MySQL:** TIMESTAMP (e.g., `2024-03-27 14:30:00`)
- **Format:** ISO 8601 without timezone, space-separated

### JSON Transformation
- **PostgreSQL:** JSONB (binary JSON, native type)
- **MySQL:** JSON (text-based JSON)
- **Example:** `{"question": "What is 2+2?", "options": ["3","4","5"]}` → JSON string

### Enum Transformation
- **PostgreSQL:** Custom ENUM type `app_role` (admin, teacher, student)
- **MySQL:** VARCHAR with values ('admin', 'teacher', 'student')
- **Example:** `admin` → `"admin"`

---

## Troubleshooting

### Error: @supabase/supabase-js not installed
```
❌ ERROR: @supabase/supabase-js is not installed
```

**Solution:** Install the package:
```bash
npm install @supabase/supabase-js
```

### Error: Missing Supabase credentials
```
❌ ERROR: Missing Supabase credentials
```

**Solution:** 
1. Uncomment the Supabase credentials in `.env` file, OR
2. Update the hardcoded values in `export-supabase-data.ts`

### Error: Supabase connection failed
```
❌ Error fetching [table]: [error message]
```

**Possible causes:**
- Invalid or expired service role key
- Supabase project is paused or deleted
- Network connectivity issues
- Table doesn't exist in the database

**Solution:**
1. Verify credentials are correct
2. Check Supabase dashboard to ensure project is active
3. Test connection with Supabase dashboard or CLI

### Empty tables
```
⚠️  Table [name] is empty
```

This is not an error. Some tables may legitimately be empty. An empty JSON array is still created.

### Error: Database connection failed
```
❌ Fatal error during import: connect ECONNREFUSED
```

**Solution:**
1. Verify MySQL server is running: `mysql -u root -p`
2. Check DATABASE_HOST and DATABASE_PORT in `.env`
3. Verify database user has proper permissions

### Error: Foreign key constraint fails
```
❌ Record ID xxx: Foreign key constraint fails
```

**Possible causes:**
- Referenced record doesn't exist (e.g., teacher_id references non-existent profile)
- Import order is incorrect
- Data corruption in export files

**Solution:**
1. Check that all parent records exist before importing child records
2. Verify the IMPORT_ORDER in the script matches table dependencies
3. Use `--clear` flag to ensure clean import: `npx tsx scripts/import-mysql-data.ts --clear`

### Error: Duplicate entry
```
❌ Record ID xxx: Duplicate entry for key 'PRIMARY'
```

**Solution:**
1. Clear existing data before re-importing: use `--clear` flag
2. Or manually delete conflicting records from MySQL

### Warning: Some records skipped
```
⚠️  WARNING: Some records failed to import
```

**Action required:**
- Review the error log printed after import summary
- Check specific record IDs that failed
- Fix data issues in export files and re-import those records

---

## After Migration

Once migration is complete and validated, you can:

1. **Remove @supabase/supabase-js:**
   ```bash
   npm uninstall @supabase/supabase-js
   ```

2. **Keep migration data for backup:**
   - Archive the `migration-data/` directory
   - Store it securely for at least 2 weeks post-migration

3. **Clean up:**
   - Remove or comment out old Supabase credentials from `.env`
   - Keep Supabase project in read-only mode as a fallback

---

## Notes

- **Export order matters:** Tables are exported in dependency order to preserve foreign key relationships
- **Service role key:** Required for full database access (including password hashes if migrating auth)
- **Data safety:** This script is read-only and does not modify the Supabase database
- **Idempotent:** Can be run multiple times safely; overwrites previous export files

---

## Support

For issues or questions:
1. Check the task completion document: `TASK_4.1_COMPLETION.md` (when created)
2. Review the design document: `.kiro/specs/supabase-to-nextjs-migration/design.md`
3. Consult the requirements: `.kiro/specs/supabase-to-nextjs-migration/requirements.md`
