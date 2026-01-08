/**
 * 🧪 Pennsylvania Commitment Rules - Unit Tests
 * Tests for PA mental health commitment type validation and filtering
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { FacilityFinder } from '../../src/features/facilityFinder.js';

describe('🏥 PA Commitment Rules Validation', () => {
  let facilityFinder;
  let mockFacilities;

  beforeEach(() => {
    facilityFinder = new FacilityFinder();
    
    // Mock facilities with different commitment type support
    mockFacilities = [
      {
        id: 'mh-facility-1',
        name: 'Mental Health Center A', 
        type: 'mental-health',
        acceptsCommitmentTypes: ['201', '302', '303'],
        capacity: 50,
        availableBeds: 10
      },
      {
        id: 'mh-facility-2',
        name: 'Mental Health Center B',
        type: 'mental-health', 
        acceptsCommitmentTypes: ['201', '302'], // No extended commitment
        capacity: 30,
        availableBeds: 5
      },
      {
        id: 'sud-facility-1',
        name: 'SUD Treatment Center A',
        type: 'substance-use',
        acceptsCommitmentTypes: [], // SUD uses different pathways
        capacity: 25,
        availableBeds: 8
      },
      {
        id: 'dual-facility-1',
        name: 'Dual Diagnosis Center A',
        type: 'dual-diagnosis',
        acceptsCommitmentTypes: ['201', '302', '303'],
        primaryFocus: 'mental-health',
        capacity: 40,
        availableBeds: 12
      }
    ];
  });

  describe('201 Commitment (Voluntary) Rules', () => {
    it('should allow mental health facilities for 201 commitment', () => {
      const filtered = facilityFinder.filterByCommitmentType(mockFacilities, '201');
      
      const mentalHealthFacilities = filtered.filter(f => 
        f.type === 'mental-health' || 
        (f.type === 'dual-diagnosis' && f.primaryFocus === 'mental-health')
      );
      
      expect(mentalHealthFacilities.length).toBeGreaterThan(0);
      expect(mentalHealthFacilities.every(f => 
        f.acceptsCommitmentTypes.includes('201')
      )).toBe(true);
    });

    it('should exclude SUD-only facilities for 201 commitment', () => {
      const filtered = facilityFinder.filterByCommitmentType(mockFacilities, '201');
      
      const sudOnlyFacilities = filtered.filter(f => f.type === 'substance-use');
      
      expect(sudOnlyFacilities.length).toBe(0);
    });

    it('should include dual diagnosis with mental health focus', () => {
      const filtered = facilityFinder.filterByCommitmentType(mockFacilities, '201');
      
      const dualDiagnosisFacilities = filtered.filter(f => 
        f.type === 'dual-diagnosis' && f.primaryFocus === 'mental-health'
      );
      
      expect(dualDiagnosisFacilities.length).toBeGreaterThan(0);
    });
  });

  describe('302 Commitment (Emergency) Rules', () => {
    it('should prioritize facilities with emergency capability', () => {
      const filtered = facilityFinder.filterByCommitmentType(mockFacilities, '302');
      
      // All filtered facilities should accept 302 commitments
      expect(filtered.every(f => f.acceptsCommitmentTypes.includes('302'))).toBe(true);
    });

    it('should exclude SUD facilities for emergency commitment', () => {
      const filtered = facilityFinder.filterByCommitmentType(mockFacilities, '302');
      
      const sudFacilities = filtered.filter(f => f.type === 'substance-use');
      
      expect(sudFacilities.length).toBe(0);
    });

    it('should include dual diagnosis with MH primary for emergency', () => {
      const filtered = facilityFinder.filterByCommitmentType(mockFacilities, '302');
      
      const dualFacilities = filtered.filter(f => 
        f.type === 'dual-diagnosis' && 
        f.acceptsCommitmentTypes.includes('302')
      );
      
      expect(dualFacilities.length).toBeGreaterThan(0);
    });
  });

  describe('303 Commitment (Extended Involuntary) Rules', () => {
    it('should only include facilities with court-ordered capability', () => {
      const filtered = facilityFinder.filterByCommitmentType(mockFacilities, '303');
      
      expect(filtered.every(f => f.acceptsCommitmentTypes.includes('303'))).toBe(true);
    });

    it('should exclude facilities without extended commitment support', () => {
      const filtered = facilityFinder.filterByCommitmentType(mockFacilities, '303');
      
      // Should not include mh-facility-2 (no 303 support)
      const facilityWithout303 = filtered.find(f => f.id === 'mh-facility-2');
      expect(facilityWithout303).toBeUndefined();
    });

    it('should exclude SUD facilities for extended commitment', () => {
      const filtered = facilityFinder.filterByCommitmentType(mockFacilities, '303');
      
      const sudFacilities = filtered.filter(f => f.type === 'substance-use');
      
      expect(sudFacilities.length).toBe(0);
    });
  });

  describe('SUD-Specific Program Handling', () => {
    it('should handle SUD programs with alternative pathways', () => {
      const sudFacilities = facilityFinder.filterByProgramType(mockFacilities, 'substance-use');
      
      expect(sudFacilities.length).toBeGreaterThan(0);
      expect(sudFacilities.every(f => f.type === 'substance-use')).toBe(true);
    });

    it('should not apply commitment type filtering to SUD programs', () => {
      const sudProgram = mockFacilities.find(f => f.type === 'substance-use');
      
      // SUD facilities should not accept traditional commitment types
      expect(sudProgram.acceptsCommitmentTypes.length).toBe(0);
    });
  });

  describe('Capacity and Availability Filtering', () => {
    it('should only return facilities with available beds', () => {
      const filtered = facilityFinder.filterByAvailability(mockFacilities);
      
      expect(filtered.every(f => f.availableBeds > 0)).toBe(true);
    });

    it('should sort by availability when multiple options exist', () => {
      const sorted = facilityFinder.sortByAvailability(mockFacilities);
      
      // Should be sorted by availableBeds descending
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].availableBeds).toBeGreaterThanOrEqual(sorted[i + 1].availableBeds);
      }
    });
  });

  describe('Comprehensive PA Workflow Integration', () => {
    it('should handle complete 302 emergency commitment workflow', () => {
      const emergencyCase = {
        commitmentType: '302',
        needsEmergencyPlacement: true,
        programType: 'mental-health'
      };
      
      const results = facilityFinder.findSuitableFacilities(mockFacilities, emergencyCase);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(f => 
        f.acceptsCommitmentTypes.includes('302') && 
        f.availableBeds > 0 &&
        (f.type === 'mental-health' || f.primaryFocus === 'mental-health')
      )).toBe(true);
    });

    it('should validate PA commitment rules are properly enforced', () => {
      const testCases = [
        { commitmentType: '201', shouldExcludeSUD: true },
        { commitmentType: '302', shouldExcludeSUD: true },
        { commitmentType: '303', shouldExcludeSUD: true }
      ];
      
      testCases.forEach(testCase => {
        const filtered = facilityFinder.filterByCommitmentType(
          mockFacilities, 
          testCase.commitmentType
        );
        
        if (testCase.shouldExcludeSUD) {
          expect(filtered.filter(f => f.type === 'substance-use').length).toBe(0);
        }
      });
    });
  });
});