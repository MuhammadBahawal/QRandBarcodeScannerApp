import * as ImagePicker from 'expo-image-picker';

import { normalizeUrl } from './appUtils';
import { validateImageFile } from './qrLogoUtils';

export const PROFILE_QR_PREFIX = 'SKANORA_PROFILE:';
const INLINE_IMAGE_BASE64_MAX_LENGTH = 1000;

const PROFILE_KEY_ALIASES = {
  name: ['n', 'name', 'fullName'],
  phone: ['p', 'phone', 'mobile', 'phoneNumber'],
  email: ['e', 'email'],
  address: ['a', 'address', 'location'],
  bio: ['b', 'bio', 'about', 'description'],
  website: ['w', 'website', 'url', 'link'],
  socialLinks: ['s', 'socialLinks', 'socials', 'links'],
  imageDataUri: ['i', 'imageDataUri', 'imageData', 'avatarData'],
  imageUri: ['u', 'imageUri', 'avatar', 'avatarUrl', 'photo', 'image'],
};

const ALL_KNOWN_PROFILE_KEYS = new Set(
  Object.values(PROFILE_KEY_ALIASES)
    .flat()
    .map((key) => key.toLowerCase())
);

const DETAIL_QR_HEADER = 'Shared Details';
const READABLE_LABEL_ALIASES = {
  name: ['fullname', 'name'],
  phone: ['phonenumber', 'phone', 'mobile', 'mobilenumber'],
  email: ['email', 'emailaddress'],
  address: ['address', 'location'],
  bio: ['about', 'notes', 'aboutnotes', 'bio', 'description'],
  website: ['website', 'url', 'web', 'link'],
  socialLinks: ['sociallinks', 'social', 'links', 'otherlinks'],
  image: ['image', 'imageurl', 'photo', 'avatar'],
};

function cleanValue(value) {
  return String(value || '').trim();
}

function normalizeProfileKey(rawKey) {
  return String(rawKey || '').trim();
}

function normalizeLabelToken(rawLabel) {
  return normalizeProfileKey(rawLabel)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function unwrapQuotedValue(rawValue) {
  const value = cleanValue(rawValue);

  if (!value) {
    return '';
  }

  const isDoubleQuoted = value.startsWith('"') && value.endsWith('"');
  const isSingleQuoted = value.startsWith("'") && value.endsWith("'");

  if (!isDoubleQuoted && !isSingleQuoted) {
    return value;
  }

  return cleanValue(value.slice(1, -1));
}

function isReadableLabelMatch(rawLabel, aliasList) {
  const normalizedLabel = normalizeLabelToken(rawLabel);
  return aliasList.includes(normalizedLabel);
}

function toReadableDetailLabel(rawKey) {
  const cleanedKey = normalizeProfileKey(rawKey);

  if (!cleanedKey) {
    return '';
  }

  const shortLabelMap = {
    n: 'Full Name',
    p: 'Phone Number',
    e: 'Email',
    a: 'Address',
    b: 'About',
    w: 'Website',
    s: 'Social Links',
    i: 'Image',
    u: 'Image URL',
  };

  if (shortLabelMap[cleanedKey]) {
    return shortLabelMap[cleanedKey];
  }

  return cleanedKey
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getFirstProfileValue(payload, aliases) {
  const payloadEntries = Object.entries(payload || {});

  for (const alias of aliases) {
    if (payload?.[alias] !== undefined && payload?.[alias] !== null) {
      return payload[alias];
    }

    const aliasMatch = payloadEntries.find(
      ([key]) => normalizeProfileKey(key).toLowerCase() === alias.toLowerCase()
    );
    if (aliasMatch && aliasMatch[1] !== undefined && aliasMatch[1] !== null) {
      return aliasMatch[1];
    }
  }

  return '';
}

function normalizeSocialLinksInput(rawValue) {
  if (Array.isArray(rawValue)) {
    return rawValue.map((item) => cleanValue(item)).filter(Boolean).join('\n');
  }

  return cleanValue(rawValue);
}

function extractProfilePayloadValue(rawValue) {
  const baseValue = cleanValue(rawValue);
  const unwrappedValue = unwrapQuotedValue(baseValue);
  const candidates = Array.from(new Set([baseValue, unwrappedValue])).filter(Boolean);
  const prefixPattern = /SKANORA_PROFILE\s*:/i;

  for (const candidate of candidates) {
    const match = prefixPattern.exec(candidate);
    if (!match) {
      continue;
    }

    return candidate.slice((match.index || 0) + match[0].length).trim();
  }

  return '';
}

function parseJsonObjectCandidate(rawCandidate, depth = 0) {
  if (depth > 3) {
    return null;
  }

  const candidate = cleanValue(rawCandidate);
  if (!candidate) {
    return null;
  }

  try {
    const parsedPayload = JSON.parse(candidate);
    if (typeof parsedPayload === 'string') {
      return parseJsonObjectCandidate(parsedPayload, depth + 1);
    }

    return parsedPayload && typeof parsedPayload === 'object' && !Array.isArray(parsedPayload)
      ? parsedPayload
      : null;
  } catch {
    return null;
  }
}

function parseProfilePayloadObject(payloadText) {
  if (!payloadText) {
    return null;
  }

  const rawPayload = cleanValue(payloadText);
  const decodedPayload = (() => {
    try {
      return cleanValue(decodeURIComponent(rawPayload));
    } catch {
      return '';
    }
  })();
  const unwrappedPayload = unwrapQuotedValue(rawPayload);
  const escapedPayload = cleanValue(
    unwrappedPayload
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, '\\')
  );

  const candidates = Array.from(
    new Set([rawPayload, decodedPayload, unwrappedPayload, escapedPayload].filter(Boolean))
  );

  for (const candidate of candidates) {
    const parsedObject = parseJsonObjectCandidate(candidate);
    if (parsedObject) {
      return parsedObject;
    }
  }

  return null;
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

function appendUniqueSocialLinks(targetLinks, rawValue) {
  const normalizedLinks = normalizeSocialLinks(rawValue);
  normalizedLinks.forEach((link) => {
    if (!targetLinks.includes(link)) {
      targetLinks.push(link);
    }
  });
}

function createBaseProfileShape() {
  return {
    name: '',
    phone: '',
    email: '',
    address: '',
    bio: '',
    website: '',
    socialLinks: [],
    imageDataUri: '',
    localImageUri: '',
    imageUri: '',
    extraDetails: [],
  };
}

function buildProfileFromParsedObject(parsedObject) {
  if (!parsedObject || typeof parsedObject !== 'object' || Array.isArray(parsedObject)) {
    return null;
  }

  const imageDataUri = cleanValue(
    getFirstProfileValue(parsedObject, PROFILE_KEY_ALIASES.imageDataUri)
  );
  const normalizedImageDataUri = imageDataUri.startsWith('data:image/')
    ? imageDataUri
    : '';
  const localImageUri = cleanValue(
    getFirstProfileValue(parsedObject, PROFILE_KEY_ALIASES.imageUri)
  );

  const profile = createBaseProfileShape();
  profile.name = cleanValue(getFirstProfileValue(parsedObject, PROFILE_KEY_ALIASES.name));
  profile.phone = cleanValue(getFirstProfileValue(parsedObject, PROFILE_KEY_ALIASES.phone));
  profile.email = cleanValue(getFirstProfileValue(parsedObject, PROFILE_KEY_ALIASES.email));
  profile.address = cleanValue(getFirstProfileValue(parsedObject, PROFILE_KEY_ALIASES.address));
  profile.bio = cleanValue(getFirstProfileValue(parsedObject, PROFILE_KEY_ALIASES.bio));
  profile.website = ensureUrl(getFirstProfileValue(parsedObject, PROFILE_KEY_ALIASES.website));
  profile.socialLinks = normalizeSocialLinks(
    normalizeSocialLinksInput(getFirstProfileValue(parsedObject, PROFILE_KEY_ALIASES.socialLinks))
  );
  profile.imageDataUri = normalizedImageDataUri;
  profile.localImageUri = localImageUri;
  profile.imageUri = normalizedImageDataUri || localImageUri;

  profile.extraDetails = Object.entries(parsedObject).reduce((items, [key, rawItemValue]) => {
    const normalizedKey = normalizeProfileKey(key);
    if (!normalizedKey || ALL_KNOWN_PROFILE_KEYS.has(normalizedKey.toLowerCase())) {
      return items;
    }

    let normalizedValue = '';
    if (Array.isArray(rawItemValue)) {
      normalizedValue = rawItemValue
        .map((item) => cleanValue(item))
        .filter(Boolean)
        .join(', ');
    } else if (typeof rawItemValue === 'object') {
      normalizedValue = '';
    } else {
      normalizedValue = cleanValue(rawItemValue);
    }

    if (!normalizedValue) {
      return items;
    }

    return [
      ...items,
      {
        label: toReadableDetailLabel(normalizedKey),
        value: normalizedValue,
      },
    ];
  }, []);

  const hasAnyValue = Boolean(
    profile.name ||
    profile.phone ||
    profile.email ||
    profile.address ||
    profile.bio ||
    profile.website ||
    profile.socialLinks.length ||
    profile.imageUri ||
    profile.extraDetails.length
  );

  return hasAnyValue ? profile : null;
}

function parseReadableProfileQrValue(rawValue) {
  const textValue = unwrapQuotedValue(rawValue);
  if (!textValue) {
    return null;
  }

  const lines = textValue
    .split(/\r?\n/)
    .map((line) => cleanValue(line))
    .filter(Boolean);

  if (!lines.length) {
    return null;
  }

  const firstLine = normalizeProfileKey(lines[0]).toLowerCase();
  const hasDetailHeader = firstLine === 'shared details' || firstLine === 'person details';
  const startIndex = hasDetailHeader ? 1 : 0;
  const profile = createBaseProfileShape();
  let recognizedFieldCount = 0;
  let collectingSocialLinks = false;

  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index];

    if (collectingSocialLinks && /^[-*]\s*/.test(line)) {
      appendUniqueSocialLinks(profile.socialLinks, line.replace(/^[-*]\s*/, ''));
      continue;
    }

    const labelMatch = line.match(/^([^:]+):\s*(.*)$/);
    if (!labelMatch) {
      if (collectingSocialLinks) {
        appendUniqueSocialLinks(profile.socialLinks, line);
      }
      continue;
    }

    const rawLabel = cleanValue(labelMatch[1]);
    const rawFieldValue = cleanValue(labelMatch[2]);
    collectingSocialLinks = false;

    if (!rawLabel) {
      continue;
    }

    if (isReadableLabelMatch(rawLabel, READABLE_LABEL_ALIASES.name)) {
      if (rawFieldValue) {
        profile.name = rawFieldValue;
        recognizedFieldCount += 1;
      }
      continue;
    }

    if (isReadableLabelMatch(rawLabel, READABLE_LABEL_ALIASES.phone)) {
      if (rawFieldValue) {
        profile.phone = rawFieldValue;
        recognizedFieldCount += 1;
      }
      continue;
    }

    if (isReadableLabelMatch(rawLabel, READABLE_LABEL_ALIASES.email)) {
      if (rawFieldValue) {
        profile.email = rawFieldValue;
        recognizedFieldCount += 1;
      }
      continue;
    }

    if (isReadableLabelMatch(rawLabel, READABLE_LABEL_ALIASES.address)) {
      if (rawFieldValue) {
        profile.address = rawFieldValue;
        recognizedFieldCount += 1;
      }
      continue;
    }

    if (isReadableLabelMatch(rawLabel, READABLE_LABEL_ALIASES.bio)) {
      if (rawFieldValue) {
        profile.bio = rawFieldValue;
        recognizedFieldCount += 1;
      }
      continue;
    }

    if (isReadableLabelMatch(rawLabel, READABLE_LABEL_ALIASES.website)) {
      if (rawFieldValue) {
        profile.website = ensureUrl(rawFieldValue);
        recognizedFieldCount += 1;
      }
      continue;
    }

    if (isReadableLabelMatch(rawLabel, READABLE_LABEL_ALIASES.socialLinks)) {
      if (rawFieldValue) {
        appendUniqueSocialLinks(profile.socialLinks, rawFieldValue);
        if (profile.socialLinks.length) {
          recognizedFieldCount += 1;
        }
      } else {
        collectingSocialLinks = true;
      }
      continue;
    }

    if (isReadableLabelMatch(rawLabel, READABLE_LABEL_ALIASES.image)) {
      if (rawFieldValue.startsWith('data:image/')) {
        profile.imageDataUri = rawFieldValue;
        profile.imageUri = rawFieldValue;
        recognizedFieldCount += 1;
      } else if (/^https?:\/\//i.test(rawFieldValue)) {
        profile.imageUri = rawFieldValue;
        recognizedFieldCount += 1;
      }
      continue;
    }

    if (rawFieldValue) {
      profile.extraDetails.push({
        label: toReadableDetailLabel(rawLabel),
        value: rawFieldValue,
      });
    }
  }

  const hasAnyValue = Boolean(
    profile.name ||
    profile.phone ||
    profile.email ||
    profile.address ||
    profile.bio ||
    profile.website ||
    profile.socialLinks.length ||
    profile.imageUri ||
    profile.extraDetails.length
  );

  if (!hasAnyValue) {
    return null;
  }

  if (hasDetailHeader) {
    return recognizedFieldCount > 0 || profile.extraDetails.length ? profile : null;
  }

  return recognizedFieldCount >= 2 ? profile : null;
}

function buildInlineImageDataUri(base64Value, mimeType = 'image/jpeg') {
  const cleaned = cleanValue(base64Value);

  if (!cleaned || cleaned.length > INLINE_IMAGE_BASE64_MAX_LENGTH) {
    return '';
  }

  return `data:${mimeType};base64,${cleaned}`;
}

async function requestMediaLibraryPermissionIfNeeded() {
  try {
    const permissionStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (permissionStatus.status === 'granted') {
      return true;
    }

    const requestResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return requestResult.status === 'granted';
  } catch {
    return false;
  }
}

async function requestCameraPermissionIfNeeded() {
  try {
    const permissionStatus = await ImagePicker.getCameraPermissionsAsync();
    if (permissionStatus.status === 'granted') {
      return true;
    }

    const requestResult = await ImagePicker.requestCameraPermissionsAsync();
    return requestResult.status === 'granted';
  } catch {
    return false;
  }
}

async function normalizeProfileImageAsset(asset) {
  if (!asset?.uri) {
    return { error: 'invalid_asset' };
  }

  const isValidFile = await validateImageFile(asset.uri);
  if (!isValidFile) {
    return { error: 'invalid_asset' };
  }

  return {
    imageUri: asset.uri,
    imageDataUri: buildInlineImageDataUri(asset.base64, asset.mimeType || 'image/jpeg'),
    width: asset.width || 0,
    height: asset.height || 0,
  };
}

export async function pickProfileImageFromGallery() {
  const permissionGranted = await requestMediaLibraryPermissionIfNeeded();
  if (!permissionGranted) {
    return { error: 'permission_denied' };
  }

  try {
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.25,
      selectionLimit: 1,
      base64: true,
    });

    if (pickerResult.canceled || !pickerResult.assets?.length) {
      return { error: 'picker_canceled' };
    }

    return normalizeProfileImageAsset(pickerResult.assets[0]);
  } catch {
    return { error: 'picker_failed' };
  }
}

export async function captureProfileImageFromCamera() {
  const permissionGranted = await requestCameraPermissionIfNeeded();
  if (!permissionGranted) {
    return { error: 'camera_permission_denied' };
  }

  try {
    const captureResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.25,
      base64: true,
    });

    if (captureResult.canceled || !captureResult.assets?.length) {
      return { error: 'picker_canceled' };
    }

    return normalizeProfileImageAsset(captureResult.assets[0]);
  } catch {
    return { error: 'camera_failed' };
  }
}

export function resolveProfileImageUri(profile) {
  return (
    cleanValue(profile?.imageDataUri) ||
    cleanValue(profile?.imageUri) ||
    cleanValue(profile?.localImageUri)
  );
}

export function buildProfileQrValue(profileInput) {
  const name = cleanValue(profileInput?.name);
  const phone = cleanValue(profileInput?.phone);
  const email = cleanValue(profileInput?.email);
  const address = cleanValue(profileInput?.address);
  const about = cleanValue(profileInput?.bio);
  const website = ensureUrl(profileInput?.website);
  const socialLinks = normalizeSocialLinks(profileInput?.socialLinks);
  const shareableImageUrl = (() => {
    const imageUri = cleanValue(profileInput?.imageUri);
    return /^https?:\/\//i.test(imageUri) ? imageUri : '';
  })();

  const lines = [DETAIL_QR_HEADER];

  if (name) {
    lines.push(`Full Name: ${name}`);
  }

  if (phone) {
    lines.push(`Phone Number: ${phone}`);
  }

  if (email) {
    lines.push(`Email: ${email}`);
  }

  if (address) {
    lines.push(`Address: ${address}`);
  }

  if (about) {
    lines.push(`About: ${about}`);
  }

  if (website) {
    lines.push(`Website: ${website}`);
  }

  if (socialLinks.length) {
    lines.push(`Social Links: ${socialLinks.join(', ')}`);
  }

  if (shareableImageUrl) {
    lines.push(`Image URL: ${shareableImageUrl}`);
  }

  if (lines.length <= 1) {
    return '';
  }

  return lines.join('\n');
}

export function isProfileQrValue(rawValue) {
  if (extractProfilePayloadValue(rawValue)) {
    return true;
  }

  return Boolean(parseReadableProfileQrValue(rawValue));
}

export function parseProfileQrValue(rawValue) {
  const payloadText = extractProfilePayloadValue(rawValue);
  if (payloadText) {
    const parsed = parseProfilePayloadObject(payloadText);
    const legacyProfile = buildProfileFromParsedObject(parsed);
    if (legacyProfile) {
      return legacyProfile;
    }
  }

  return parseReadableProfileQrValue(rawValue);
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

export function formatProfileDetailsForClipboard(profile) {
  const safeProfile = profile || {};
  const lines = [];

  const name = cleanValue(safeProfile.name);
  if (name) {
    lines.push(`Full Name: ${name}`);
  }

  const phone = cleanValue(safeProfile.phone);
  if (phone) {
    lines.push(`Phone Number: ${phone}`);
  }

  const email = cleanValue(safeProfile.email);
  if (email) {
    lines.push(`Email: ${email}`);
  }

  const address = cleanValue(safeProfile.address);
  if (address) {
    lines.push(`Address: ${address}`);
  }

  const bio = cleanValue(safeProfile.bio);
  if (bio) {
    lines.push(`About: ${bio}`);
  }

  const website = cleanValue(safeProfile.website);
  if (website) {
    lines.push(`Website: ${website}`);
  }

  const socialLinks = Array.isArray(safeProfile.socialLinks)
    ? safeProfile.socialLinks.map((item) => cleanValue(item)).filter(Boolean)
    : [];
  if (socialLinks.length) {
    lines.push(`Social Links: ${socialLinks.join(', ')}`);
  }

  const extraDetails = Array.isArray(safeProfile.extraDetails) ? safeProfile.extraDetails : [];
  extraDetails.forEach((item) => {
    const label = cleanValue(item?.label);
    const value = cleanValue(item?.value);
    if (label && value) {
      lines.push(`${label}: ${value}`);
    }
  });

  return lines.join('\n');
}
