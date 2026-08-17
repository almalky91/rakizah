/**
 * Data Export Script from Supabase to MySQL-compatible format
 * 
 * This script exports all tables from Supabase PostgreSQL database
 * and transforms the data to be compatible with MySQL:
 * - UUIDs are kept as VARCHAR(36) strings
 * - JSONB fields are converted to standard JSON
 * - TIMESTAMPTZ are converted to ISO strings for MySQL TIMESTAMP
 * - Handles null values and preserves foreign key relationships
 * 
 * Requirements: 2.1, 2.2, 2.5
 * 
 * USAGE:
 * 1. Install dependencies: npm install @supabase/supabase-js (temporary for migration)
 * 2. Set environment variables or use hardcoded values below
 * 3. Run: npm run db:export OR npx tsx scripts/export-supabase-data.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Supabase connection configuration
// Note: Update these values with your ACTIVE Supabase instance credentials
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ladijmiywlfvufclcpzg.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhZGlqbWl5d2xmdnVmY2xjcHpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE3MDkwMywiZXhwIjoyMDk4NzQ2OTAzfQ.nVAgKAvqDMLgQsrVP2RGPZydURKUK3DPNUEnN-siY7w';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERROR: Missing Supabase credentials');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
  console.error('Or update the hardcoded values in this script');
  process.exit(1);
}

// Dynamic import of Supabase client
let supabase: any;
try {
  const { createClient } = await import('@supabase/supabase-js');
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
} catch (error) {
  console.error('❌ ERROR: @supabase/supabase-js is not installed');
  console.error('Please install it temporarily for the migration:');
  console.error('  npm install @supabase/supabase-js');
  console.error('');
  console.error('After migration is complete, you can remove it:');
  console.error('  npm uninstall @supabase/supabase-js');
  process.exit(1);
}

// Output directory for exported data
const OUTPUT_DIR = path.join(process.cwd(), 'migration-data');

// List of tables to export (in dependency order - parent tables first)
const TABLES_TO_EXPORT = [
  // Auth tables
  'profiles',
  'user_roles',
  
  // Content tables
  'quizzes',
  'videos',
  'games',
  
  // Results and tracking tables
  'quiz_results',
  'public_quiz_results',
  'video_views',
  'public_video_views',
  'game_scores',
  
  // Skills hierarchy tables (in dependency order)
  'grades',
  'subjects',
  'fields',
  'skills',
  'teacher_skills',
  'student_skills',
];

/**
 * Transform PostgreSQL timestamp with timezone to MySQL compatible format
 */
function transformTimestamp(value: any): string | null {
  if (!value) return null;
  
  // If already a Date object
  if (value instanceof Date) {
    return value.toISOString().slice(0, 19).replace('T', ' ');
  }
  
  // If a string, parse and convert
  if (typeof value === 'string') {
    const date = new Date(value);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }
  
  return null;
}

/**
 * Transform JSONB to standard JSON string
 */
function transformJSON(value: any): string | null {
  if (!value) return null;
  
  // If already an object, stringify it
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  // If a string, validate it's valid JSON
  if (typeof value === 'string') {
    try {
      JSON.parse(value);
      return value;
    } catch {
      return JSON.stringify(value);
    }
  }
  
  return null;
}

/**
 * Transform a single row for MySQL compatibility
 */
function transformRow(row: any, tableName: string): any {
  const transformed: any = {};
  
  for (const [key, value] of Object.entries(row)) {
    // Handle null values
    if (value === null || value === undefined) {
      transformed[key] = null;
      continue;
    }
    
    // Transform UUIDs (already strings in JS)
    if (key === 'id' || key.endsWith('_id')) {
      transformed[key] = String(value);
      continue;
    }
    
    // Transform timestamps
    if (key.includes('_at') || key === 'viewed_at' || key === 'last_practiced') {
      transformed[key] = transformTimestamp(value);
      continue;
    }
    
    // Transform JSONB fields to JSON
    if (key === 'questions' || key === 'config' || key === 'answers') {
      transformed[key] = transformJSON(value);
      continue;
    }
    
    // Transform enum values (role field)
    if (key === 'role') {
      transformed[key] = String(value);
      continue;
    }
    
    // All other fields pass through as-is
    transformed[key] = value;
  }
  
  return transformed;
}

/**
 * Export a single table from Supabase
 */
async function exportTable(tableName: string): Promise<void> {
  console.log(`\n📦 Exporting table: ${tableName}`);
  
  try {
    // Fetch all records from the table
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: true, nullsFirst: false });
    
    if (error) {
      console.error(`❌ Error fetching ${tableName}:`, error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log(`⚠️  Table ${tableName} is empty`);
      
      // Still create an empty file for consistency
      const outputFile = path.join(OUTPUT_DIR, `${tableName}.json`);
      fs.writeFileSync(outputFile, JSON.stringify([], null, 2), 'utf-8');
      return;
    }
    
    console.log(`   Found ${data.length} records`);
    
    // Transform each row for MySQL compatibility
    const transformedData = data.map(row => transformRow(row, tableName));
    
    // Write to JSON file
    const outputFile = path.join(OUTPUT_DIR, `${tableName}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(transformedData, null, 2), 'utf-8');
    
    console.log(`✅ Exported ${transformedData.length} records to ${tableName}.json`);
    
    // Log warnings for specific data transformations
    const warnings: string[] = [];
    
    transformedData.forEach((row, idx) => {
      // Check for potential UUID format issues
      if (row.id && row.id.length !== 36) {
        warnings.push(`Row ${idx}: ID length is ${row.id.length} (expected 36)`);
      }
      
      // Check for JSON fields
      if (row.questions && typeof row.questions === 'string') {
        try {
          JSON.parse(row.questions);
        } catch {
          warnings.push(`Row ${idx}: Invalid JSON in questions field`);
        }
      }
      
      if (row.config && typeof row.config === 'string') {
        try {
          JSON.parse(row.config);
        } catch {
          warnings.push(`Row ${idx}: Invalid JSON in config field`);
        }
      }
    });
    
    if (warnings.length > 0) {
      console.log(`⚠️  Warnings for ${tableName}:`);
      warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
  } catch (err) {
    console.error(`❌ Exception while exporting ${tableName}:`, err);
  }
}

/**
 * Generate export metadata summary
 */
async function generateMetadata(exportedTables: string[]): Promise<void> {
  const metadata = {
    exportDate: new Date().toISOString(),
    supabaseUrl: SUPABASE_URL,
    exportedTables: exportedTables,
    tableCounts: {} as Record<string, number>,
    notes: [
      'UUIDs are stored as VARCHAR(36) strings',
      'JSONB fields converted to JSON strings',
      'Timestamps converted to MySQL TIMESTAMP format (YYYY-MM-DD HH:MM:SS)',
      'All foreign key relationships are preserved',
      'Null values are preserved as NULL',
    ],
  };
  
  // Count records in each exported file
  for (const table of exportedTables) {
    try {
      const filePath = path.join(OUTPUT_DIR, `${table}.json`);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const records = JSON.parse(fileContent);
      metadata.tableCounts[table] = records.length;
    } catch {
      metadata.tableCounts[table] = 0;
    }
  }
  
  // Write metadata file
  const metadataFile = path.join(OUTPUT_DIR, '_metadata.json');
  fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2), 'utf-8');
  
  console.log('\n📊 Export Summary:');
  console.log(`   Total tables exported: ${exportedTables.length}`);
  console.log(`   Total records: ${Object.values(metadata.tableCounts).reduce((a, b) => a + b, 0)}`);
  console.log('\n   Records per table:');
  Object.entries(metadata.tableCounts).forEach(([table, count]) => {
    console.log(`   - ${table}: ${count} records`);
  });
}

/**
 * Main export function
 */
async function main() {
  console.log('🚀 Starting Supabase Data Export');
  console.log(`   Source: ${SUPABASE_URL}`);
  console.log(`   Output: ${OUTPUT_DIR}`);
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Created output directory: ${OUTPUT_DIR}`);
  }
  
  // Export each table
  for (const table of TABLES_TO_EXPORT) {
    await exportTable(table);
  }
  
  // Generate metadata summary
  await generateMetadata(TABLES_TO_EXPORT);
  
  console.log('\n✅ Export completed successfully!');
  console.log(`   Data exported to: ${OUTPUT_DIR}`);
  console.log('\nNext steps:');
  console.log('   1. Review the exported data in migration-data/ directory');
  console.log('   2. Run the import script to populate MySQL database');
  console.log('   3. Run the validation script to verify data integrity');
}

// Run the export
main().catch(err => {
  console.error('❌ Export failed:', err);
  process.exit(1);
});
