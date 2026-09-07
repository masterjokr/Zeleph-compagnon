import { ClubMemberProfile } from '../types';
import { SUPER_ADMIN_GOOGLE_EMAIL, isSuperAdminEmail } from './adminGoogleAuth';

export const MINIMUM_ZELEPH_ROLE = "Pilote Club Zéléph";

/**
 * Checks if a user is logged in with a Google account or holds Super-Admin privileges.
 * Active members can create/participate in outings, navettes, rando-vol, and edit site details.
 * Visitors have read-only access.
 */
export function isZelephMember(user: ClubMemberProfile | null | undefined): boolean {
  if (!user) return false;
  
  // Super-Administrators have full rights
  if (user.isSuperAdmin || isSuperAdminEmail(user.googleEmail || user.email)) return true;

  // Connected via Google account
  if (user.isGoogleConnected || user.googleEmail || user.isGoogleVerified) {
    return true;
  }

  // Explicit role or legacy membership
  const role = (user.role || user.discordRole || '').toLowerCase().trim();
  if (role.includes('visiteur') || role.includes('invité') || role.includes('lecture seule')) {
    return false;
  }

  return Boolean(user.email || user.fullName);
}

export function getMemberStatusDetails(user: ClubMemberProfile | null | undefined) {
  if (!user) {
    return {
      isMember: false,
      badgeLabel: 'Visiteur (Lecture seule)',
      badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
      description: 'Mode consultation libre. Connectez-vous avec votre compte Google pour participer et proposer des sorties.'
    };
  }

  if (user.isSuperAdmin || isSuperAdminEmail(user.googleEmail || user.email)) {
    return {
      isMember: true,
      badgeLabel: 'Super-Admin Club',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: `Administrateur en chef (${SUPER_ADMIN_GOOGLE_EMAIL}) : tous droits accordés.`
    };
  }

  const isMember = isZelephMember(user);
  if (isMember) {
    return {
      isMember: true,
      badgeLabel: user.role || 'Pilote Club Zéléph',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Compte Google connecté : participation aux navettes, sorties club et LiveTracking activée.'
    };
  }

  return {
    isMember: false,
    badgeLabel: 'Visiteur (Lecture seule)',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    description: 'Mode consultation libre. Connectez-vous avec votre compte Google pour publier.'
  };
}

