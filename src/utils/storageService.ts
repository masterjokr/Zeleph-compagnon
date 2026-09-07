import { ClubMemberProfile, ParaglidingSite, AppTheme } from '../types';
import { CLUB_DIRECTORY, INITIAL_CURRENT_USER } from '../data/membersData';
import { ZELEPH_SITES } from '../data/sitesData';
import { SUPER_ADMIN_GOOGLE_EMAIL, isSuperAdminEmail } from './adminGoogleAuth';

const PROFILES_STORE_KEY = 'zeleph_registered_profiles_v2';
const DIRECTORY_STORE_KEY = 'zeleph_club_directory_v2';
const ACTIVE_USER_KEY = 'zeleph_active_user_v2';
const GMAPS_KEY_STORAGE = 'zeleph_gmaps_api_key';
export const SITES_OVERRIDES_KEY = 'zeleph_sites_overrides_v1';
const THEME_STORE_KEY = 'zeleph_app_theme_v1';

/**
 * Normalizes email strings for consistent lookup keys
 */
export function normalizeEmail(email?: string | null): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

/**
 * Retrieves all registered/customized profiles from persistent browser storage
 */
export function getAllSavedProfiles(): Record<string, ClubMemberProfile> {
  try {
    const raw = localStorage.getItem(PROFILES_STORE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read profiles from storage', e);
    return {};
  }
}

/**
 * Retrieves an existing saved profile for a given email
 */
export function getSavedProfileByEmail(email: string): ClubMemberProfile | null {
  const norm = normalizeEmail(email);
  if (!norm) return null;

  const profiles = getAllSavedProfiles();
  if (profiles[norm]) {
    return profiles[norm];
  }

  // Check directory
  const directory = getStoredClubDirectory();
  const found = directory.find(
    p => normalizeEmail(p.googleEmail) === norm || normalizeEmail(p.email) === norm
  );
  if (found) return found;

  // If this is Jonathan Roux's super-admin email and never saved before
  if (isSuperAdminEmail(norm)) {
    const defaultJonathan: ClubMemberProfile = {
      ...INITIAL_CURRENT_USER,
      id: 'usr-zeleph-me',
      fullName: 'Jonathan Roux',
      email: SUPER_ADMIN_GOOGLE_EMAIL,
      googleEmail: SUPER_ADMIN_GOOGLE_EMAIL,
      isGoogleVerified: true,
      isGoogleConnected: true,
      isSuperAdmin: true,
      role: 'Super-Administrateur Club • Les Z’éléphants Volants',
      liveTrackingPlatform: 'puretrack',
      liveTrackingId: 'Jonathan-Roux-73',
      shareLiveTracking: true,
    };
    savePilotProfile(defaultJonathan);
    return defaultJonathan;
  }

  return null;
}

/**
 * Saves a pilot profile persistently in browser storage & syncs to directory
 */
export function savePilotProfile(profile: ClubMemberProfile): void {
  try {
    const norm = normalizeEmail(profile.googleEmail || profile.email);
    if (!norm) return;

    // Ensure super admin flag for Jonathan
    if (isSuperAdminEmail(norm)) {
      profile.isSuperAdmin = true;
    }

    // 1. Update profiles dictionary
    const profiles = getAllSavedProfiles();
    profiles[norm] = profile;
    localStorage.setItem(PROFILES_STORE_KEY, JSON.stringify(profiles));

    // 2. Set active user in storage
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(profile));

    // 3. Update club directory
    const directory = getStoredClubDirectory();
    const existingIndex = directory.findIndex(
      p => normalizeEmail(p.googleEmail) === norm || normalizeEmail(p.email) === norm || p.id === profile.id
    );

    let updatedDirectory: ClubMemberProfile[];
    if (existingIndex >= 0) {
      updatedDirectory = directory.map((item, idx) => (idx === existingIndex ? profile : item));
    } else {
      updatedDirectory = [profile, ...directory];
    }
    localStorage.setItem(DIRECTORY_STORE_KEY, JSON.stringify(updatedDirectory));
  } catch (e) {
    console.error('Failed to save pilot profile persistently', e);
  }
}

/**
 * Gets the current active user from storage
 */
export function getStoredActiveUser(): ClubMemberProfile | null {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (!raw) return null;
    const parsed: ClubMemberProfile = JSON.parse(raw);
    if (isSuperAdminEmail(parsed.googleEmail || parsed.email)) {
      parsed.isSuperAdmin = true;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Explicitly saves the active user in storage
 */
export function saveStoredActiveUser(profile: ClubMemberProfile): void {
  try {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Clears active user session (logout)
 */
export function clearStoredActiveUser(): void {
  try {
    localStorage.removeItem(ACTIVE_USER_KEY);
  } catch (e) {
    console.error(e);
  }
}

const USER_GPS_KEY = 'zeleph_user_gps_v1';

/**
 * Retrieves the persisted club directory, seeded with initial members
 */
export function getStoredClubDirectory(): ClubMemberProfile[] {
  try {
    const raw = localStorage.getItem(DIRECTORY_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Ensure example flag is preserved on demo accounts
        const exampleIds = new Set(['usr-julien', 'usr-sophie', 'usr-romain', 'usr-claire']);
        return parsed.map((m: ClubMemberProfile) => {
          if (exampleIds.has(m.id)) {
            return { ...m, isExample: true };
          }
          return m;
        });
      }
    }
  } catch (e) {
    console.error('Failed to read club directory from storage', e);
  }

  // Seed default directory with initial members
  const seeded = [...CLUB_DIRECTORY];
  try {
    localStorage.setItem(DIRECTORY_STORE_KEY, JSON.stringify(seeded));
  } catch {}
  return seeded;
}

/**
 * Persists the entire club directory
 */
export function saveClubDirectory(directory: ClubMemberProfile[]): void {
  try {
    localStorage.setItem(DIRECTORY_STORE_KEY, JSON.stringify(directory));
  } catch (e) {
    console.error('Failed to save club directory', e);
  }
}

/**
 * Deletes a single member from the directory by ID
 */
export function deleteClubMember(memberId: string): ClubMemberProfile[] {
  const current = getStoredClubDirectory();
  const updated = current.filter(m => m.id !== memberId);
  saveClubDirectory(updated);
  return updated;
}

/**
 * Deletes all example/demonstration members from the directory
 */
export function deleteAllExampleMembers(): ClubMemberProfile[] {
  const current = getStoredClubDirectory();
  const exampleIds = new Set(['usr-julien', 'usr-sophie', 'usr-romain', 'usr-claire']);
  const updated = current.filter(m => !m.isExample && !exampleIds.has(m.id));
  saveClubDirectory(updated);
  return updated;
}

/**
 * Saves the pilot's custom/real GPS location
 */
export function saveUserGpsLocation(coords: { lat: number; lng: number; altitude?: number }): void {
  try {
    localStorage.setItem(USER_GPS_KEY, JSON.stringify(coords));
  } catch (e) {
    console.error('Failed to save user GPS location', e);
  }
}

/**
 * Retrieves the pilot's saved GPS location
 */
export function getUserGpsLocation(): { lat: number; lng: number; altitude?: number } | null {
  try {
    const raw = localStorage.getItem(USER_GPS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

/**
 * Reads configured Google Maps API Key
 */
export function getGoogleMapsApiKey(): string {
  try {
    const fromEnv = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;
    if (fromEnv && fromEnv.trim()) return fromEnv.trim();

    const fromStorage = localStorage.getItem(GMAPS_KEY_STORAGE);
    if (fromStorage && fromStorage.trim()) return fromStorage.trim();
  } catch {}
  return '';
}

/**
  * Saves Google Maps API Key in browser storage
  */
 export function saveGoogleMapsApiKey(key: string): void {
   try {
     localStorage.setItem(GMAPS_KEY_STORAGE, key.trim());
   } catch (e) {
     console.error(e);
   }
 }

/**
  * Retrieves all paragliding sites merged with user/admin customized coordinates & data
  */
export function getStoredParaglidingSites(): ParaglidingSite[] {
  try {
    const raw = localStorage.getItem(SITES_OVERRIDES_KEY);
    const overrides: Record<string, ParaglidingSite> = raw ? JSON.parse(raw) : {};
    return ZELEPH_SITES.map(s => {
      if (overrides[s.id]) {
        return { ...s, ...overrides[s.id] };
      }
      return s;
    });
  } catch (e) {
    console.error('Failed to get stored paragliding sites', e);
    return ZELEPH_SITES;
  }
}

/**
  * Retrieves raw site overrides map
  */
export function getSiteOverridesMap(): Record<string, ParaglidingSite> {
  try {
    const raw = localStorage.getItem(SITES_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
  * Saves an updated site override and notifies active map instances
  */
export function saveSiteOverride(updatedSite: ParaglidingSite): void {
  try {
    const overrides = getSiteOverridesMap();
    overrides[updatedSite.id] = updatedSite;
    localStorage.setItem(SITES_OVERRIDES_KEY, JSON.stringify(overrides));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('zeleph_sites_updated', { detail: updatedSite }));
    }
  } catch (e) {
    console.error('Failed to save site override', e);
  }
}

/**
  * Resets a site to club default coordinates and notifies active maps
  */
export function resetSiteOverride(siteId: string): void {
  try {
    const overrides = getSiteOverridesMap();
    delete overrides[siteId];
    localStorage.setItem(SITES_OVERRIDES_KEY, JSON.stringify(overrides));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('zeleph_sites_updated', { detail: { id: siteId } }));
    }
  } catch (e) {
    console.error('Failed to reset site override', e);
  }
}

/**
 * Retrieves preferred app theme ('dark' | 'light'). Defaults to 'dark'.
 */
export function getStoredTheme(): AppTheme {
  try {
    const raw = localStorage.getItem(THEME_STORE_KEY);
    if (raw === 'light' || raw === 'dark') return raw;
    return 'dark';
  } catch {
    return 'dark';
  }
}

/**
 * Persists chosen theme ('dark' | 'light') and notifies listeners
 */
export function saveStoredTheme(theme: AppTheme): void {
  try {
    localStorage.setItem(THEME_STORE_KEY, theme);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('zeleph_theme_changed', { detail: theme }));
    }
  } catch (e) {
    console.error('Failed to save theme', e);
  }
}
