import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    title: 'Scan Everything Instantly',
    description:
      'Scan QR codes and barcodes in seconds with fast, accurate, and seamless detection anytime you need.',
    buttonText: 'Next',
    showSkip: true,
    showBack: false,
    stepText: null,
    type: 'scan',
  },
  {
    id: '2',
    title: 'Generate Custom Codes',
    description:
      'Create QR codes and barcodes for links, contacts, Wi-Fi, text, products, and much more with ease.',
    buttonText: 'Next',
    showSkip: true,
    showBack: false,
    stepText: null,
    type: 'generate',
  },
  {
    id: '3',
    title: 'Share & Print with Ease',
    description:
      'Save, share, and print your generated codes whenever you want with a smooth and user-friendly experience.',
    buttonText: 'Get Started',
    showSkip: false,
    showBack: true,
    stepText: 'Step 3 of 3',
    type: 'share',
  },
];

export default function OnboardingScreen({ navigation }) {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = async () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      navigation.replace('Home');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    navigation.replace('Home');
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const renderTopBar = (item, index) => {
    if (item.showBack) {
      return (
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.iconButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>

          <Text style={styles.stepText}>{item.stepText}</Text>

          <View style={styles.topRightPlaceholder} />
        </View>
      );
    }

    return (
      <View style={styles.topRow}>
        <View style={styles.topRightOnly}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderIllustration = (type) => {
    if (type === 'scan') {
      return (
        <View style={styles.cardWrapper}>
          <View style={styles.mainCard}>
            <View style={styles.scanPreview}>
              <View style={styles.phoneFrame}>
                <MaterialCommunityIcons name="qrcode-scan" size={74} color="#6D5EF8" />
                <View style={styles.scanLine} />
              </View>
            </View>

            <View style={styles.floatingBadgeLeft}>
              <Feather name="maximize" size={18} color="#6D5EF8" />
            </View>

            <View style={styles.floatingBadgeRight}>
              <MaterialCommunityIcons name="barcode-scan" size={20} color="#6D5EF8" />
            </View>
          </View>
        </View>
      );
    }

    if (type === 'generate') {
      return (
        <View style={styles.cardWrapper}>
          <View style={styles.mainCard}>
            <View style={styles.generateBox}>
              <View style={styles.qrBox}>
                <MaterialCommunityIcons name="qrcode" size={78} color="#111827" />
              </View>
            </View>

            <View style={styles.floatingBadgeLeft}>
              <Feather name="plus" size={20} color="#6D5EF8" />
            </View>

            <View style={styles.floatingBadgeRight}>
              <MaterialCommunityIcons name="barcode" size={20} color="#6D5EF8" />
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.cardWrapper}>
        <View style={styles.mainCard}>
          <View style={styles.generateBox}>
            <View style={styles.qrBox}>
              <MaterialCommunityIcons name="qrcode" size={78} color="#111827" />
            </View>
          </View>

          <View style={styles.floatingBadgeLeft}>
            <Feather name="share-2" size={19} color="#6D5EF8" />
          </View>

          <View style={styles.floatingBadgeRight}>
            <Feather name="printer" size={19} color="#6D5EF8" />
          </View>
        </View>
      </View>
    );
  };

  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.slide}>
        {renderTopBar(item, index)}

        <View style={styles.middleContent}>
          {renderIllustration(item.type)}

          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>

        <View style={styles.bottomArea}>
          <View style={styles.pagination}>
            {onboardingData.map((dot, dotIndex) => (
              <View
                key={dot.id}
                style={[
                  styles.dot,
                  currentIndex === dotIndex && styles.activeDot,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>{item.buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slide: {
    width,
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 34,
    justifyContent: 'space-between',
  },
  topRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8FC',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  topRightPlaceholder: {
    width: 38,
  },
  topRightOnly: {
    width: '100%',
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  middleContent: {
    alignItems: 'center',
    marginTop: 10,
  },
  cardWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 34,
  },
  mainCard: {
    width: width - 72,
    height: 320,
    borderRadius: 32,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#ECE8FF',
  },
  scanPreview: {
    width: 180,
    height: 220,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8E86FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  phoneFrame: {
    width: 130,
    height: 170,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E6E1FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#FCFCFF',
  },
  scanLine: {
    position: 'absolute',
    width: 82,
    height: 3,
    borderRadius: 6,
    backgroundColor: '#6D5EF8',
    top: 84,
  },
  generateBox: {
    width: 190,
    height: 190,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8E86FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  qrBox: {
    width: 130,
    height: 130,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingBadgeLeft: {
    position: 'absolute',
    left: 24,
    bottom: 32,
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8E86FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  floatingBadgeRight: {
    position: 'absolute',
    right: 24,
    top: 42,
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8E86FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  description: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 24,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  bottomArea: {
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 5,
  },
  activeDot: {
    width: 26,
    backgroundColor: '#6D5EF8',
  },
  button: {
    width: '100%',
    height: 58,
    borderRadius: 18,
    backgroundColor: '#6D5EF8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6D5EF8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});