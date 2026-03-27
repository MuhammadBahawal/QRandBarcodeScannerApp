import { normalizeUrl } from './appUtils';

export const PROFILE_QR_PREFIX = 'SKANORA_PROFILE:';

function cleanValue(value) {
  return String(value || '').trim();
}

function ensureUrl(value) {
  const cleaned = cleanValue(value);

  if (!cleaned) {
    return '';
  }

  return normalizeUrl(cleaned) || cleaned;
}

function normalizeSocialLinks(rawValue) {
  const socialLines = String(rawValue || '')
    .split(/\r?\n|,/)
    .map((item) => ensureUrl(item))
    .filter(Boolean);

  return Array.from(new Set(socialLines));
}

export function buildProfileQrValue(profileInput) {
  const payload = {
    n: cleanValue(profileInput?.name),
    p: cleanValue(profileInput?.phone),
    e: cleanValue(profileInput?.email),
    a: cleanValue(profileInput?.address),
    b: cleanValue(profileInput?.bio),
    w: ensureUrl(profileInput?.website),
    s: normalizeSocialLinks(profileInput?.socialLinks),
  };

  const hasAnyValue = Boolean(
    payload.n || payload.p || payload.e || payload.a || payload.b || payload.w || payload.s.length
  );

  if (!hasAnyValue) {
    return '';
  }

  return `${PROFILE_QR_PREFIX}${JSON.stringify(payload)}`;
}

export function parseProfileQrValue(rawValue) {
  const value = cleanValue(rawValue);

  if (!value.startsWith(PROFILE_QR_PREFIX)) {
    return null;
  }

  try {
    const parsed = JSON.parse(value.slice(PROFILE_QR_PREFIX.length));
    const profile = {
      name: cleanValue(parsed?.n),
      phone: cleanValue(parsed?.p),
      email: cleanValue(parsed?.e),
      address: cleanValue(parsed?.a),
      bio: cleanValue(parsed?.b),
      website: ensureUrl(parsed?.w),
      socialLinks: Array.isArray(parsed?.s)
        ? parsed.s.map((item) => ensureUrl(item)).filter(Boolean)
        : [],
    };

    const hasAnyValue = Boolean(
      profile.name ||
      profile.phone ||
      profile.email ||
      profile.address ||
      profile.bio ||
      profile.website ||
      profile.socialLinks.length
    );

    if (!hasAnyValue) {
      return null;
    }

    return profile;
  } catch {
    return null;
  }
}

export function createProfileActionLinks(profile) {
  const actions = {
    phone: null,
    email: null,
    website: null,
    address: null,
    socialLinks: [],
  };

  const phone = cleanValue(profile?.phone);
  if (phone) {
    actions.phone = `tel:${phone.replace(/\s+/g, '')}`;
  }

  const email = cleanValue(profile?.email);
  if (email) {
    actions.email = `mailto:${email}`;
  }

  const website = cleanValue(profile?.website);
  const normalizedWebsite = normalizeUrl(website);
  if (normalizedWebsite) {
    actions.website = normalizedWebsite;
  }

  const address = cleanValue(profile?.address);
  if (address) {
    actions.address = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  const links = Array.isArray(profile?.socialLinks) ? profile.socialLinks : [];
  actions.socialLinks = links
    .map((item) => normalizeUrl(cleanValue(item)))
    .filter(Boolean);

  return actions;
}
