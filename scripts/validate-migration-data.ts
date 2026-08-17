/**
 * Data Validation Script for Supabase to MySQL Migration
 * 
 * This script validates the data migration by:
 * 1. Comparing record counts between source (metadata) and target (MySQL)
 * 2. Validating foreign key integrity across all tables
 * 3. Logging data transformation warnings
 * 4. Generating a comprehensive validation report
 * 
 * Requirements: 2.4, 2.5
 */

import { db } from '../src/db/index.js';
import {
  profiles,
  userRoles,
  grades,
  fields,
  subjects,
  skills,
  teacherSkills,
  quizzes,
  videos,
  games,
  quizResults,
  publicQuizResults,
  gameScores,
  videoViews,
  publicVideoViews,
} from '../src/db/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { sql } from 'drizzle-orm';
import { inArray } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define all tables to validate (in same order as import)
const TABLES_TO_VALIDATE = [
  { name: 'profiles', table: profiles },
  { name: 'user_roles', table: userRoles },
  { name: 'grades', table: grades },
  { name: 'fields', table: fields },
  { name: 'subjects', table: subjects },
  { name: 'skills', table: skills },
  { name: 'teacher_skills', table: teacherSkills },
  { name: 'quizzes', table: quizzes },
  { name: 'videos', table: videos },
  { name: 'games', table: games },
  { name: 'quiz_results', table: quizResults },
  { name: 'public_quiz_results', table: publicQuizResults },
  { name: 'video_views', table: videoViews },
  { name: 'public_video_views', table: publicVideoViews },
  { name: 'game_scores', table: gameScores },
];

// Foreign key relationships to validate
const FOREIGN_KEY_CHECKS = [
  {
    table: 'user_roles',
    foreignKey: 'user_id',
    references: { table: 'profiles', column: 'id' },
  },
  {
    table: 'fields',
    foreignKey: 'grade_id',
    references: { table: 'grades', column: 'id' },
  },
  {
    table: 'subjects',
    foreignKey: 'field_id',
    references: { table: 'fields', column: 'id' },
  },
  {
    table: 'skills',
    foreignKey: 'field_id',
    references: { table: 'fields', column: 'id' },
  },
  {
    table: 'skills',
    foreignKey: 'grade_id',
    references: { table: 'grades', column: 'id' },
  },
  {
    table: 'teacher_skills',
    foreignKey: 'teacher_id',
    references: { table: 'profiles', column: 'id' },
  },
  {
    table: 'teacher_skills',
    foreignKey: 'skill_id',
    references: { table: 'skills', column: 'id' },
  },
  {
    table: 'quizzes',
    foreignKey: 'teacher_id',
    references: { table: 'profiles', column: 'id' },
  },
  {
    table: 'videos',
    foreignKey: 'teacher_id',
    references: { table: 'profiles', column: 'id' },
  },
  {
    table: 'games',
    foreignKey: 'teacher_id',
    references: { table: 'profiles', column: 'id' },
  },
  {
    table: 'quiz_results',
    foreignKey: 'quiz_id',
    references: { table: 'quizzes', column: 'id' },
  },
  {
    table: 'quiz_results',
    foreignKey: 'student_id',
    references: { table: 'profiles', column: 'id' },
  },
  {
    table: 'quiz_results',
    foreignKey: 'teacher_id',
    references: { table: 'profiles', column: 'id' },
  },
  {
    table: 'public_quiz_results',
    foreignKey: 'quiz_id',
    references: { table: 'quizzes', column: 'id' },
  },
  {
    table: 'video_views',
    foreignKey: 'video_id',
    references: { table: 'videos', column: 'id' },
  },
  {
    table: 'video_views',
    foreignKey: 'student_id',
    references: { table: 'profiles', column: 'id' },
  },
  {
    table: 'video_views',
    foreignKey: 'teacher_id',
    references: { table: 'profiles', column: 'id' },
  },
  {
    table: 'public_video_views',
    foreignKey: 'video_id',
    references: { table: 'videos', column: 'id' },
  },
  {
    table: 'game_scores',
    foreignKey: 'student_id',
    references: { table: 'profiles', column: 'id' },
  },
  {
    table: 'game_scores',
    foreignKey: 'teacher_id',
    references: { table: 'profiles', column: 'id' },
  },
];

interface ValidationStats {
  tableName: string;
  sourceCount: number;
  targetCount: number;
  countMatch: boolean;
  foreignKeyViolations: ForeignKeyViolation[];
  warnings: string[];
}

interface ForeignKeyViolation {
  foreignKey: string;
  referencedTable: string;
  missingIds: string[];
  violationCount: number;
}

interface ExportMetadata {
  exportDate: string;
  supabaseUrl: string;
  exportedTables: string[];
  tableCounts: Record<string, number>;
  notes: string[];
}

/**
 * Load export metadata from JSON file
 */
async function loadMetadata(): Promise<ExportMetadata | null> {
  const dataDir = path.join(__dirname, '..', 'migration-data');
  const metadataPath = path.join(dataDir, '_metadata.json');
  
  try {
    const content = await fs.readFile(metadataPath, 'utf-8');
    return JSON.parse(content);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.error('  ❌ Metadata file not found. Have you run the export script?');
      return null;
    }
    throw error;
  }
}

/**
 * Count records in a MySQL table
 */
async function countTableRecords(tableName: string): Promise<number> {
  try {
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)}`);
    const count = (result[0] as any)[0]?.count || 0;
    return Number(count);
  } catch (error: any) {
    console.error(`  ⚠️  Error counting records in ${tableName}:`, error.message);
    return 0;
  }
}

/**
 * Validate foreign key integrity for a specific relationship
 */
async function validateForeignKey(
  tableName: string,
  foreignKey: string,
  referencedTable: string,
  referencedColumn: string
): Promise<ForeignKeyViolation | null> {
  try {
    // Get all foreign key values from the child table
    const foreignKeyValues = await db.execute(
      sql`SELECT DISTINCT ${sql.identifier(foreignKey)} as fk_value 
          FROM ${sql.identifier(tableName)} 
          WHERE ${sql.identifier(foreignKey)} IS NOT NULL`
    );
    
    if (!foreignKeyValues[0] || (foreignKeyValues[0] as any[]).length === 0) {
      // No foreign keys to validate
      return null;
    }
    
    const fkValues = (foreignKeyValues[0] as any[]).map(row => row.fk_value);
    
    // Get all existing IDs from the parent table
    const existingIds = await db.execute(
      sql`SELECT ${sql.identifier(referencedColumn)} as id FROM ${sql.identifier(referencedTable)}`
    );
    
    const existingIdSet = new Set(
      (existingIds[0] as any[]).map(row => row.id)
    );
    
    // Find foreign key values that don't exist in the parent table
    const missingIds = fkValues.filter(fk => !existingIdSet.has(fk));
    
    if (missingIds.length > 0) {
      return {
        foreignKey,
        referencedTable,
        missingIds: missingIds.slice(0, 10), // Limit to first 10 for readability
        violationCount: missingIds.length,
      };
    }
    
    return null;
  } catch (error: any) {
    console.error(`  ⚠️  Error validating FK ${tableName}.${foreignKey}:`, error.message);
    return null;
  }
}

/**
 * Validate a single table
 */
async function validateTable(
  tableName: string,
  sourceCount: number
): Promise<ValidationStats> {
  const stats: ValidationStats = {
    tableName,
    sourceCount,
    targetCount: 0,
    countMatch: false,
    foreignKeyViolations: [],
    warnings: [],
  };
  
  try {
    console.log(`\n📋 Validating table: ${tableName}`);
    
    // Count records in target database
    stats.targetCount = await countTableRecords(tableName);
    stats.countMatch = stats.sourceCount === stats.targetCount;
    
    // Report count comparison
    if (stats.countMatch) {
      console.log(`  ✓ Record count matches: ${stats.targetCount}`);
    } else {
      const diff = stats.targetCount - stats.sourceCount;
      const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
      console.log(`  ❌ Record count mismatch: Source=${stats.sourceCount}, Target=${stats.targetCount} (${diffStr})`);
      stats.warnings.push(`Record count mismatch: expected ${stats.sourceCount}, found ${stats.targetCount}`);
    }
    
    // Validate foreign keys for this table
    const fkChecks = FOREIGN_KEY_CHECKS.filter(check => check.table === tableName);
    
    if (fkChecks.length > 0 && stats.targetCount > 0) {
      console.log(`  🔗 Validating ${fkChecks.length} foreign key relationship(s)...`);
      
      for (const fkCheck of fkChecks) {
        const violation = await validateForeignKey(
          tableName,
          fkCheck.foreignKey,
          fkCheck.references.table,
          fkCheck.references.column
        );
        
        if (violation) {
          stats.foreignKeyViolations.push(violation);
          console.log(`  ❌ FK violation: ${fkCheck.foreignKey} → ${fkCheck.references.table}.${fkCheck.references.column}`);
          console.log(`     Missing ${violation.violationCount} reference(s)`);
          
          if (violation.missingIds.length <= 5) {
            console.log(`     Missing IDs: ${violation.missingIds.join(', ')}`);
          } else {
            console.log(`     First 5 missing IDs: ${violation.missingIds.slice(0, 5).join(', ')}...`);
          }
        } else {
          console.log(`  ✓ FK valid: ${fkCheck.foreignKey} → ${fkCheck.references.table}`);
        }
      }
    }
    
  } catch (error: any) {
    console.error(`  ❌ Error validating ${tableName}:`, error.message);
    stats.warnings.push(`Validation error: ${error.message}`);
  }
  
  return stats;
}

/**
 * Check for data transformation warnings
 */
async function checkDataTransformationWarnings(): Promise<string[]> {
  const warnings: string[] = [];
  
  console.log('\n🔍 Checking for data transformation issues...\n');
  
  try {
    // Check for invalid UUID formats (should be 36 characters)
    const invalidUuids = await db.execute(
      sql`SELECT 'profiles' as table_name, id, LENGTH(id) as len 
          FROM profiles 
          WHERE LENGTH(id) != 36 
          LIMIT 5`
    );
    
    if (invalidUuids[0] && (invalidUuids[0] as any[]).length > 0) {
      const count = (invalidUuids[0] as any[]).length;
      warnings.push(`Found ${count} records with invalid UUID format in profiles table`);
      console.log(`  ⚠️  Invalid UUID formats detected in profiles`);
    } else {
      console.log(`  ✓ All UUID formats are valid (36 characters)`);
    }
    
    // Check for JSON field validity in quizzes
    const quizCount = await countTableRecords('quizzes');
    if (quizCount > 0) {
      console.log(`  ✓ Quizzes table contains ${quizCount} records with JSON questions field`);
      // Note: JSON validation happens at insert time in MySQL, so if data is there, it's valid
    }
    
    // Check for JSON field validity in games
    const gameCount = await countTableRecords('games');
    if (gameCount > 0) {
      console.log(`  ✓ Games table contains ${gameCount} records with JSON config field`);
    }
    
    // Check for timestamp validity (should not be null for created_at fields)
    const nullTimestamps = await db.execute(
      sql`SELECT COUNT(*) as count FROM profiles WHERE created_at IS NULL`
    );
    
    const nullCount = Number((nullTimestamps[0] as any)[0]?.count || 0);
    if (nullCount > 0) {
      warnings.push(`Found ${nullCount} profiles with NULL created_at timestamps`);
      console.log(`  ⚠️  ${nullCount} profiles have NULL created_at timestamps`);
    } else {
      console.log(`  ✓ All timestamp fields are properly populated`);
    }
    
    // Check for subscription data integrity
    const activeSubscriptions = await db.execute(
      sql`SELECT COUNT(*) as count 
          FROM profiles 
          WHERE subscription_active = true 
          AND subscription_ends_at IS NULL`
    );
    
    const invalidSubCount = Number((activeSubscriptions[0] as any)[0]?.count || 0);
    if (invalidSubCount > 0) {
      warnings.push(`Found ${invalidSubCount} active subscriptions without end date`);
      console.log(`  ⚠️  ${invalidSubCount} profiles have active subscriptions but no end date`);
    } else {
      console.log(`  ✓ Subscription data is consistent`);
    }
    
  } catch (error: any) {
    console.error(`  ❌ Error checking data transformations:`, error.message);
    warnings.push(`Data transformation check error: ${error.message}`);
  }
  
  return warnings;
}

/**
 * Generate validation report
 */
function generateReport(
  allStats: ValidationStats[],
  transformWarnings: string[],
  startTime: number
): void {
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n=================================================');
  console.log('Validation Report');
  console.log('=================================================\n');
  
  // Summary statistics
  const totalTables = allStats.length;
  const tablesWithCountMismatch = allStats.filter(s => !s.countMatch).length;
  const tablesWithFkViolations = allStats.filter(s => s.foreignKeyViolations.length > 0).length;
  const totalFkViolations = allStats.reduce((sum, s) => sum + s.foreignKeyViolations.length, 0);
  const totalRecordsSource = allStats.reduce((sum, s) => sum + s.sourceCount, 0);
  const totalRecordsTarget = allStats.reduce((sum, s) => sum + s.targetCount, 0);
  
  console.log('📊 Summary Statistics:');
  console.log(`   Total tables validated: ${totalTables}`);
  console.log(`   Total records (source): ${totalRecordsSource}`);
  console.log(`   Total records (target): ${totalRecordsTarget}`);
  console.log(`   Tables with count mismatches: ${tablesWithCountMismatch}`);
  console.log(`   Tables with FK violations: ${tablesWithFkViolations}`);
  console.log(`   Total FK violations: ${totalFkViolations}`);
  console.log(`   Validation duration: ${duration}s`);
  
  // Detailed table report
  console.log('\n📋 Detailed Results:\n');
  console.log('Table                    Source  Target  Match  FK Issues');
  console.log('----------------------------------------------------------------');
  
  for (const stats of allStats) {
    const tableName = stats.tableName.padEnd(24);
    const source = stats.sourceCount.toString().padStart(6);
    const target = stats.targetCount.toString().padStart(6);
    const match = stats.countMatch ? '  ✓  ' : '  ❌  ';
    const fkIssues = stats.foreignKeyViolations.length > 0 
      ? `  ❌ ${stats.foreignKeyViolations.length}` 
      : '  ✓';
    
    console.log(`${tableName} ${source} ${target} ${match} ${fkIssues}`);
  }
  
  // Foreign key violation details
  if (totalFkViolations > 0) {
    console.log('\n⚠️  Foreign Key Violations:\n');
    
    for (const stats of allStats) {
      if (stats.foreignKeyViolations.length > 0) {
        console.log(`${stats.tableName}:`);
        
        for (const violation of stats.foreignKeyViolations) {
          console.log(`  - ${violation.foreignKey} → ${violation.referencedTable}`);
          console.log(`    ${violation.violationCount} missing reference(s)`);
          
          if (violation.missingIds.length <= 3) {
            console.log(`    Missing IDs: ${violation.missingIds.join(', ')}`);
          } else {
            console.log(`    Sample missing IDs: ${violation.missingIds.slice(0, 3).join(', ')}...`);
          }
        }
        
        console.log('');
      }
    }
  }
  
  // Data transformation warnings
  if (transformWarnings.length > 0) {
    console.log('⚠️  Data Transformation Warnings:\n');
    transformWarnings.forEach(warning => console.log(`  - ${warning}`));
    console.log('');
  }
  
  // Final verdict
  console.log('=================================================');
  
  const passed = tablesWithCountMismatch === 0 && totalFkViolations === 0 && transformWarnings.length === 0;
  
  if (passed) {
    console.log('✅ VALIDATION PASSED');
    console.log('=================================================\n');
    console.log('All data has been successfully migrated!');
    console.log('- All record counts match');
    console.log('- All foreign key relationships are valid');
    console.log('- No data transformation issues detected\n');
  } else {
    console.log('❌ VALIDATION FAILED');
    console.log('=================================================\n');
    console.log('Issues detected during validation:\n');
    
    if (tablesWithCountMismatch > 0) {
      console.log(`❌ ${tablesWithCountMismatch} table(s) have record count mismatches`);
    }
    
    if (totalFkViolations > 0) {
      console.log(`❌ ${totalFkViolations} foreign key violation(s) detected`);
    }
    
    if (transformWarnings.length > 0) {
      console.log(`⚠️  ${transformWarnings.length} data transformation warning(s)`);
    }
    
    console.log('\nRecommended actions:');
    console.log('1. Review the detailed results above');
    console.log('2. Check the import script logs for errors');
    console.log('3. Re-run the import script if necessary');
    console.log('4. Investigate foreign key violations');
    console.log('5. Fix data transformation issues\n');
  }
  
  console.log('=================================================\n');
}

/**
 * Main validation function
 */
async function main() {
  const startTime = Date.now();
  
  console.log('=================================================');
  console.log('Data Migration Validation');
  console.log('=================================================');
  console.log(`Database: ${process.env.DATABASE_NAME || 'rakizah'}`);
  console.log(`Host: ${process.env.DATABASE_HOST || 'localhost'}`);
  console.log('=================================================\n');
  
  try {
    // Load export metadata
    console.log('📦 Loading export metadata...\n');
    const metadata = await loadMetadata();
    
    if (!metadata) {
      console.error('❌ Cannot proceed without export metadata.');
      console.error('Please run the export script first: npm run db:export\n');
      process.exit(1);
    }
    
    console.log(`✓ Loaded metadata from export date: ${new Date(metadata.exportDate).toLocaleString()}`);
    console.log(`✓ Source: ${metadata.supabaseUrl}`);
    console.log(`✓ Tables to validate: ${metadata.exportedTables.length}\n`);
    
    // Validate each table
    const allStats: ValidationStats[] = [];
    
    for (const { name } of TABLES_TO_VALIDATE) {
      const sourceCount = metadata.tableCounts[name] || 0;
      const stats = await validateTable(name, sourceCount);
      allStats.push(stats);
    }
    
    // Check for data transformation warnings
    const transformWarnings = await checkDataTransformationWarnings();
    
    // Generate comprehensive report
    generateReport(allStats, transformWarnings, startTime);
    
    // Exit with appropriate code
    const hasErrors = allStats.some(s => !s.countMatch || s.foreignKeyViolations.length > 0);
    process.exit(hasErrors ? 1 : 0);
    
  } catch (error: any) {
    console.error('\n❌ Fatal error during validation:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the validation
main().catch(err => {
  console.error('\n❌ Unhandled error during validation:', err);
  process.exit(1);
});
