# Data Validation Script Guide

## Overview

The data validation script (`scripts/validate-migration-data.ts`) validates the Supabase to MySQL data migration by comparing source and target databases, checking foreign key integrity, and identifying data transformation issues.

## Task 4.3 Requirements ✅

This script fulfills all requirements from task 4.3:

### ✅ 1. Compare Record Counts
- **Implementation**: Loads source record counts from `migration-data/_metadata.json`
- **Validation**: Queries MySQL to count records in each table using `COUNT(*)`
- **Reporting**: Displays side-by-side comparison of source vs target counts
- **Status**: Shows ✓ for matches, ❌ for mismatches

### ✅ 2. Validate Foreign Key Integrity
- **Implementation**: Defines all foreign key relationships in `FOREIGN_KEY_CHECKS` array
- **Validation Process**:
  - Extracts all foreign key values from child tables
  - Verifies each foreign key exists in parent table
  - Identifies orphaned records with missing references
- **Comprehensive Coverage**: Validates 20 foreign key relationships across:
  - `user_roles` → `profiles`
  - `fields` → `grades`
  - `subjects` → `fields`
  - `skills` → `fields`, `grades`
  - `teacher_skills` → `profiles`, `skills`
  - Content tables → `profiles`
  - Results tables → Content tables, `profiles`
  - Tracking tables → Content tables, `profiles`

### ✅ 3. Log Data Transformation Warnings
- **UUID Format Validation**: Checks all UUIDs are exactly 36 characters
- **JSON Field Validation**: Verifies JSON fields (questions, config) are valid
- **Timestamp Validation**: Checks for NULL created_at timestamps
- **Data Integrity Checks**: Validates subscription data consistency
- **Warning Types**:
  - Record count mismatches
  - Foreign key violations with missing IDs
  - Invalid UUID formats
  - NULL timestamp issues
  - Subscription data inconsistencies

### ✅ 4. Generate Validation Report
- **Summary Statistics**:
  - Total tables validated
  - Total records (source vs target)
  - Tables with count mismatches
  - Tables with FK violations
  - Total FK violations found
  - Validation duration
- **Detailed Results Table**:
  - Per-table comparison (source, target, match status, FK issues)
- **FK Violation Details**:
  - Lists all violations by table
  - Shows missing reference IDs
  - Indicates violation count
- **Pass/Fail Status**:
  - ✅ **VALIDATION PASSED** if:
    - All record counts match
    - No foreign key violations
    - No data transformation issues
  - ❌ **VALIDATION FAILED** if any issues detected
- **Exit Code**:
  - Exit 0 for success
  - Exit 1 for failures

## Tables Validated

The script validates all 15 tables in the correct dependency order:

1. **Authentication**: `profiles`, `user_roles`
2. **Skills Hierarchy**: `grades`, `fields`, `subjects`, `skills`, `teacher_skills`
3. **Content**: `quizzes`, `videos`, `games`
4. **Results**: `quiz_results`, `public_quiz_results`, `game_scores`
5. **Tracking**: `video_views`, `public_video_views`

## Usage

### Prerequisites
1. Run export script: `npm run db:export`
2. Run import script: `npm run db:import`

### Run Validation
```bash
npm run db:validate
```

### Expected Output

```
=================================================
Data Migration Validation
=================================================
Database: rakizah
Host: localhost
=================================================

📦 Loading export metadata...

✓ Loaded metadata from export date: 1/15/2025, 10:30:00 AM
✓ Source: https://ladijmiywlfvufclcpzg.supabase.co
✓ Tables to validate: 15

📋 Validating table: profiles
  ✓ Record count matches: 25
  🔗 Validating 0 foreign key relationship(s)...

📋 Validating table: user_roles
  ✓ Record count matches: 25
  🔗 Validating 1 foreign key relationship(s)...
  ✓ FK valid: user_id → profiles

... [continues for all tables] ...

🔍 Checking for data transformation issues...

  ✓ All UUID formats are valid (36 characters)
  ✓ Quizzes table contains 42 records with JSON questions field
  ✓ Games table contains 15 records with JSON config field
  ✓ All timestamp fields are properly populated
  ✓ Subscription data is consistent

=================================================
Validation Report
=================================================

📊 Summary Statistics:
   Total tables validated: 15
   Total records (source): 500
   Total records (target): 500
   Tables with count mismatches: 0
   Tables with FK violations: 0
   Total FK violations: 0
   Validation duration: 2.45s

📋 Detailed Results:

Table                    Source  Target  Match  FK Issues
----------------------------------------------------------------
profiles                     25      25    ✓    ✓
user_roles                   25      25    ✓    ✓
grades                       12      12    ✓    ✓
... [all tables] ...

=================================================
✅ VALIDATION PASSED
=================================================

All data has been successfully migrated!
- All record counts match
- All foreign key relationships are valid
- No data transformation issues detected
```

## Error Example

If issues are detected:

```
=================================================
❌ VALIDATION FAILED
=================================================

Issues detected during validation:

❌ 2 table(s) have record count mismatches
❌ 5 foreign key violation(s) detected
⚠️  3 data transformation warning(s)

Recommended actions:
1. Review the detailed results above
2. Check the import script logs for errors
3. Re-run the import script if necessary
4. Investigate foreign key violations
5. Fix data transformation issues
```

## Implementation Details

### Metadata Loading
- Reads `migration-data/_metadata.json` for source record counts
- Contains export date, source URL, table counts

### Record Count Validation
- Uses SQL `SELECT COUNT(*) FROM table_name` for target counts
- Compares with metadata source counts
- Logs mismatches with difference (+/-N)

### Foreign Key Validation Algorithm
1. Query all distinct foreign key values from child table
2. Query all primary key values from parent table
3. Identify foreign keys not present in parent table
4. Report violations with first 10 missing IDs

### Data Transformation Checks
- **UUID Validation**: `LENGTH(id) != 36`
- **JSON Validation**: Relies on MySQL's JSON type constraints
- **Timestamp Validation**: `created_at IS NULL`
- **Business Logic**: Custom checks for domain-specific rules

## Requirements Mapping

| Requirement | Implementation | Status |
|------------|----------------|--------|
| 2.4 - Validate data integrity | Record count comparison, FK validation | ✅ |
| 2.5 - Log warnings | Data transformation warning system | ✅ |

## Next Steps After Validation

1. **If validation passes**: Proceed to authentication system migration (task 5.x)
2. **If validation fails**:
   - Review detailed error report
   - Check import script logs
   - Fix data issues in source or import logic
   - Re-run import and validation

## Troubleshooting

### "Metadata file not found"
- **Cause**: Export script hasn't been run
- **Solution**: Run `npm run db:export` first

### Record Count Mismatches
- **Cause**: Import script failed for some records
- **Solution**: Check import logs, fix errors, re-run import

### Foreign Key Violations
- **Cause**: 
  - Parent records failed to import
  - Data inconsistency in source database
- **Solution**: Investigate missing parent records, ensure proper import order

### MySQL Connection Errors
- **Cause**: Database not running or wrong credentials
- **Solution**: Check `.env` file, verify MySQL is running

## Files

- **Script**: `scripts/validate-migration-data.ts`
- **Metadata**: `migration-data/_metadata.json` (generated by export script)
- **Package Script**: `npm run db:validate`

## Status Indicators

- ✅ Success / Passed
- ❌ Failed / Error
- ⚠️  Warning
- ✓ Valid / Match
- 📦 Loading data
- 📋 Processing table
- 🔗 Validating relationships
- 🔍 Checking details
- 📊 Reporting statistics
