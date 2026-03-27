import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenHeader from '../components/ScreenHeader';
import { palette, shadows } from '../constants/appTheme';
import { normalizeUrl } from '../utils/appUtils';
import { createProfileActionLinks } from '../utils/profileQrUtils';

function DetailRow({ label, value, iconName, onPress }) {
  if (!value) {
    return null;
  }

  if (onPress) {
    return (
      <TouchableOpacity style={styles.rowPressable} activeOpacity={0.86} onPress={onPress}>
        <View style={styles.rowTextWrap}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.rowValue}>{value}</Text>
        </View>
        <View style={styles.rowIconWrap}>
          <Feather name={iconName || 'external-link'} size={16} color={palette.primary} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.rowStatic}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function ProfileDetailScreen({ navigation, route }) {
  const profile = route?.params?.profile || null;
  const profileActions = useMemo(
    () => createProfileActionLinks(profile),
    [profile]
  );
  const socialRows = useMemo(() => {
    const links = Array.isArray(profile?.socialLinks) ? profile.socialLinks : [];
    return links.map((item) => ({
      value: item,
      actionLink: normalizeUrl(item),
    }));
  }, [profile]);

  const openLink = async (url, errorMessage) => {
    if (!url) {
      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Could not open', errorMessage || 'Unable to open this link.');
    }
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.container}>
          <ScreenHeader title="Profile" onBack={() => navigation.goBack()} compactTop />
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Profile data unavailable</Text>
            <Text style={styles.emptyText}>
              The scanned QR does not contain valid profile information.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScreenHeader title="Profile" onBack={() => navigation.goBack()} compactTop />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          <View style={styles.headerCard}>
            <Text style={styles.profileName}>{profile.name || 'Shared Profile'}</Text>
            {profile.bio ? <Text style={styles.profileBio}>{profile.bio}</Text> : null}
          </View>

          <View style={styles.contentCard}>
            <DetailRow
              label="Phone"
              value={profile.phone}
              onPress={
                profileActions.phone
                  ? () => openLink(profileActions.phone, 'Unable to call this number.')
                  : null
              }
              iconName="phone-call"
            />
            <DetailRow
              label="Email"
              value={profile.email}
              onPress={
                profileActions.email
                  ? () => openLink(profileActions.email, 'Unable to open this email address.')
                  : null
              }
              iconName="mail"
            />
            <DetailRow
              label="Website"
              value={profile.website}
              onPress={
                profileActions.website
                  ? () => openLink(profileActions.website, 'Unable to open this website.')
                  : null
              }
              iconName="external-link"
            />
            <DetailRow
              label="Address"
              value={profile.address}
              onPress={
                profileActions.address
                  ? () => openLink(profileActions.address, 'Unable to open maps for this address.')
                  : null
              }
              iconName="map-pin"
            />

            {socialRows.length ? (
              <View style={styles.socialBlock}>
                <Text style={styles.rowLabel}>Social Links</Text>
                {socialRows.map((item, index) => {
                  const rowKey = `${item.value}-${index}`;

                  if (!item.actionLink) {
                    return (
                      <View key={rowKey} style={styles.socialLinkStatic}>
                        <Text style={styles.socialLinkText}>{item.value}</Text>
                      </View>
                    );
                  }

                  return (
                    <TouchableOpacity
                      key={rowKey}
                      style={styles.socialLink}
                      onPress={() => openLink(item.actionLink, 'Unable to open this social link.')}
                      activeOpacity={0.86}
                    >
                      <Text style={styles.socialLinkText}>{item.value}</Text>
                      <Feather name="external-link" size={14} color={palette.primary} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    flex: 1,
    backgroundColor: palette.background,
    paddingHorizontal: 20,
  },
  scrollBody: {
    paddingBottom: 28,
  },
  headerCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    ...shadows.card,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: palette.text,
  },
  profileBio: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: palette.textMuted,
    fontWeight: '500',
  },
  contentCard: {
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    ...shadows.card,
  },
  rowStatic: {
    marginBottom: 14,
  },
  rowPressable: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DCE7F7',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFF',
  },
  rowTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  rowLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
    color: '#64748B',
    fontWeight: '700',
    marginBottom: 4,
  },
  rowValue: {
    fontSize: 14,
    lineHeight: 21,
    color: palette.text,
    fontWeight: '600',
  },
  rowIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6EEFF',
  },
  socialBlock: {
    marginTop: 4,
  },
  socialLink: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE7F7',
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFF',
  },
  socialLinkStatic: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  socialLinkText: {
    flex: 1,
    marginRight: 8,
    fontSize: 13,
    fontWeight: '600',
    color: palette.text,
  },
  emptyCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    ...shadows.card,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.text,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: palette.textMuted,
    fontWeight: '500',
  },
});
