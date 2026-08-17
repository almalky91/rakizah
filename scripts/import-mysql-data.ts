/**
 * MySQL Data Import Script
 * 
 * This script imports the exported Supabase data into MySQL database.
 * It preserves foreign key relationships by importing in the correct order
 * and handles null values and default values correctly.
 * 
 * Requirements: 2.3, 2.6
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define table import order (respecting foreign key dependencies)
const IMPORT_ORDER = [
  // No dependencies
  { name: 'profiles', table: profiles },
  { name: 'grades', table: grades },
  
  // Depends on profiles
  { name: 'user_roles', table: userRoles },
  
  // Depends on grades
  { name: 'fields', table: fields },
  
  // Depends on fields
  { name: 'subjects', table: subjects },
  
  // Depends on fields and grades
  { name: 'skills', table: skills },
  
  // Depends on profiles and skills
  { name: 'teacher_skills', table: teacherSkills },
  
  // Depends on profiles (content)
  { name: 'quizzes', table: quizzes },
  { name: 'videos', table: videos },
  { name: 'games', table: games },
  
  // Depends on quizzes and profiles
  { name: 'quiz_results', table: quizResults },
  { name: 'public_quiz_results', table: publicQuizResults },
  
  // Depends on videos and profiles
  { name: 'video_views', table: videoViews },
  { name: 'public_video_views', table: publicVideoViews },
  
  // Depends on profiles
  { name: 'game_scores', table: gameScores },
];

interface ImportStats {
  tableName: string;
  recordsImported: number;
  recordsSkipped: number;
  errors: string[];
  duration: number;
}

/**
 * Transform field names from snake_case to camelCase for Drizzle ORM
 */
function transformFieldNames(record: any, tableName: string): any {
  const transformed: any = {};
  
  for (const [key, value] of Object.entries(record)) {
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    // Handle null values
    if (value === null || value === undefined) {
      transformed[camelKey] = null;
      continue;
    }
    
    // Handle JSON fields - parse if string
    if (typeof value === 'string' && (key === 'questions' || key === 'config' || key === 'answers')) {
      try {
        transformed[camelKey] = JSON.parse(value);
      } catch (e) {
        // If parsing fails, keep as string
        transformed[camelKey] = value;
      }
      continue;
    }
    
    // Handle boolean fields (MySQL stores as 0/1)
    if (key === 'subscription_active' && typeof value === 'number') {
      transformed[camelKey] = value === 1;
      continue;
    }
    
    // Handle timestamp fields - convert to Date object if string
    if (typeof value === 'string' && (key.includes('_at') || key.includes('created') || key.includes('updated') || key === 'viewed_at')) {
      transformed[camelKey] = new Date(value);
      continue;
    }
    
    // Keep everything else as is
    transformed[camelKey] = value;
  }
  
  return transformed;
}

/**
 * Load exported data from JSON file
 */
async function loadExportedData(tableName: string): Promise<any[]> {
  const dataDir = path.join(__dirname, '..', 'migration-data');
  const filepath = path.join(dataDir, `${tableName}.json`);
  
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.warn(`  ⚠️  File not found: ${tableName}.json (table may be empty)`);
      return [];
    }
    throw error;
  }
}

/**
 * Import data into a single table with batch processing
 */
async function importTable(
  tableName: string,
  table: any,
  batchSize: number = 100
): Promise<ImportStats> {
  const startTime = Date.now();
  const stats: ImportStats = {
    tableName,
    recordsImported: 0,
    recordsSkipped: 0,
    errors: [],
    duration: 0,
  };
  
  try {
    console.log(`\nImporting table: ${tableName}`);
    
    // Load exported data
    const exportedRecords = await loadExportedData(tableName);
    
    if (exportedRecords.length === 0) {
      console.log(`  ℹ️  No records to import for ${tableName}`);
      stats.duration = Date.now() - startTime;
      return stats;
    }
    
    console.log(`  📦 Loaded ${exportedRecords.length} records from export file`);
    
    // Transform and import records in batches
    let batch: any[] = [];
    
    for (let i = 0; i < exportedRecords.length; i++) {
      const record = exportedRecords[i];
      
      try {
        // Transform field names and values
        const transformed = transformFieldNames(record, tableName);
        batch.push(transformed);
        
        // Import batch when it reaches batchSize or it's the last record
        if (batch.length >= batchSize || i === exportedRecords.length - 1) {
          try {
            await db.insert(table).values(batch);
            stats.recordsImported += batch.length;
            console.log(`  ✓ Imported batch: ${stats.recordsImported}/${exportedRecords.length} records`);
          } catch (batchError: any) {
            // If batch insert fails, try inserting records one by one
            console.warn(`  ⚠️  Batch insert failed, trying individual inserts...`);
            
            for (const singleRecord of batch) {
              try {
                await db.insert(table).values(singleRecord);
                stats.recordsImported++;
              } catch (singleError: any) {
                stats.recordsSkipped++;
                const errorMsg = `Record ID ${singleRecord.id}: ${singleError.message}`;
                stats.errors.push(errorMsg);
                console.error(`  ❌ ${errorMsg}`);
              }
            }
          }
          
          batch = [];
        }
      } catch (transformError: any) {
        stats.recordsSkipped++;
        const errorMsg = `Transform error for record ${i}: ${transformError.message}`;
        stats.errors.push(errorMsg);
        console.error(`  ❌ ${errorMsg}`);
      }
    }
    
    console.log(`  ✅ Completed: ${stats.recordsImported} imported, ${stats.recordsSkipped} skipped`);
    
  } catch (error: any) {
    console.error(`  ❌ Fatal error importing ${tableName}:`, error.message);
    stats.errors.push(`Fatal error: ${error.message}`);
  }
  
  stats.duration = Date.now() - startTime;
  return stats;
}

/**
 * Disable foreign key checks temporarily for import
 */
async function disableForeignKeyChecks(): Promise<void> {
  console.log('\n🔓 Disabling foreign key checks...');
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
}

/**
 * Re-enable foreign key checks after import
 */
async function enableForeignKeyChecks(): Promise<void> {
  console.log('\n🔒 Re-enabling foreign key checks...');
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
}

/**
 * Clear all tables before import (optional, for clean import)
 */
async function clearAllTables(): Promise<void> {
  console.log('\n🗑️  Clearing all tables...');
  
  await disableForeignKeyChecks();
  
  // Delete in reverse order to respect dependencies
  for (let i = IMPORT_ORDER.length - 1; i >= 0; i--) {
    const { name, table } = IMPORT_ORDER[i];
    try {
      await db.delete(table);
      console.log(`  ✓ Cleared ${name}`);
    } catch (error: any) {
      console.warn(`  ⚠️  Could not clear ${name}: ${error.message}`);
    }
  }
  
  await enableForeignKeyChecks();
}

/**
 * Main import function
 */
async function main() {
  console.log('=================================================');
  console.log('MySQL Data Import');
  console.log('=================================================');
  console.log(`Database: ${process.env.DATABASE_NAME || 'rakizah'}`);
  console.log(`Host: ${process.env.DATABASE_HOST || 'localhost'}`);
  console.log(`Tables to import: ${IMPORT_ORDER.length}`);
  console.log('=================================================\n');
  
  const allStats: ImportStats[] = [];
  
  try {
    // Ask user if they want to clear existing data
    const args = process.argv.slice(2);
    const shouldClear = args.includes('--clear');
    
    if (shouldClear) {
      await clearAllTables();
    }
    
    // Disable foreign key checks during import
    await disableForeignKeyChecks();
    
    // Import each table in order
    console.log('\n📥 Starting data import...\n');
    
    for (const { name, table } of IMPORT_ORDER) {
      const stats = await importTable(name, table);
      allStats.push(stats);
    }
    
    // Re-enable foreign key checks
    await enableForeignKeyChecks();
    
    // Generate summary report
    console.log('\n=================================================');
    console.log('Import Summary');
    console.log('=================================================\n');
    
    console.log('Table                        Imported  Skipped  Duration');
    console.log('-----------------------------------------------------------');
    
    let totalImported = 0;
    let totalSkipped = 0;
    let totalDuration = 0;
    
    for (const stats of allStats) {
      const imported = stats.recordsImported.toString().padStart(8);
      const skipped = stats.recordsSkipped.toString().padStart(8);
      const duration = `${(stats.duration / 1000).toFixed(2)}s`.padStart(9);
      const tableName = stats.tableName.padEnd(24);
      
      console.log(`${tableName} ${imported} ${skipped} ${duration}`);
      
      totalImported += stats.recordsImported;
      totalSkipped += stats.recordsSkipped;
      totalDuration += stats.duration;
    }
    
    console.log('-----------------------------------------------------------');
    console.log(`Total Records Imported: ${totalImported}`);
    console.log(`Total Records Skipped: ${totalSkipped}`);
    console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    
    // Report errors
    const tablesWithErrors = allStats.filter(s => s.errors.length > 0);
    if (tablesWithErrors.length > 0) {
      console.log('\n⚠️  WARNING: Some records failed to import:');
      
      for (const stats of tablesWithErrors) {
        console.log(`\n${stats.tableName}:`);
        stats.errors.slice(0, 5).forEach(err => console.log(`  - ${err}`));
        
        if (stats.errors.length > 5) {
          console.log(`  ... and ${stats.errors.length - 5} more errors`);
        }
      }
    }
    
    console.log('\n=================================================');
    console.log('Import Complete!');
    console.log('=================================================\n');
    
    console.log('Next steps:');
    console.log('1. Run the validation script to verify data integrity');
    console.log('2. Check foreign key relationships');
    console.log('3. Test the application with the imported data\n');
    
    if (totalSkipped > 0) {
      console.log(`⚠️  ${totalSkipped} records were skipped. Review the errors above.\n`);
      process.exit(1);
    }
    
  } catch (error: any) {
    console.error('\n❌ Fatal error during import:', error);
    console.error('Stack trace:', error.stack);
    
    // Try to re-enable foreign key checks even on error
    try {
      await enableForeignKeyChecks();
    } catch (cleanupError) {
      console.error('Failed to re-enable foreign key checks:', cleanupError);
    }
    
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the import
main().catch(err => {
  console.error('\n❌ Unhandled error during import:', err);
  process.exit(1);
});
