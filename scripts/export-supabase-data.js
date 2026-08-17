/**
 * Supabase to MySQL Data Export Script
 * 
 * This script exports all data from Supabase PostgreSQL database and transforms it
 * for MySQL compatibility:
 * - UUIDs remain as strings (VARCHAR in MySQL)
 * - JSONB fields are converted to JSON strings
 * - Timestamps with timezone are converted to MySQL TIMESTAMP format
 * - Exports data to JSON files for later import
 * 
 * Requirements: 2.1, 2.2, 2.5
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: Missing Supabase credentials.');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

// Create Supabase client with service role key for full access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Define all tables to export in dependency order (children before parents)
const TABLES_TO_EXPORT = [
  // No dependencies
  'grades',
  'profiles',
  'user_roles',
  
  // Depends on grades
  'fields',
  
  // Depends on fields
  'subjects',
  
  // Depends on fields and grades
  'skills',
  
  // Depends on profiles
  'teacher_skills',
  'quizzes',
  'videos',
  'games',
  
  // Depends on quizzes
  'quiz_results',
  'public_quiz_results',
  
  // Depends on videos
  'video_views',
  'public_video_views',
  
  // Depends on profiles (game_scores)
  'game_scores'
];

/**
 * Convert PostgreSQL timestamp to MySQL compatible format
 * @param {string} timestamp - ISO 8601 timestamp string
 * @returns {string} MySQL formatted timestamp
 */
function convertTimestamp(timestamp) {
  if (!timestamp) return null;
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return null;
  
  // MySQL TIMESTAMP format: YYYY-MM-DD HH:MM:SS
  return date.toISOString()
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, '');
}

/**
 * Transform a single record for MySQL compatibility
 * @param {Object} record - Database record
 * @param {string} tableName - Name of the table
 * @returns {Object} Transformed record
 */
function transformRecord(record, tableName) {
  const transformed = {};
  
  for (const [key, value] of Object.entries(record)) {
    // Handle null values
    if (value === null || value === undefined) {
      transformed[key] = null;
      continue;
    }
    
    // UUIDs remain as strings (already in correct format)
    if (typeof value === 'string') {
      transformed[key] = value;
      continue;
    }
    
    // Convert timestamps
    if (key.includes('_at') || key.includes('created') || key.includes('updated') || key === 'viewed_at') {
      transformed[key] = convertTimestamp(value);
      continue;
    }
    
    // Handle JSON/JSONB fields (questions, config, answers)
    if (typeof value === 'object' && (key === 'questions' || key === 'config' || key === 'answers')) {
      transformed[key] = JSON.stringify(value);
      continue;
    }
    
    // Handle boolean values
    if (typeof value === 'boolean') {
      transformed[key] = value ? 1 : 0;
      continue;
    }
    
    // Handle numbers
    if (typeof value === 'number') {
      transformed[key] = value;
      continue;
    }
    
    // Default: keep as is
    transformed[key] = value;
  }
  
  return transformed;
}

/**
 * Export a single table from Supabase
 * @param {string} tableName - Name of table to export
 * @returns {Promise<Array>} Array of transformed records
 */
async function exportTable(tableName) {
  console.log(`\nExporting table: ${tableName}`);
  
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' });
    
    if (error) {
      console.error(`  ❌ Error exporting ${tableName}:`, error.message);
      return {
        tableName,
        records: [],
        count: 0,
        error: error.message
      };
    }
    
    // Transform all records
    const transformedRecords = data.map(record => transformRecord(record, tableName));
    
    console.log(`  ✓ Exported ${transformedRecords.length} records from ${tableName}`);
    
    return {
      tableName,
      records: transformedRecords,
      count: transformedRecords.length,
      error: null
    };
  } catch (err) {
    console.error(`  ❌ Exception exporting ${tableName}:`, err.message);
    return {
      tableName,
      records: [],
      count: 0,
      error: err.message
    };
  }
}

/**
 * Main export function
 */
async function main() {
  console.log('=================================================');
  console.log('Supabase to MySQL Data Export');
  console.log('=================================================');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Tables to export: ${TABLES_TO_EXPORT.length}`);
  console.log('=================================================\n');
  
  const exportResults = [];
  const exportData = {};
  
  // Export each table
  for (const tableName of TABLES_TO_EXPORT) {
    const result = await exportTable(tableName);
    exportResults.push(result);
    
    if (result.error) {
      console.warn(`  ⚠️  Warning: Failed to export ${tableName}`);
    } else {
      exportData[tableName] = result.records;
    }
  }
  
  // Create output directory
  const outputDir = path.join(__dirname, '..', 'migration-data');
  await fs.mkdir(outputDir, { recursive: true });
  
  // Save individual table exports
  console.log('\n=================================================');
  console.log('Saving export files...');
  console.log('=================================================\n');
  
  for (const result of exportResults) {
    if (result.error) continue;
    
    const filename = `${result.tableName}.json`;
    const filepath = path.join(outputDir, filename);
    
    await fs.writeFile(
      filepath,
      JSON.stringify(result.records, null, 2),
      'utf-8'
    );
    
    console.log(`  ✓ Saved ${filename} (${result.count} records)`);
  }
  
  // Save combined export with metadata
  const exportMetadata = {
    exportDate: new Date().toISOString(),
    supabaseUrl: SUPABASE_URL,
    totalTables: TABLES_TO_EXPORT.length,
    tablesExported: exportResults.filter(r => !r.error).length,
    tablesFailed: exportResults.filter(r => r.error).length,
    tables: exportResults.map(r => ({
      name: r.tableName,
      recordCount: r.count,
      error: r.error
    })),
    data: exportData
  };
  
  const metadataPath = path.join(outputDir, 'export-metadata.json');
  await fs.writeFile(
    metadataPath,
    JSON.stringify(exportMetadata, null, 2),
    'utf-8'
  );
  
  console.log(`\n  ✓ Saved export-metadata.json`);
  
  // Generate summary report
  console.log('\n=================================================');
  console.log('Export Summary');
  console.log('=================================================\n');
  
  let totalRecords = 0;
  
  console.log('Table                        Records    Status');
  console.log('--------------------------------------------');
  
  for (const result of exportResults) {
    const status = result.error ? '❌ FAILED' : '✓ SUCCESS';
    const recordCount = result.count.toString().padStart(7);
    const tableName = result.tableName.padEnd(24);
    
    console.log(`${tableName} ${recordCount}    ${status}`);
    
    if (!result.error) {
      totalRecords += result.count;
    }
  }
  
  console.log('--------------------------------------------');
  console.log(`Total Records Exported: ${totalRecords}`);
  console.log(`Export Location: ${outputDir}`);
  
  // Check for failures
  const failures = exportResults.filter(r => r.error);
  if (failures.length > 0) {
    console.log('\n⚠️  WARNING: Some tables failed to export:');
    failures.forEach(f => {
      console.log(`  - ${f.tableName}: ${f.error}`);
    });
  }
  
  console.log('\n=================================================');
  console.log('Export Complete!');
  console.log('=================================================\n');
  
  console.log('Next steps:');
  console.log('1. Review the exported data in migration-data/');
  console.log('2. Set up your MySQL database');
  console.log('3. Run the import script to populate MySQL');
  console.log('4. Run the validation script to verify data integrity\n');
}

// Run the export
main().catch(err => {
  console.error('\n❌ Fatal error during export:', err);
  process.exit(1);
});
