/**
 * Platform Detection Utility
 * Auto-detects well-known social media platforms from URLs
 */

export const PLATFORM_LOGOS = {
  instagram: {
    name: 'Instagram',
    colors: {
      primary: '#E4405F',
      secondary: '#405DE6',
    },
  },
  facebook: {
    name: 'Facebook',
    colors: {
      primary: '#1877F2',
      secondary: '#E7F3FF',
    },
  },
  tiktok: {
    name: 'TikTok',
    colors: {
      primary: '#000000',
      secondary: '#25F4EE',
    },
  },
  twitter: {
    name: 'Twitter/X',
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
    },
  },
  youtube: {
    name: 'YouTube',
    colors: {
      primary: '#FF0000',
      secondary: '#FFFFFF',
    },
  },
  linkedin: {
    name: 'LinkedIn',
    colors: {
      primary: '#0A66C2',
      secondary: '#E3F2FD',
    },
  },
  pinterest: {
    name: 'Pinterest',
    colors: {
      primary: '#E60023',
      secondary: '#FFF0F1',
    },
  },
  snapchat: {
    name: 'Snapchat',
    colors: {
      primary: '#FFFC00',
      secondary: '#000000',
    },
  },
};

/**
 * Platform patterns for URL detection
 * Maps regex patterns to platform identifiers
 */
const PLATFORM_PATTERNS = {
  instagram: [
    /^https?:\/\/(www\.)?instagram\.com\//i,
    /instagram\.com/i,
    /insta(gram)?\.app/i,
  ],
  facebook: [
    /^https?:\/\/(www\.)?facebook\.com\//i,
    /facebook\.com/i,
    /fb\.com/i,
    /^https?:\/\/(www\.)?m\.facebook\.com\//i,
  ],
  tiktok: [
    /^https?:\/\/(www\.)?tiktok\.com\//i,
    /tiktok\.com/i,
    /vt\.tiktok\.com/i,
    /vm\.tiktok\.com/i,
  ],
  twitter: [
    /^https?:\/\/(www\.)?twitter\.com\//i,
    /twitter\.com/i,
    /^https?:\/\/(www\.)?x\.com\//i,
    /x\.com/i,
  ],
  youtube: [
    /^https?:\/\/(www\.)?youtube\.com\//i,
    /youtube\.com/i,
    /youtu\.be/i,
    /^https?:\/\/(www\.)?m\.youtube\.com\//i,
  ],
  linkedin: [
    /^https?:\/\/(www\.)?linkedin\.com\//i,
    /linkedin\.com/i,
    /^https?:\/\/(www\.)?lnkd\.in\//i,
  ],
  pinterest: [
    /^https?:\/\/(www\.)?pinterest\.com\//i,
    /pinterest\.com/i,
    /pin\.it/i,
  ],
  snapchat: [
    /^https?:\/\/(www\.)?snapchat\.com\//i,
    /snapchat\.com/i,
  ],
};

/**
 * Detects the platform from a given URL
 * @param {string} url - The URL to analyze
 * @returns {string|null} - Platform identifier (e.g., 'instagram') or null if not detected
 */
export function detectPlatformFromUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmedUrl = url.trim().toLowerCase();

  for (const [platform, patterns] of Object.entries(PLATFORM_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(trimmedUrl)) {
        return platform;
      }
    }
  }

  return null;
}

/**
 * Gets platform logo data by platform identifier
 * @param {string} platformId - The platform identifier
 * @returns {object|null} - Platform logo data or null if not found
 */
export function getPlatformLogoData(platformId) {
  if (!platformId) {
    return null;
  }

  return PLATFORM_LOGOS[platformId.toLowerCase()] || null;
}

/**
 * Gets all available platforms
 * @returns {array} - Array of platform identifiers
 */
export function getAvailablePlatforms() {
  return Object.keys(PLATFORM_LOGOS);
}

const PLATFORM_ICON_MAP = {
  instagram: {
    iconName: 'instagram',
    iconColor: '#FFFFFF',
    backgroundColor: '#E4405F',
  },
  facebook: {
    iconName: 'facebook-f',
    iconColor: '#FFFFFF',
    backgroundColor: '#1877F2',
  },
  tiktok: {
    iconName: 'tiktok',
    iconColor: '#FFFFFF',
    backgroundColor: '#000000',
  },
  twitter: {
    iconName: 'twitter',
    iconColor: '#FFFFFF',
    backgroundColor: '#1DA1F2',
  },
  youtube: {
    iconName: 'youtube',
    iconColor: '#FFFFFF',
    backgroundColor: '#FF0000',
  },
  linkedin: {
    iconName: 'linkedin-in',
    iconColor: '#FFFFFF',
    backgroundColor: '#0A66C2',
  },
  pinterest: {
    iconName: 'pinterest-p',
    iconColor: '#FFFFFF',
    backgroundColor: '#E60023',
  },
  snapchat: {
    iconName: 'snapchat-ghost',
    iconColor: '#FFFFFF',
    backgroundColor: '#FFFC00',
  },
};

export function getPlatformLogoSpec(platformId) {
  if (!platformId) {
    return null;
  }

  const lower = platformId.toLowerCase();
  const spec = PLATFORM_ICON_MAP[lower];

  if (!spec) {
    return null;
  }

  return {
    ...spec,
    platformName: PLATFORM_LOGOS[lower]?.name || platformId,
    platformId: lower,
  };
}

/**
 * Analyzes a URL and returns its platform information
 * @param {string} url - The URL to analyze
 * @returns {object} - Platform detection result with platform ID and metadata
 */
export function analyzePlatformUrl(url) {
  const platformId = detectPlatformFromUrl(url);
  const logoData = platformId ? getPlatformLogoData(platformId) : null;

  return {
    detected: platformId !== null,
    platformId,
    logoData,
    platformName: logoData?.name || null,
  };
}

/**
 * Creates a simple SVG logo fallback for a platform (in case image is not available)
 * @param {string} platformId - The platform identifier
 * @returns {string} - SVG string
 */
export function createPlatformLogoSvg(platformId) {
  const colors = PLATFORM_LOGOS[platformId]?.colors || {
    primary: '#4F46E5',
    secondary: '#FFFFFF',
  };

  // Simple circular logo with platform initial/icon
  return `
    <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="30" fill="${colors.primary}"/>
      <circle cx="30" cy="30" r="28" fill="${colors.secondary}"/>
      <text x="30" y="38" font-size="24" font-weight="bold" 
            fill="${colors.primary}" text-anchor="middle" dominant-baseline="middle">
        ${platformId.charAt(0).toUpperCase()}
      </text>
    </svg>
  `;
}
