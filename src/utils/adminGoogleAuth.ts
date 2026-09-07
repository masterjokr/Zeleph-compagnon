import { ClubMemberProfile } from '../types';
import { INITIAL_CURRENT_USER } from '../data/membersData';

/**
 * Designated Super-Administrator Google Account
 * ONLY this email address is authorized to hold Super-Administrator privileges.
 */
export const SUPER_ADMIN_GOOGLE_EMAIL = 'roux.jonath@gmail.com';

export const ZELEPH_SUPERADMIN_SESSION_KEY = 'zeleph_superadmin_google_session';
export const ZELEPH_GOOGLE_CLIENT_ID_KEY = 'zeleph_google_client_id';
export const ZELEPH_ADMIN_PASSPHRASE_KEY = 'zeleph_admin_passcode';

// Default master fallback security code for emergency admin login (Jonathan Roux)
export const DEFAULT_ADMIN_PASSPHRASE = 'ZELEPH-73-ADMIN';

export interface SuperAdminSession {
  email: string;
  isVerified: boolean;
  timestamp: number;
  method: 'google_gis' | 'google_oauth' | 'master_passcode';
}

/**
 * Validates if an email strictly matches Jonathan's authorized account
 */
export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === SUPER_ADMIN_GOOGLE_EMAIL.toLowerCase();
}

/**
 * Safely decodes a Google JWT Token (ID token) from Google Identity Services
 */
export function decodeGoogleJwt(token: string): { email?: string; name?: string; picture?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Error decoding Google JWT:', err);
    return null;
  }
}

/**
 * Reads the configured Google Client ID
 */
export function getStoredGoogleClientId(): string {
  try {
    return (
      (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
      localStorage.getItem(ZELEPH_GOOGLE_CLIENT_ID_KEY) ||
      ''
    );
  } catch {
    return '';
  }
}

export function saveStoredGoogleClientId(clientId: string): void {
  try {
    localStorage.setItem(ZELEPH_GOOGLE_CLIENT_ID_KEY, clientId.trim());
  } catch (e) {
    console.error(e);
  }
}

/**
 * Verifies active Super-Admin session in storage
 */
export function getStoredSuperAdminSession(): SuperAdminSession | null {
  try {
    const raw = localStorage.getItem(ZELEPH_SUPERADMIN_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && isSuperAdminEmail(parsed.email) && parsed.isVerified) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Saves verified Super-Admin session
 */
export function saveSuperAdminSession(
  email: string,
  method: 'google_gis' | 'google_oauth' | 'master_passcode'
): void {
  try {
    const session: SuperAdminSession = {
      email: email.trim().toLowerCase(),
      isVerified: true,
      timestamp: Date.now(),
      method,
    };
    localStorage.setItem(ZELEPH_SUPERADMIN_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Clears Super-Admin session
 */
export function clearSuperAdminSession(): void {
  try {
    localStorage.removeItem(ZELEPH_SUPERADMIN_SESSION_KEY);
  } catch (e) {
    console.error(e);
  }
}

/**
 * Verifies the emergency master code for Jonathan Roux
 */
export function verifyMasterPasscode(inputCode: string): boolean {
  if (!inputCode) return false;
  const clean = inputCode.trim();
  const storedCode = localStorage.getItem(ZELEPH_ADMIN_PASSPHRASE_KEY);
  if (storedCode && clean === storedCode.trim()) {
    return true;
  }
  return clean === DEFAULT_ADMIN_PASSPHRASE;
}

/**
 * Creates or restores Jonathan Roux's authentic Super-Admin profile,
 * preserving any custom edits made to photo, wing, bio, phone, or live tracking.
 */
export function createJonathanSuperAdminProfile(googleEmail: string = SUPER_ADMIN_GOOGLE_EMAIL): ClubMemberProfile {
  try {
    const rawStored = localStorage.getItem('zeleph_active_user_v2') || localStorage.getItem('zeleph_member_profile_v1');
    if (rawStored) {
      const parsed = JSON.parse(rawStored);
      if (parsed && (isSuperAdminEmail(parsed.email || parsed.googleEmail) || parsed.id === 'usr-zeleph-me')) {
        return {
          ...parsed,
          id: 'usr-zeleph-me',
          fullName: parsed.fullName || 'Jonathan Roux',
          email: SUPER_ADMIN_GOOGLE_EMAIL,
          googleEmail: googleEmail.toLowerCase(),
          isGoogleVerified: true,
          isGoogleConnected: true,
          isSuperAdmin: true,
          role: parsed.role || 'Super-Administrateur Club • Les Z’éléphants Volants',
        };
      }
    }

    const profilesRaw = localStorage.getItem('zeleph_registered_profiles_v2');
    if (profilesRaw) {
      const all = JSON.parse(profilesRaw);
      const existing = all[googleEmail.toLowerCase()] || all[SUPER_ADMIN_GOOGLE_EMAIL];
      if (existing) {
        return {
          ...existing,
          id: 'usr-zeleph-me',
          fullName: existing.fullName || 'Jonathan Roux',
          email: SUPER_ADMIN_GOOGLE_EMAIL,
          googleEmail: googleEmail.toLowerCase(),
          isGoogleVerified: true,
          isGoogleConnected: true,
          isSuperAdmin: true,
          role: existing.role || 'Super-Administrateur Club • Les Z’éléphants Volants',
        };
      }
    }
  } catch (e) {
    console.error('Error loading stored Jonathan profile', e);
  }

  return {
    ...INITIAL_CURRENT_USER,
    id: 'usr-zeleph-me',
    fullName: 'Jonathan Roux',
    email: SUPER_ADMIN_GOOGLE_EMAIL,
    googleEmail: googleEmail.toLowerCase(),
    isGoogleVerified: true,
    isGoogleConnected: true,
    isSuperAdmin: true,
    role: 'Super-Administrateur Club • Les Z’éléphants Volants',
    liveTrackingPlatform: 'puretrack',
    liveTrackingId: 'Jonathan-Roux-73',
    shareLiveTracking: true,
  };
}
