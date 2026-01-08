#!/usr/bin/env node
/**
 * 🧹 Assessment Cleanup Script
 * Removes duplicate assessments, keeping only the most recent for each patient
 * Created: September 29, 2025
 */

import fs from 'fs/promises';
import path from 'path';

const FALLBACK_PATH = './data/fallback/assessments';

async function cleanupAssessments() {
  try {
    console.log('🧹 Starting assessment cleanup...');
    
    // Read all assessment files
    const files = await fs.readdir(FALLBACK_PATH);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    console.log(`📊 Found ${jsonFiles.length} assessment files`);
    
    // Load all assessments
    const assessments = [];
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(FALLBACK_PATH, file);
        const data = await fs.readFile(filePath, 'utf8');
        const assessment = JSON.parse(data);
        assessments.push({ ...assessment, filename: file });
      } catch (err) {
        console.error(`❌ Error reading ${file}:`, err.message);
      }
    }

    // Group by patient ID
    const patientGroups = {};
    assessments.forEach(assessment => {
      const patientId = assessment.patientId || assessment.patient_id;
      if (!patientId) {
        console.log('⚠️ Assessment without patient ID:', assessment.id);
        return;
      }
      
      if (!patientGroups[patientId]) {
        patientGroups[patientId] = [];
      }
      patientGroups[patientId].push(assessment);
    });

    console.log(`👥 Found assessments for ${Object.keys(patientGroups).length} patients`);

    let deletedCount = 0;
    let keptCount = 0;

    // Process each patient group
    for (const [patientId, patientAssessments] of Object.entries(patientGroups)) {
      if (patientAssessments.length <= 1) {
        keptCount += patientAssessments.length;
        continue;
      }

      // Sort by creation date (newest first)
      patientAssessments.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.updated_at || a.createdAt || a.created_at || 0);
        const dateB = new Date(b.updatedAt || b.updated_at || b.createdAt || b.created_at || 0);
        return dateB - dateA;
      });

      console.log(`🔄 Patient ${patientId}: ${patientAssessments.length} assessments, keeping most recent`);
      
      // Keep the most recent (first in sorted array)
      const mostRecent = patientAssessments[0];
      
      // Normalize the data structure
      const normalizedAssessment = {
        ...mostRecent,
        patientId: patientId,
        patient_id: patientId, // Keep both for compatibility
        updatedAt: new Date().toISOString(),
        lastSaved: new Date().toISOString()
      };
      
      // Save the normalized version
      const keepFile = path.join(FALLBACK_PATH, `${mostRecent.id}.json`);
      await fs.writeFile(keepFile, JSON.stringify(normalizedAssessment, null, 2));
      keptCount++;

      // Delete all older versions
      for (let i = 1; i < patientAssessments.length; i++) {
        const oldAssessment = patientAssessments[i];
        const deleteFile = path.join(FALLBACK_PATH, oldAssessment.filename);
        
        try {
          await fs.unlink(deleteFile);
          deletedCount++;
          console.log(`🗑️ Deleted duplicate: ${oldAssessment.filename}`);
        } catch (err) {
          console.error(`❌ Error deleting ${oldAssessment.filename}:`, err.message);
        }
      }
    }

    console.log('✅ Cleanup completed:');
    console.log(`   📊 Kept: ${keptCount} assessments`);
    console.log(`   🗑️ Deleted: ${deletedCount} duplicates`);
    console.log(`   👥 Patients with assessments: ${Object.keys(patientGroups).length}`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run cleanup
cleanupAssessments().then(() => {
  console.log('🎉 Assessment cleanup finished successfully!');
  process.exit(0);
});