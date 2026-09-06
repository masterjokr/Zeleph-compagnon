import React, { useState, useEffect } from 'react';
import { ClubMemberProfile, PilotLevel } from '../types';
import { INITIAL_CURRENT_USER, CLUB_DIRECTORY } from '../data/membersData';
import { 
  Users, 
  UserCheck, 
  Edit3, 
  Phone, 
  Mail, 
  MapPin, 
  Car, 
  Shield, 
  Radio, 
  Sparkles, 
  Check, 
  X, 
  Search, 
  ExternalLink,
  MessageSquare,
  Compass,
  AlertCircle,
  Copy,
  CheckCheck,
  Key,
  LogIn,
  Link,
  Globe,
  ArrowUpRight,
  ShieldCheck,
  Trash2,
  UserPlus
} from 'lucide-react';

const STORAGE_PROFILE_KEY = 'zeleph_member_profile_v1';
const STORAGE_DIRECTORY_KEY = 'zeleph_club_directory_v1';
const STORAGE_DISCORD_CLIENT_ID = 'zeleph_discord_client_id_v1';
const STORAGE_DISCORD_INVITE_KEY = 'zeleph_discord_invite_v1';

// Real official Discord server of Les Z’éléphants Volants
export const REAL_DISCORD_INVITE_URL = 'https://discord.com/invite/6zh2vWqyZA';
export const DISCORD_GUILD_ID = '933405606113591347';
export const DISCORD_GUILD_NAME = "Les Z’éléphants Volants";
export const DISCORD_GUILD_ICON = 'https://cdn.discordapp.com/icons/933405606113591347/c442ba0cb53b865010fc9f9332a01696.png';
const DEFAULT_DISCORD_INVITE_URL = REAL_DISCORD_INVITE_URL;

export interface LiveDiscordMember {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string | null;
  avatar_url: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  game?: { name: string };
}

// Live members snapshot from the official server 933405606113591347
export const FALLBACK_DISCORD_MEMBERS: LiveDiscordMember[] = [
  {
    id: "20",
    username: "Jonathan ROUX",
    discriminator: "0000",
    status: "online",
    avatar_url: "https://cdn.discordapp.com/widget-avatars/FP_cKS1IUcmsjsm9MZ1mMtgnfJEyRem7nrL7H3My3u4/tG9d3yKW1ul9bgapq3u9cxGc_L9JgTRYmuWd9epEF_3Ng89HusKuQaXZNPJfI5wkr2-EiiC73q1-hJW7L52J6g9yDbcxnVSkbUOtADH1D27bKxzFZBj8saGWb6ms9O53JYeHjp9LZk0fZw"
  },
  {
    id: "36",
    username: "Thomas Popoff (Comité - Discord)",
    discriminator: "0000",
    status: "idle",
    avatar_url: "https://cdn.discordapp.com/widget-avatars/q-J4zbFc9uf49keRQBA--XPn8CwE4oE34pYUFTWykzI/5q20k8SoPTlajL37-Cu7XmuLkmFZbBnUiY-qMptQei21Q66t1zCALokXLr5hkttSdln9HrIDJfKLeyjmIhjHyXZY9OuBDryDPWkLixucywOL3p8iaLHn_ArBqQBG8tdi9MxdRH-gFGNWNQ"
  },
  {
    id: "30",
    username: "Raph Merlin (secrétaire adj)",
    discriminator: "0000",
    status: "online",
    avatar_url: "https://cdn.discordapp.com/widget-avatars/dlEw54STcnY9HA4fqs38JhInFfkRjr_9B6gg6kVOZG8/nN7x36XTwSoPY5VlHfjCKKEwaTNFwjIshbCrHbwx5iiXAkgHbeLT3mqlwPKkKw-qJycYM2cNjzaCu8Aom1fIkbqBtMCkk66wvEC6Z80N_7Co9vJAPrq71krNHeFXF-zbeCfDXgGN375ZpQ"
  },
  {
    id: "31",
    username: "Seb. Bordier",
    discriminator: "0000",
    status: "online",
    avatar_url: "https://cdn.discordapp.com/widget-avatars/JslcVnyjlzedtBAdTDSodxEY65CSjy-aB7bd4HzWYfI/Ak1Xl1M2YYydILv5fpSM-i9_WVmWjRdSNDRVjkK2jvdFu_KHj5e_KJi0Q9Y3sDb4jRBmKjRGQwXLw3D95heRmKZcaK6xUCxnArvFN5QL8VE8I44hzpGlVKRcBsYzqpU_ose7V6GAeG7PvCY"
  },
  {
    id: "22",
    username: "Léa Michaud",
    discriminator: "0000",
    status: "idle",
    avatar_url: "https://cdn.discordapp.com/widget-avatars/wjgceAwlbl3ZnYUpEg8vSp4wG6CwAlBMcH7gMpFW5YA/HrpIOuMoe685hcOziIfLkQNUqmLv9SuyDLRswHoydNxSc4abVE494ds0VzDjz427Z6fpHWxS53-Jcw8qJ3L4NBTQPexlA7a7DjuB-x_P3WhgxvNZ2ppxbmLmphSmXGOki7JclHA2WPhKgA"
  },
  {
    id: "21",
    username: "Laurent Fischer",
    discriminator: "0000",
    status: "idle",
    avatar_url: "https://cdn.discordapp.com/widget-avatars/8ux9_srRCvESc4VuN-LuEIgzOpG4B1b1rB6YPUtY4qU/95kussCcz2a0PKTVgQfbXuAlJu80Htb14rGuVYR1v-Yz29NaIF4YMhZdLOzqyc9rdqS-6I-YHF9lMP0QXk8-KAs4-PNdiDsLpS3sgElinbvo7oFzBSduS4Xnn_DDHXSZ2Vd-xIxYREMuEeo"
  },
  {
    id: "26",
    username: "Olivier Jaumes",
    discriminator: "0000",
    status: "idle",
    avatar_url: "https://cdn.discordapp.com/widget-avatars/UU-iDQ1PQeGPH9MEnwu-1NjndTw67_y0SX5hxki1wcU/0Q9PcwMapRzKWrqnLA-7sU592qKopoVKFzlUGMGFuIYBVJqWCEvnuon34U_RchvFffve52Vot-8_cW61fenw9KJAv3oEZg-GrbmiKZgMi_rCom1SK0QJse0xYQoobmKh7cydE26LqjPvM8c"
  },
  {
    id: "28",
    username: "Patrick Villeneuve",
    discriminator: "0000",
    status: "online",
    avatar_url: "https://cdn.discordapp.com/widget-avatars/98gk_oP71NTJq3VzZp2G1tWLS416fKYhoPkvxoykXSQ/nAD8RO3wvLyVRzAiDOJINwYn8QJXWVmRT8RKwa4uOlKWIpmrDzVp2HHT8MMhrMtBjeML6W_yBLu3XUCawZEd_wEGdzPGDUF7u-TKc7A6cVvH6qXtbOOh_to700rcFuSHn0LnnjASpUIlSw"
  },
  {
    id: "29",
    username: "Quentin L.",
    discriminator: "0000",
    status: "online",
    avatar_url: "https://cdn.discordapp.com/widget-avatars/L7z61c06xA6FowQILYxxCE1Cq-yfCQrA4m84eXrZaIQ/1N-phnWNbDVxGrXoYjRJ0JGrKtfHj9O2Zl4YNpqRch665UjvorIk2SOChvnr-f2XvAdXUIa7SixJfNjEUp1p8M96HJABEgpowpckoNzAY0UgDmYEF6bt6VncEF3sF5QP3TyNHeOy5sELcw"
  },
  {
    id: "24",
    username: "Maxime P.",
    discriminator: "0000",
    status: "online",
    avatar_url: "https://cdn.discordapp.com/widget-avatars/3kzblT-chpHhLni6BcZOZBoo6rsWh0s2DhagNFkMirU/dZA0G9qKeSvAPhqKlzcye_Vrl_Lfu1MdA1fMi_X2Z9Pk7OlBK3UOrZcnkfy9P5KLpOHodYXQNp2ZSTmjy8MQBpBFgiLeC46clBgKCWV4DnoM_yNYu0UURE2vix-rjcGU3GdixXqL7P06tw"
  },
  {
    id: "37",
    username: "Théo JAQUET",
    discriminator: "0000",
    status: "idle",
    avatar_url: "https://cdn.discordapp.com/widget-avatars/iJXyrBwCqUkKnS-vUsP0Ak-8r_bY_AoVB2dF0fc6Fzw/aQaAZGQ5naLTlcQvSPRvCO4E5KLPNfGmFEvDOa5WKPdlSaED-TZjsC-JbHu1pQOGp7t3F07ZPb4XkfykR6M94FU2fLMQSFblvq6V03rsyxcbgWMdTiynz0NibrBGt33zEJXJAtVw7wtDCyo"
  },
  {
    id: "40",
    username: "Z'éléph' Bot",
    discriminator: "0000",
    status: "online",
    avatar_url: "https://cdn.discordapp.com/widget-avatars/3VFIzx7ouomxYwe1-szCIN0vij-IIGf6qnrA9V2PFAU/JolWwfFNIxY9CXHsu1ttFfPSZmwdAGF_Q6Eyxm9hDL-zFnsZUL8DDc1dIUJ9hjgeWqXQmIEbU0QTW4pFOBcDN9WXxU-fEa-lUUqPn7FNmcMYKYRLwJOWB6NYcCgulSDTHb50kl5oNsXwEQ"
  }
];

export const DEV_CALLBACK_URL = 'https://ais-dev-ucrx4pzhdmx74iblko65vw-880235871105.europe-west2.run.app/auth/callback';
export const PROD_CALLBACK_URL = 'https://ais-pre-ucrx4pzhdmx74iblko65vw-880235871105.europe-west2.run.app/auth/callback';

interface MembersSpaceProps {
  onNavigateToShuttles?: () => void;
  onNavigateToOutings?: () => void;
}

export const MembersSpace: React.FC<MembersSpaceProps> = ({ 
  onNavigateToShuttles,
  onNavigateToOutings
}) => {
  // Current user state (Jonathan ROUX is guaranteed super-admin)
  const [currentUser, setCurrentUser] = useState<ClubMemberProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.id === 'usr-zeleph-me' ||
          parsed.email?.toLowerCase().includes('roux.jonath') ||
          parsed.fullName?.toLowerCase().includes('jonathan') ||
          parsed.discordUsername?.toLowerCase().includes('jonathan')
        ) {
          parsed.isSuperAdmin = true;
          parsed.discordRole = parsed.discordRole || 'Super-Administrateur Club • Les Z’éléphants Volants';
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CURRENT_USER;
  });

  // Directory state
  const [membersList, setMembersList] = useState<ClubMemberProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DIRECTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return CLUB_DIRECTORY;
  });

  // Super-Admin Add Member Modal state
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberDiscord, setNewMemberDiscord] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Adhérent Club Zéléph');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberLevel, setNewMemberLevel] = useState<PilotLevel>('Brevet de Pilote (Tous sites)');
  const [newMemberWing, setNewMemberWing] = useState('');
  const [newMemberSector, setNewMemberSector] = useState('Chambéry');
  const [newMemberSeats, setNewMemberSeats] = useState(2);
  const [newMemberBio, setNewMemberBio] = useState('');

  // Modals & Discord state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDiscordModal, setShowDiscordModal] = useState(false);
  const [discordModalTab, setDiscordModalTab] = useState<'live' | 'oauth' | 'join' | 'guide'>('live');
  const [liveDiscordMembers, setLiveDiscordMembers] = useState<LiveDiscordMember[]>(FALLBACK_DISCORD_MEMBERS);
  const [discordPresenceCount, setDiscordPresenceCount] = useState<number>(42);
  const [isLoadingLiveDiscord, setIsLoadingLiveDiscord] = useState(false);
  const [discordSearchQuery, setDiscordSearchQuery] = useState('');
  const [discordClientId, setDiscordClientId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_DISCORD_CLIENT_ID) || (import.meta.env.VITE_DISCORD_CLIENT_ID as string) || '';
    } catch {
      return '';
    }
  });
  const [discordInviteUrl, setDiscordInviteUrl] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_DISCORD_INVITE_KEY) || (import.meta.env.VITE_DISCORD_INVITE_URL as string) || DEFAULT_DISCORD_INVITE_URL;
    } catch {
      return DEFAULT_DISCORD_INVITE_URL;
    }
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [oauthFeedback, setOauthFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isEditingInviteUrl, setIsEditingInviteUrl] = useState(false);
  const [tempInviteUrl, setTempInviteUrl] = useState('');
  const [customHandleInput, setCustomHandleInput] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [successMessageText, setSuccessMessageText] = useState<string>('Profil mis à jour avec succès ! Vos coordonnées sont maintenant synchronisées pour les covoiturages et les sorties.');

  // In-app confirmation dialog (replaces window.confirm for iframe reliability)
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    isDanger: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Fetch live Discord widget data from the real server 933405606113591347
  useEffect(() => {
    let isMounted = true;
    const fetchWidget = async () => {
      try {
        setIsLoadingLiveDiscord(true);
        const res = await fetch(`https://discord.com/api/guilds/${DISCORD_GUILD_ID}/widget.json`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data) {
            if (typeof data.presence_count === 'number') {
              setDiscordPresenceCount(data.presence_count);
            }
            if (Array.isArray(data.members) && data.members.length > 0) {
              setLiveDiscordMembers(data.members);
            }
          }
        }
      } catch (e) {
        // Fallback gracefully to FALLBACK_DISCORD_MEMBERS
        console.log('Discord widget note:', e);
      } finally {
        if (isMounted) setIsLoadingLiveDiscord(false);
      }
    };
    fetchWidget();
    return () => { isMounted = false; };
  }, []);

  // Form edit state
  const [formData, setFormData] = useState<ClubMemberProfile>(currentUser);

  // Listen for Discord OAuth success from popup
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'DISCORD_OAUTH_SUCCESS' && event.data?.user) {
        const { user } = event.data;
        const updated: ClubMemberProfile = {
          ...currentUser,
          discordId: user.id,
          discordUsername: user.username,
          discordDiscriminator: user.discriminator,
          discordAvatarUrl: user.avatarUrl || currentUser.discordAvatarUrl,
          fullName: (currentUser.fullName === 'Jonathan Roux' || !currentUser.fullName) && user.globalName
            ? user.globalName
            : (currentUser.fullName || user.globalName || user.username),
          email: user.email || currentUser.email,
          discordRole: user.isZelephMember ? 'Membre Vérifié Serveur Discord Zéléph' : 'Pilote Zéléph (Discord Officiel lié)',
          isDiscordConnected: true
        };
        setCurrentUser(updated);
        setShowDiscordModal(false);
        setSuccessMessageText(`Compte Discord @${user.username} authentifié avec succès ! Votre vrai avatar et votre identifiant ont été synchronisés.`);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 5000);
      }
    };

    window.addEventListener('message', handleOAuthMessage);

    // Fallback: check localStorage for pending auth
    try {
      const pendingStr = localStorage.getItem('zeleph_pending_discord_oauth');
      if (pendingStr) {
        localStorage.removeItem('zeleph_pending_discord_oauth');
        const pending = JSON.parse(pendingStr);
        if (pending?.user) {
          handleOAuthMessage({ data: pending } as MessageEvent);
        }
      }
    } catch {
      // ignore
    }

    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [currentUser]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSaveClientId = (val: string) => {
    setDiscordClientId(val);
    try {
      localStorage.setItem(STORAGE_DISCORD_CLIENT_ID, val);
    } catch {}
  };

  const handleSaveInviteUrl = (val: string) => {
    const clean = val.trim() || DEFAULT_DISCORD_INVITE_URL;
    setDiscordInviteUrl(clean);
    setIsEditingInviteUrl(false);
    try {
      localStorage.setItem(STORAGE_DISCORD_INVITE_KEY, clean);
    } catch {}
  };

  const handleLaunchDiscordOAuth = () => {
    const idToUse = discordClientId.trim();
    if (!idToUse) {
      setDiscordModalTab('oauth');
      setOauthFeedback({
        type: 'error',
        message: 'Veuillez saisir le Client ID Discord de l\'application du club ci-dessous pour lancer la connexion réelle.'
      });
      return;
    }

    const redirectUri = `${window.location.origin}/auth/callback`;
    const scopes = encodeURIComponent('identify email guilds');
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(idToUse)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${scopes}`;

    const popup = window.open(authUrl, 'discord_oauth', 'width=580,height=780');
    if (!popup) {
      setSuccessMessageText('Veuillez autoriser les fenêtres pop-up de votre navigateur pour ouvrir la fenêtre de connexion Discord.');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    }
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(currentUser));
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Update directory when currentUser changes
  useEffect(() => {
    setMembersList(prev => {
      const exists = prev.some(m => m.id === currentUser.id);
      const updated = exists 
        ? prev.map(m => m.id === currentUser.id ? currentUser : m)
        : [currentUser, ...prev];
      try {
        localStorage.setItem(STORAGE_DIRECTORY_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  }, [currentUser]);

  const handleOpenEdit = () => {
    setFormData({ ...currentUser });
    setShowEditModal(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser(formData);
    setShowEditModal(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Super-Admin member actions
  const handleDeleteMember = (memberId: string, memberName: string) => {
    if (!currentUser.isSuperAdmin) {
      setSuccessMessageText("Action réservée au Super-Administrateur.");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return;
    }
    if (memberId === currentUser.id) {
      setSuccessMessageText("Vous ne pouvez pas supprimer votre propre profil Super-Administrateur.");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return;
    }

    setConfirmModal({
      title: `Supprimer "${memberName}" ?`,
      message: `Êtes-vous certain de vouloir retirer définitivement ce membre de l'annuaire du club Zéléph ? Cette action est immédiate.`,
      confirmLabel: "Supprimer le membre",
      isDanger: true,
      onConfirm: () => {
        setMembersList(prev => {
          const updated = prev.filter(m => m.id !== memberId);
          try {
            localStorage.setItem(STORAGE_DIRECTORY_KEY, JSON.stringify(updated));
          } catch (err) {
            console.error(err);
          }
          return updated;
        });
        setSuccessMessageText(`Le membre "${memberName}" a été supprimé de l'annuaire.`);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
        setConfirmModal(null);
      }
    });
  };

  const handlePurgeSampleMembers = () => {
    if (!currentUser.isSuperAdmin) return;
    const sampleIds = ['usr-julien', 'usr-sophie', 'usr-romain', 'usr-claire'];
    const count = membersList.filter(m => sampleIds.includes(m.id)).length;
    if (count === 0) {
      setSuccessMessageText("Tous les membres d'exemple ont déjà été purgés.");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return;
    }

    setConfirmModal({
      title: "Purger les membres de démonstration",
      message: `Confirmez-vous la suppression immédiate des ${count} membres d'exemple (Julien, Sophie, Romain, Claire) ? Seuls votre profil Super-Admin (Jonathan ROUX) et les membres ajoutés manuellement seront conservés.`,
      confirmLabel: `Purger les ${count} membres d'exemple`,
      isDanger: true,
      onConfirm: () => {
        setMembersList(prev => {
          const updated = prev.filter(m => !sampleIds.includes(m.id));
          try {
            localStorage.setItem(STORAGE_DIRECTORY_KEY, JSON.stringify(updated));
          } catch (err) {
            console.error(err);
          }
          return updated;
        });
        setSuccessMessageText("Les membres d'exemple ont été purgés avec succès.");
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
        setConfirmModal(null);
      }
    });
  };

  const handleResetSampleMembers = () => {
    if (!currentUser.isSuperAdmin) return;
    setConfirmModal({
      title: "Rétablir les membres d'exemple",
      message: "Voulez-vous recharger la liste d'exemple initiale de l'annuaire du club ?",
      confirmLabel: "Rétablir les membres",
      isDanger: false,
      onConfirm: () => {
        setMembersList(CLUB_DIRECTORY);
        try {
          localStorage.setItem(STORAGE_DIRECTORY_KEY, JSON.stringify(CLUB_DIRECTORY));
        } catch (err) {
          console.error(err);
        }
        setSuccessMessageText("Les membres d'exemple ont été rétablis.");
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
        setConfirmModal(null);
      }
    });
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newMember: ClubMemberProfile = {
      id: `usr-${Date.now()}`,
      fullName: newMemberName.trim(),
      discordUsername: newMemberDiscord.trim() || newMemberName.trim().replace(/\s+/g, '_'),
      discordRole: newMemberRole.trim() || 'Adhérent Club Zéléph',
      discordAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      phone: newMemberPhone.trim() || 'Non renseigné',
      email: newMemberEmail.trim() || 'membre@zeleph.com',
      pilotLevel: newMemberLevel,
      wingModel: newMemberWing.trim() || 'Non précisée',
      wingColor: 'Non précisée',
      harness: 'Standard',
      sector: newMemberSector.trim() || 'Chambéry',
      vehicleInfo: 'Véhicule standard',
      availableSeats: Number(newMemberSeats) || 1,
      emergencyContactName: 'Contact d\'urgence',
      emergencyContactPhone: '112',
      radioFrequency: '146.500 MHz',
      bio: newMemberBio.trim() || 'Pilote membre des Z\'éléphants Volants.',
      isDiscordConnected: false,
      isSuperAdmin: false,
      joinedClubYear: new Date().getFullYear()
    };

    setMembersList(prev => {
      const updated = [...prev, newMember];
      try {
        localStorage.setItem(STORAGE_DIRECTORY_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });

    setShowAddMemberModal(false);
    setNewMemberName('');
    setNewMemberDiscord('');
    setNewMemberPhone('');
    setNewMemberEmail('');
    setNewMemberWing('');
    setNewMemberBio('');
    setSuccessMessageText(`Nouveau membre "${newMember.fullName}" ajouté avec succès à l'annuaire.`);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleConnectDiscordPreset = (presetUser: Partial<ClubMemberProfile>) => {
    const updated: ClubMemberProfile = {
      ...currentUser,
      ...presetUser,
      isDiscordConnected: true
    };
    setCurrentUser(updated);
    setShowDiscordModal(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleConnectLiveMember = (member: LiveDiscordMember) => {
    const isJonathan = member.username.toLowerCase().includes('jonathan');
    const cleanName = member.username.replace(/\s*\([^)]*\)/g, '').trim();
    const roleName = member.username.includes('(')
      ? member.username.substring(member.username.indexOf('(') + 1).replace(')', '').trim()
      : 'Membre Officiel Discord Les Z’éléphants Volants';

    const updated: ClubMemberProfile = {
      ...currentUser,
      discordId: `933405606113591347-${member.id}`,
      discordUsername: member.username,
      discordDiscriminator: member.discriminator !== '0000' ? member.discriminator : undefined,
      discordAvatarUrl: member.avatar_url,
      fullName: isJonathan ? 'Jonathan Roux' : (cleanName || currentUser.fullName),
      discordRole: roleName,
      isDiscordConnected: true
    };
    setCurrentUser(updated);
    setFormData(updated);
    try {
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(updated));
    } catch {}
    setShowDiscordModal(false);
    setSuccessMessageText(`Connecté avec succès avec le profil officiel @${member.username} du serveur Discord des Z'éléphants Volants !`);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 5000);
  };

  const handleDisconnectDiscord = () => {
    setCurrentUser(prev => ({
      ...prev,
      isDiscordConnected: false
    }));
  };

  // Filter members
  const filteredMembers = membersList.filter(member => {
    const matchesSearch = 
      member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.discordUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.wingModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.sector.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLevel = selectedLevelFilter === 'all' || member.pilotLevel === selectedLevelFilter;

    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5865F2]/15 text-[#7983F5] border border-[#5865F2]/30 text-[10px] font-mono font-bold uppercase tracking-[0.2em]">
              <span className="w-2 h-2 rounded-full bg-[#5865F2] animate-pulse"></span>
              <span>Communauté Zéléph & Discord Club</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
              Espace Membres & <span className="font-bold text-sky-400">Profil Discord</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Synchronisez votre compte Discord du club des Z’éléphants Volants, gérez vos coordonnées de contact pour faciliter les covoiturages et retrouvez l’annuaire des pilotes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentUser.isDiscordConnected ? (
              <button
                onClick={() => setShowDiscordModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-[#7983F5] border border-[#5865F2]/40 text-xs font-bold transition shadow-lg"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span>Discord Connecté (@{currentUser.discordUsername})</span>
              </button>
            ) : (
              <button
                onClick={() => setShowDiscordModal(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold transition shadow-xl shadow-[#5865F2]/25"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>Se connecter avec Discord</span>
              </button>
            )}

            <button
              onClick={handleOpenEdit}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-xl shadow-sky-500/20 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modifier mon profil</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#5865F2]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Discord Quick Server Bar */}
      <div className="bg-gradient-to-r from-[#5865F2]/15 via-slate-900/70 to-sky-950/40 border border-[#5865F2]/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-3.5">
          <img 
            src={DISCORD_GUILD_ICON} 
            alt="Logo officiel Discord Les Z’éléphants Volants"
            className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20 shadow-lg shadow-[#5865F2]/30 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">Serveur Discord : {DISCORD_GUILD_NAME}</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                1 200 membres
              </span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#5865F2]/20 text-sky-300 text-[10px] font-bold border border-[#5865F2]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{discordPresenceCount} pilotes en ligne</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Lien officiel : <code className="text-sky-300 font-mono">discord.com/invite/6zh2vWqyZA</code> • Salons météo, navettes du jour et annonces de vols.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={discordInviteUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold transition shadow-md shadow-[#5865F2]/30"
          >
            <span>Rejoindre le Discord</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => {
              setDiscordModalTab('live');
              setShowDiscordModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/10 transition"
          >
            <LogIn className="w-3.5 h-3.5 text-sky-400" />
            <span>{currentUser.isDiscordConnected ? 'Gérer le profil Discord' : 'Lier mon Discord'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-3 backdrop-blur-md animate-fade-in">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessageText}</span>
        </div>
      )}

      {/* Current User Card */}
      <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <img 
                src={currentUser.discordAvatarUrl} 
                alt={currentUser.fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-sky-400/40 shadow-xl"
                referrerPolicy="no-referrer"
              />
              {currentUser.isDiscordConnected && (
                <div 
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-[#5865F2] text-white shadow-md border-2 border-slate-950" 
                  title="Profil vérifié Discord Club Zéléph"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {currentUser.fullName}
                </h2>
                {currentUser.isDiscordConnected && (
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#5865F2]/20 text-[#7983F5] border border-[#5865F2]/30 flex items-center gap-1.5">
                    <span>@{currentUser.discordUsername}</span>
                    {currentUser.discordDiscriminator && <span className="text-slate-400">#{currentUser.discordDiscriminator}</span>}
                  </span>
                )}
                {currentUser.isSuperAdmin && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500/25 to-yellow-500/20 text-amber-300 font-bold text-xs border border-amber-500/40 shadow-sm shadow-amber-500/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Super-Administrateur Club</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/15 text-sky-300 font-semibold border border-sky-500/30">
                  {currentUser.pilotLevel}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 font-mono text-[11px] border border-emerald-500/30">
                  {currentUser.discordRole}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Membre Zéleph depuis {currentUser.joinedClubYear}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Contact & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenEdit}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-sky-400" />
              <span>Éditer mes coordonnées</span>
            </button>
            {currentUser.isDiscordConnected && (
              <button
                onClick={handleDisconnectDiscord}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/20 transition"
                title="Déconnecter Discord"
              >
                Déconnexion
              </button>
            )}
          </div>
        </div>

        {/* Member Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          {/* Contact Details (crucial for shuttles) */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-sky-400" />
              <span>Contact Covoit’</span>
            </span>
            <div className="font-mono text-sm font-bold text-white">
              {currentUser.phone || 'Non renseigné'}
            </div>
            <div className="text-xs text-slate-400 truncate">
              {currentUser.email}
            </div>
          </div>

          {/* Departure Sector */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Secteur de Départ</span>
            </span>
            <div className="text-sm font-semibold text-white">
              {currentUser.sector || 'Chambéry'}
            </div>
            <div className="text-xs text-slate-400">
              Idéal pour fixer le lieu de RDV navette
            </div>
          </div>

          {/* Vehicle & Seats */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-amber-400" />
              <span>Véhicule & Places</span>
            </span>
            <div className="text-sm font-bold text-amber-300">
              {currentUser.availableSeats} place(s) dispo(s)
            </div>
            <div className="text-xs text-slate-400 truncate">
              {currentUser.vehicleInfo}
            </div>
          </div>

          {/* Wing & Gear */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-purple-400" />
              <span>Matériel en Vol</span>
            </span>
            <div className="text-sm font-bold text-white truncate">
              {currentUser.wingModel}
            </div>
            <div className="text-xs text-slate-400 truncate">
              Couleurs : {currentUser.wingColor}
            </div>
          </div>
        </div>

        {/* Bio / Personal Note */}
        {currentUser.bio && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-950/40 border border-white/5 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider block mb-1">
              À propos de moi
            </span>
            {currentUser.bio}
          </div>
        )}

        {/* Covoit integration banner */}
        <div className="mt-5 p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Car className="w-4 h-4" />
            </div>
            <p className="text-xs text-sky-200">
              Vos coordonnées sont prêtes ! Lorsque vous proposez ou rejoignez un trajet, vos informations (téléphone, véhicule, secteur) sont renseignées en 1 clic.
            </p>
          </div>
          {onNavigateToShuttles && (
            <button
              onClick={onNavigateToShuttles}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold whitespace-nowrap transition"
            >
              Voir les Covoits du jour
            </button>
          )}
        </div>
      </div>

      {/* Super-Admin Management Panel (Jonathan ROUX) */}
      {currentUser.isSuperAdmin && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-sky-950/40 border border-amber-500/30 shadow-2xl space-y-3 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-bold text-white tracking-wide">
                    Panneau Super-Administrateur Club • Jonathan ROUX
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/40">
                    Droits d'administration totaux
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Gérez l'annuaire du club : supprimez les membres de démonstration créés pour l'exemple, ajoutez de vrais pilotes ou purgez les données en 1 clic.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePurgeSampleMembers}
                className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-100 border border-rose-500/40 text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-500/10"
                title="Supprime tous les membres d'exemple créés pour la démo (Julien, Sophie, Romain, Claire)"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Purger les membres d'exemple</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddMemberModal(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-sky-500/20"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Ajouter un membre</span>
              </button>

              <button
                type="button"
                onClick={handleResetSampleMembers}
                className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-medium transition"
                title="Réinitialise l'annuaire de démonstration"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Directory & Trombinoscope Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Annuaire & Trombinoscope des Zéléph
            </h2>
            <p className="text-xs text-slate-400">
              Retrouvez les membres du club, leurs ailes pour les reconnaître en vol et leurs coordonnées covoiturage.
            </p>
          </div>

          {/* Search and filter controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher pilote, voile, secteur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 w-52 sm:w-64"
              />
            </div>

            <select
              value={selectedLevelFilter}
              onChange={(e) => setSelectedLevelFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-400"
            >
              <option value="all">Tous les niveaux</option>
              <option value="Pioupiou / Débutant">Pioupiou / Débutant</option>
              <option value="Brevet Initial (Autonome sur site calme)">Brevet Initial</option>
              <option value="Brevet de Pilote (Tous sites)">Brevet de Pilote</option>
              <option value="Brevet Pilote Confirmé (BPC / Cross)">BPC / Cross</option>
              <option value="Moniteur Fédéral">Moniteur Fédéral</option>
            </select>
          </div>
        </div>

        {/* Members Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div 
              key={member.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                member.id === currentUser.id
                  ? 'bg-slate-900/90 border-sky-400/40 ring-1 ring-sky-400/20 shadow-xl'
                  : 'bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-slate-900/60'
              }`}
            >
              <div>
                {/* Member Header */}
                <div className="flex items-start gap-3.5 mb-3.5">
                  <img 
                    src={member.discordAvatarUrl} 
                    alt={member.fullName}
                    className="w-14 h-14 rounded-2xl object-cover border border-white/10 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-sm font-bold text-white truncate">
                        {member.fullName}
                      </h3>
                      {member.id === currentUser.id && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold">
                          Vous
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#7983F5] font-mono mt-0.5">
                      <svg className="w-3.5 h-3.5 fill-[#5865F2] shrink-0" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                      <span>@{member.discordUsername}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {member.discordRole}
                    </div>
                  </div>
                </div>

                {/* Info List */}
                <div className="space-y-1.5 text-xs text-slate-300 py-2 border-y border-white/5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-sky-400" />
                      <span>Voile :</span>
                    </span>
                    <span className="font-semibold text-white truncate max-w-[170px]" title={member.wingModel}>
                      {member.wingModel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Secteur :</span>
                    </span>
                    <span className="text-slate-200 truncate max-w-[170px]">
                      {member.sector}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-amber-400" />
                      <span>Covoit :</span>
                    </span>
                    <span className="text-amber-300 font-mono text-[11px]">
                      {member.availableSeats} place(s) dispo
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Contact & Admin Controls */}
              <div className="pt-3 mt-3 flex items-center justify-between gap-2 border-t border-white/5">
                <span className="text-[11px] font-mono text-slate-400">
                  {member.phone}
                </span>
                <div className="flex items-center gap-1.5">
                  {currentUser.isSuperAdmin && member.id !== currentUser.id && (
                    <button
                      type="button"
                      onClick={() => handleDeleteMember(member.id, member.fullName)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-[11px] font-bold transition flex items-center gap-1 shadow-sm"
                      title="Supprimer ce membre (Action Super-Admin Jonathan ROUX)"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Supprimer</span>
                    </button>
                  )}
                  <a
                    href={`tel:${member.phone.replace(/\s+/g, '')}`}
                    className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Phone className="w-3 h-3 text-sky-400" />
                    <span>Appeler</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Modifier mes coordonnées & informations
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ces infos facilitent les ramassages navette et l’organisation des vols.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Nom & Prénom
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Numéro de Téléphone (Navettes / SMS)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="06 00 00 00 00"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Email de contact
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Secteur de résidence (lieu de départ covoit)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Chambéry Centre, Barberaz, Aix..."
                    value={formData.sector}
                    onChange={e => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Véhicule & coffre parapente
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Kangoo grand coffre, Duster 4x4..."
                    value={formData.vehicleInfo}
                    onChange={e => setFormData({ ...formData, vehicleInfo: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Places disponibles pour covoiturage
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={8}
                    value={formData.availableSeats}
                    onChange={e => setFormData({ ...formData, availableSeats: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Modèle de voile
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Ozone Alpina 4, Advance Iota..."
                    value={formData.wingModel}
                    onChange={e => setFormData({ ...formData, wingModel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Couleurs de la voile (visibilité en vol)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Bleu / Blanc / Cyan"
                    value={formData.wingColor}
                    onChange={e => setFormData({ ...formData, wingColor: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Niveau de pilote
                  </label>
                  <select
                    value={formData.pilotLevel}
                    onChange={e => setFormData({ ...formData, pilotLevel: e.target.value as PilotLevel })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="Pioupiou / Débutant">Pioupiou / Débutant</option>
                    <option value="Brevet Initial (Autonome sur site calme)">Brevet Initial (Autonome sur site calme)</option>
                    <option value="Brevet de Pilote (Tous sites)">Brevet de Pilote (Tous sites)</option>
                    <option value="Brevet Pilote Confirmé (BPC / Cross)">Brevet Pilote Confirmé (BPC / Cross)</option>
                    <option value="Biplaceur Fédéral">Biplaceur Fédéral</option>
                    <option value="Moniteur Fédéral">Moniteur Fédéral</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Contact d'urgence (Nom & Numéro)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Émilie 06 11 22 33 44"
                    value={formData.emergencyContactName}
                    onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Présentation / Bio
                </label>
                <textarea
                  rows={3}
                  value={formData.bio || ''}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Quelques mots sur vos habitudes de vol, vos objectifs de la saison..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/20"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discord Connect Modal */}
      {showDiscordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 bg-slate-950/90 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <img 
                  src={DISCORD_GUILD_ICON} 
                  alt="Discord Zéléph"
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20 shadow-lg shadow-[#5865F2]/30 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      {DISCORD_GUILD_NAME}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {currentUser.isDiscordConnected ? 'Compte lié' : 'Serveur Officiel'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Serveur ID: <code className="text-sky-300 font-mono">{DISCORD_GUILD_ID}</code> • ~1 200 membres • {discordPresenceCount} en direct
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDiscordModal(false)}
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 bg-slate-950/50 p-1.5 gap-1 overflow-x-auto">
              <button
                onClick={() => setDiscordModalTab('live')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  discordModalTab === 'live'
                    ? 'bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Pilotes en Direct ({discordPresenceCount})</span>
              </button>

              <button
                onClick={() => setDiscordModalTab('oauth')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  discordModalTab === 'oauth'
                    ? 'bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Connexion OAuth2</span>
              </button>

              <button
                onClick={() => setDiscordModalTab('join')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  discordModalTab === 'join'
                    ? 'bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Rejoindre le Serveur</span>
              </button>

              <button
                onClick={() => setDiscordModalTab('guide')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  discordModalTab === 'guide'
                    ? 'bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Configuration Bot Club</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* TAB 1: Membres en direct du Discord réel */}
              {discordModalTab === 'live' && (
                <div className="space-y-4 animate-fade-in">
                  {/* Highlight Jonathan ROUX if present */}
                  {(() => {
                    const jonathan = liveDiscordMembers.find(m => m.username.toLowerCase().includes('jonathan'));
                    if (!jonathan) return null;
                    return (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/15 via-[#5865F2]/20 to-slate-950 border border-sky-400/40 space-y-3 shadow-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img 
                                src={jonathan.avatar_url} 
                                alt={jonathan.username}
                                className="w-12 h-12 rounded-xl object-cover border-2 border-sky-400 shadow-md"
                                referrerPolicy="no-referrer"
                              />
                              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{jonathan.username}</span>
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                  En ligne sur le serveur
                                </span>
                              </div>
                              <p className="text-xs text-sky-300">
                                Profil Discord du serveur officiel des Z’éléphants Volants
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleConnectLiveMember(jonathan)}
                            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/25 transition flex items-center justify-center gap-1.5 shrink-0"
                          >
                            <Check className="w-4 h-4" />
                            <span>Se connecter avec ce profil</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Search and Filters for Live Discord Members */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                        <span>Pilotes actuellement connectés sur Discord :</span>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {liveDiscordMembers.length} détectés
                      </span>
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={discordSearchQuery}
                        onChange={e => setDiscordSearchQuery(e.target.value)}
                        placeholder="Filtrer par pseudo (ex: Jonathan, Thomas, Raph, Seb...)..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5865F2]"
                      />
                    </div>
                  </div>

                  {/* List of Live Members */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {liveDiscordMembers
                      .filter(m => !discordSearchQuery || m.username.toLowerCase().includes(discordSearchQuery.toLowerCase()))
                      .map(member => (
                        <div
                          key={member.id}
                          className="p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-950 border border-white/5 hover:border-sky-400/30 flex items-center justify-between gap-3 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={member.avatar_url}
                                alt={member.username}
                                className="w-10 h-10 rounded-xl object-cover border border-white/10"
                                referrerPolicy="no-referrer"
                              />
                              <span
                                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-950 ${
                                  member.status === 'online'
                                    ? 'bg-emerald-500'
                                    : member.status === 'idle'
                                    ? 'bg-amber-400'
                                    : 'bg-slate-500'
                                }`}
                              />
                            </div>
                            <div className="space-y-0.5">
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{member.username}</span>
                                {member.game?.name && (
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    • {member.game.name}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {member.status === 'online' ? 'Connecté' : 'Inactif'} sur Discord
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleConnectLiveMember(member)}
                            className="px-3 py-1.5 rounded-xl bg-[#5865F2]/20 hover:bg-[#5865F2] text-[#7983F5] hover:text-white border border-[#5865F2]/30 text-xs font-semibold transition"
                          >
                            Sélectionner
                          </button>
                        </div>
                      ))}
                  </div>

                  {/* Manual pseudo input fallback */}
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Votre compte n'est pas dans la liste ? Saisissez votre pseudo Discord :
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customHandleInput}
                        onChange={(e) => setCustomHandleInput(e.target.value)}
                        placeholder="Ex: Jonathan_Zeleph ou VotrePseudo"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5865F2]"
                      />
                      <button
                        onClick={() => {
                          const val = customHandleInput.trim();
                          if (val) {
                            handleConnectLiveMember({
                              id: 'custom-' + Date.now(),
                              username: val,
                              discriminator: '0000',
                              avatar_url: currentUser.discordAvatarUrl,
                              status: 'online'
                            });
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold transition shrink-0"
                      >
                        Lier le pseudo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: OAuth2 Connexion Réelle */}
              {discordModalTab === 'oauth' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#5865F2]/15 via-slate-950 to-slate-900 border border-[#5865F2]/20 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-[#5865F2] text-white shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">
                          Authentification Officielle Discord OAuth2 (Serveur Les Z'éléphants Volants)
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          La connexion ouvre la fenêtre officielle d'autorisation Discord. Vos identifiants ne sont jamais stockés en clair : Discord transmet en toute sécurité votre <strong>avatar officiel</strong>, votre <strong>pseudo</strong>, votre <strong>identifiant unique</strong> et vérifie votre présence sur le serveur du club (<code className="text-sky-300">ID: 933405606113591347</code>).
                        </p>
                      </div>
                    </div>
                  </div>

                  {oauthFeedback && (
                    <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                      oauthFeedback.type === 'error'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    }`}>
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">{oauthFeedback.message}</div>
                    </div>
                  )}

                  {/* Connected Status Card */}
                  {currentUser.isDiscordConnected && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentUser.discordAvatarUrl}
                          alt="Avatar"
                          className="w-11 h-11 rounded-xl object-cover border border-emerald-400/40"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>@{currentUser.discordUsername}</span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-400/20 text-emerald-300 text-[10px]">
                              Vérifié
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {currentUser.discordId ? `ID Discord: ${currentUser.discordId}` : 'Compte Discord lié'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleDisconnectDiscord}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
                      >
                        Dissocier
                      </button>
                    </div>
                  )}

                  {/* Action Launch Button */}
                  <div className="space-y-3 pt-1">
                    <button
                      onClick={handleLaunchDiscordOAuth}
                      className="w-full py-3.5 px-4 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-sm transition shadow-xl shadow-[#5865F2]/30 flex items-center justify-center gap-2.5"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                      <span>{currentUser.isDiscordConnected ? 'Re-synchroniser avec Discord' : 'Se connecter avec Discord (Popup officielle)'}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>

                    <p className="text-[11px] text-center text-slate-400">
                      Une fenêtre Discord officielle s'ouvre pour autoriser l'accès à votre profil.
                    </p>
                  </div>

                  {/* Client ID Setting for the Club */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-sky-400" />
                        <span>Client ID Application Discord du Club :</span>
                      </label>
                      <button
                        onClick={() => setDiscordModalTab('guide')}
                        className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <span>Comment l'obtenir ?</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discordClientId}
                        onChange={(e) => handleSaveClientId(e.target.value)}
                        placeholder="Ex: 933405606113591347 ou Application Client ID"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#5865F2]"
                      />
                      <button
                        onClick={() => {
                          setOauthFeedback({
                            type: 'success',
                            message: 'Client ID enregistré localement ! Vous pouvez lancer la connexion.'
                          });
                        }}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
                      >
                        Enregistrer
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Ce numéro identifie l'application créée pour les Z'éléphants Volants dans le Discord Developer Portal.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: Rejoindre le Serveur Discord */}
              {discordModalTab === 'join' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-900 border border-indigo-500/20 space-y-4">
                    <div className="flex items-center gap-3.5">
                      <img 
                        src={DISCORD_GUILD_ICON} 
                        alt="Serveur Les Z’éléphants Volants"
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-xl shadow-[#5865F2]/30 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">
                            {DISCORD_GUILD_NAME}
                          </h4>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                            Serveur Actif
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Le lieu d'échange et de coordination pour tous les pilotes parapente de Savoie.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                        <div className="font-bold text-sky-400">⛅ #météo-et-briefings</div>
                        <p className="text-[11px] text-slate-400">Analyses aérologiques du jour et balises.</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                        <div className="font-bold text-emerald-400">🚐 #navettes-covoit</div>
                        <p className="text-[11px] text-slate-400">Coordination pour monter aux décollages.</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                        <div className="font-bold text-amber-400">🪂 #sorties-club</div>
                        <p className="text-[11px] text-slate-400">Sorties Piou-piou, BPC, Marche & Vol et Cross.</p>
                      </div>
                    </div>
                  </div>

                  {/* Join Action & Copy Link */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">Lien d'invitation officiel du club :</span>
                      <button
                        onClick={() => {
                          setTempInviteUrl(discordInviteUrl);
                          setIsEditingInviteUrl(!isEditingInviteUrl);
                        }}
                        className="text-sky-400 hover:underline text-[11px]"
                      >
                        {isEditingInviteUrl ? 'Annuler' : 'Modifier le lien'}
                      </button>
                    </div>

                    {isEditingInviteUrl ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tempInviteUrl}
                          onChange={(e) => setTempInviteUrl(e.target.value)}
                          placeholder="https://discord.com/invite/..."
                          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                        />
                        <button
                          onClick={() => handleSaveInviteUrl(tempInviteUrl)}
                          className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold"
                        >
                          Enregistrer
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-white/5 text-xs">
                        <code className="text-[#7983F5] font-mono text-[11px] truncate max-w-[260px] sm:max-w-xs">
                          {discordInviteUrl}
                        </code>
                        <button
                          onClick={() => copyToClipboard(discordInviteUrl, 'invite')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-[11px] font-semibold transition"
                        >
                          {copiedKey === 'invite' ? (
                            <>
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copié !</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copier</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    <a
                      href={discordInviteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 px-4 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-[#5865F2]/25"
                    >
                      <span>Rejoindre le Discord des Z’éléphants Volants</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {/* TAB 4: Guide Club / Développeur */}
              {discordModalTab === 'guide' && (
                <div className="space-y-4 animate-fade-in text-xs text-slate-300">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Key className="w-4 h-4 text-sky-400" />
                      <span>Comment configurer la vraie connexion Discord OAuth2 pour le club ?</span>
                    </h4>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      Pour activer le bouton officiel avec fenêtre pop-up d'autorisation sur votre serveur <strong>Les Z’éléphants Volants (ID: {DISCORD_GUILD_ID})</strong>, suivez ces 3 étapes simples :
                    </p>
                  </div>

                  {/* Step 1 */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <span className="w-5 h-5 rounded-full bg-[#5865F2] text-white flex items-center justify-center text-[11px]">1</span>
                      <span>Créer l'application sur le Discord Developer Portal</span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-7">
                      Connectez-vous au portail développeur Discord et cliquez sur <strong>"New Application"</strong> (nommée par exemple <em>"Zéléph Skyhub"</em> ou <em>"Les Zéléphants Volants"</em>).
                    </p>
                    <div className="pl-7 pt-1">
                      <a
                        href="https://discord.com/developers/applications"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[11px] font-semibold transition"
                      >
                        <span>Ouvrir Discord Developer Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <span className="w-5 h-5 rounded-full bg-[#5865F2] text-white flex items-center justify-center text-[11px]">2</span>
                      <span>Ajouter les Redirect URIs dans l'onglet OAuth2</span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-7">
                      Dans votre application Discord, allez dans le menu <strong>OAuth2</strong> &gt; <strong>Redirects</strong> et ajoutez ces deux adresses exactes :
                    </p>

                    <div className="pl-7 space-y-2 pt-1">
                      {/* Dev URL */}
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between gap-2">
                        <div className="truncate">
                          <div className="text-[10px] text-slate-500 font-bold uppercase">URL Développement :</div>
                          <code className="text-[11px] font-mono text-sky-300 truncate block">
                            {DEV_CALLBACK_URL}
                          </code>
                        </div>
                        <button
                          onClick={() => copyToClipboard(DEV_CALLBACK_URL, 'devUrl')}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] font-semibold shrink-0"
                        >
                          {copiedKey === 'devUrl' ? 'Copié !' : 'Copier'}
                        </button>
                      </div>

                      {/* Prod URL */}
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between gap-2">
                        <div className="truncate">
                          <div className="text-[10px] text-slate-500 font-bold uppercase">URL Production / Partage :</div>
                          <code className="text-[11px] font-mono text-sky-300 truncate block">
                            {PROD_CALLBACK_URL}
                          </code>
                        </div>
                        <button
                          onClick={() => copyToClipboard(PROD_CALLBACK_URL, 'prodUrl')}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] font-semibold shrink-0"
                        >
                          {copiedKey === 'prodUrl' ? 'Copié !' : 'Copier'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <span className="w-5 h-5 rounded-full bg-[#5865F2] text-white flex items-center justify-center text-[11px]">3</span>
                      <span>Copier le Client ID et le coller dans Zeleph Skyhub</span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">
                      Copiez le <strong>Client ID</strong> (visible dans <em>General Information</em>) puis collez-le dans l'onglet <em>"Connexion OAuth2"</em>. La connexion Discord par popup est immédiatement opérationnelle pour tous les membres !
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Super-Admin Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Ajouter un membre à l'annuaire
                  </h3>
                  <p className="text-xs text-amber-300 font-mono">
                    Action Super-Admin • Jonathan ROUX
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Nom & Prénom *</label>
                  <input
                    type="text"
                    required
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="ex: Marc VEYRAT"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Pseudo Discord</label>
                  <input
                    type="text"
                    value={newMemberDiscord}
                    onChange={(e) => setNewMemberDiscord(e.target.value)}
                    placeholder="ex: marc_zeleph"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Téléphone *</label>
                  <input
                    type="text"
                    required
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    placeholder="06 12 34 56 78"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Email</label>
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="pilote@zeleph.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Niveau de vol</label>
                  <select
                    value={newMemberLevel}
                    onChange={(e) => setNewMemberLevel(e.target.value as PilotLevel)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="Pioupiou / Débutant">Pioupiou / Débutant</option>
                    <option value="Brevet Initial (Autonome sur site calme)">Brevet Initial</option>
                    <option value="Brevet de Pilote (Tous sites)">Brevet de Pilote (Tous sites)</option>
                    <option value="Brevet Pilote Confirmé (BPC / Cross)">Brevet Pilote Confirmé (BPC)</option>
                    <option value="Moniteur Fédéral">Moniteur Fédéral</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Modèle de Voile</label>
                  <input
                    type="text"
                    value={newMemberWing}
                    onChange={(e) => setNewMemberWing(e.target.value)}
                    placeholder="ex: Ozone Rush 6 (B+)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Secteur géographique</label>
                  <input
                    type="text"
                    value={newMemberSector}
                    onChange={(e) => setNewMemberSector(e.target.value)}
                    placeholder="ex: Chambéry, Aix-les-Bains..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Places covoiturage</label>
                  <input
                    type="number"
                    min="0"
                    max="8"
                    value={newMemberSeats}
                    onChange={(e) => setNewMemberSeats(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Rôle / Statut club</label>
                <input
                  type="text"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  placeholder="ex: Adhérent Club Zéléph, Responsable Matériel..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Bio / Description (optionnel)</label>
                <textarea
                  rows={2}
                  value={newMemberBio}
                  onChange={(e) => setNewMemberBio(e.target.value)}
                  placeholder="Présentation du pilote..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Enregistrer le membre</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal (Works 100% reliably in iFrames without window.confirm) */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3.5">
              <div className={`p-3 rounded-2xl shrink-0 ${confirmModal.isDanger ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'}`}>
                {confirmModal.isDanger ? <Trash2 className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg ${
                  confirmModal.isDanger
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                    : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/20'
                }`}
              >
                {confirmModal.isDanger && <Trash2 className="w-3.5 h-3.5" />}
                <span>{confirmModal.confirmLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
