// Facility helpers derived from the master directory
// Consolidates older "real facility" helpers onto the shared facilityDirectory source

import {
  facilityDirectory,
  transformForCommitmentPanel as baseTransformForCommitmentPanel,
  transformForFacilityFinder
} from './facilityDirectory.js';

const withDefault = (value, fallback) => (value === undefined || value === null ? fallback : value);

const getAvailability = (facility) => facility?.operationalData?.availability || 'Call to verify';
const getVerified = (facility) => facility?.operationalData?.verified || '';
const getCapability = (facility, key) => withDefault(facility?.capabilities?.[key], false);

export const realFacilities = facilityDirectory;

export const get302CapableFacilities = () =>
  realFacilities.filter((facility) => getCapability(facility, 'takes302'));

export const getSecureBHFacilities = () =>
  realFacilities.filter((facility) => getCapability(facility, 'secureBh'));

export const getAcceptingFacilities = () =>
  realFacilities.filter((facility) => getAvailability(facility) === 'Accepting');

export const getFacilitiesWithDualDiagnosis = () =>
  realFacilities.filter((facility) => facility?.tags?.includes('Dual Diagnosis'));

export const transformForCommitmentPanel = (facility) => {
  const transformed = baseTransformForCommitmentPanel(facility);
  return {
    ...transformed,
    verified: getVerified(facility)
  };
};

export const getMatchingFacilities = (filters = {}) => {
  const filtered = realFacilities.filter((facility) => {
    if (filters.takes302 && !getCapability(facility, 'takes302')) return false;
    if (filters.secureBh && !getCapability(facility, 'secureBh')) return false;
    if (filters.acuteMed && !getCapability(facility, 'acuteMed')) return false;

    if (filters.availability && getAvailability(facility) !== filters.availability) {
      return false;
    }

    return true;
  });

  return filtered.map(transformForCommitmentPanel);
};

export const getFinderFacilities = () => realFacilities.map(transformForFacilityFinder);

export default realFacilities;
