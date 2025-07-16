import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, PatrickHand_400Regular } from '@expo-google-fonts/patrick-hand';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { DollarSign, Star } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.7;

interface Note {
  id: string;
  title: string;
  smallImage: string;
  fullImage: string;
  createdAt: string;
  type: 'sticky' | 'currency';
  amount?: number;
}

interface CurrencyNoteCardProps {
  note: Note;
  onImagePress: (note: Note) => void;
  index: number;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function CurrencyNoteCard({ note, onImagePress, index }: CurrencyNoteCardProps) {
  const [fontsLoaded] = useFonts({
    PatrickHand_400Regular,
  });

  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const shimmer = useSharedValue(0);

  // Generate slight rotation for realistic effect
  const baseRotation = (index % 2 === 0 ? 1 : -1) * (Math.random() * 3 + 1);

  React.useEffect(() => {
    rotation.value = withSpring(baseRotation, { damping: 20 });
    
    // Add shimmer effect
    shimmer.value = withSpring(1, { damping: 10 });
  }, []);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleImagePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onImagePress(note);
  };

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  const shadowAnimatedStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: interpolate(scale.value, [0.95, 1], [0.3, 0.5]),
      shadowRadius: interpolate(scale.value, [0.95, 1], [15, 20]),
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.7]),
    };
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AnimatedTouchableOpacity
      style={[styles.cardContainer, cardAnimatedStyle, shadowAnimatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#2D5016', '#4A7C59', '#2D5016']}
        style={styles.currencyCard}
      >
        {/* Decorative border */}
        <View style={styles.decorativeBorder} />
        
        {/* Shimmer effect */}
        <Animated.View style={[styles.shimmerOverlay, shimmerStyle]} />
        
        {/* Ornate corners */}
        <View style={styles.ornateCorners}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        
        {/* Header */}
        <View style={styles.currencyHeader}>
          <Text style={[styles.currencyTitle, { fontFamily: 'PatrickHand_400Regular' }]}>
            ACHIEVEMENT NOTE
          </Text>
          <View style={styles.serialNumber}>
            <Text style={styles.serialText}>#{note.id}</Text>
          </View>
        </View>
        
        {/* Content */}
        <View style={styles.currencyContent}>
          <View style={styles.amountSection}>
            <DollarSign size={24} color="#FFD700" />
            <Text style={[styles.amount, { fontFamily: 'PatrickHand_400Regular' }]}>
              {note.amount || 0}
            </Text>
          </View>
          
          <Text style={[styles.currencyDescription, { fontFamily: 'PatrickHand_400Regular' }]} numberOfLines={2}>
            {note.title}
          </Text>
          
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={handleImagePress}
          >
            <Image
              source={{ uri: note.smallImage }}
              style={styles.smallImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <Text style={[styles.tapText, { fontFamily: 'PatrickHand_400Regular' }]}>
                tap to view
              </Text>
            </View>
          </TouchableOpacity>
          
          <Text style={[styles.date, { fontFamily: 'PatrickHand_400Regular' }]}>
            Earned: {note.createdAt}
          </Text>
        </View>
        
        {/* Footer */}
        <View style={styles.currencyFooter}>
          <View style={styles.starPattern}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={8} color="#FFD700" fill="#FFD700" />
            ))}
          </View>
          <Text style={[styles.footerText, { fontFamily: 'PatrickHand_400Regular' }]}>
            VERIFIED ACHIEVEMENT
          </Text>
        </View>
      </LinearGradient>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: cardWidth,
    marginHorizontal: 8,
    shadowColor: '#2D5016',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  currencyCard: {
    borderRadius: 12,
    padding: 20,
    minHeight: 280,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  decorativeBorder: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    opacity: 0.6,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
  },
  ornateCorners: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#FFD700',
  },
  topLeft: {
    top: 8,
    left: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  topRight: {
    top: 8,
    right: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bottomLeft: {
    bottom: 8,
    left: 8,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bottomRight: {
    bottom: 8,
    right: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  currencyHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  currencyTitle: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: 'normal',
    letterSpacing: 1,
  },
  serialNumber: {
    marginTop: 4,
  },
  serialText: {
    fontSize: 10,
    color: '#A0C4A0',
    fontFamily: 'monospace',
  },
  currencyContent: {
    alignItems: 'center',
    flex: 1,
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  amount: {
    fontSize: 28,
    color: '#FFD700',
    fontWeight: 'normal',
    marginLeft: 8,
  },
  currencyDescription: {
    fontSize: 16,
    color: '#E8F5E8',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  smallImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    paddingVertical: 2,
  },
  tapText: {
    color: '#FFFFFF',
    fontSize: 8,
    textAlign: 'center',
    fontWeight: 'normal',
  },
  date: {
    fontSize: 12,
    color: '#A0C4A0',
    fontWeight: 'normal',
  },
  currencyFooter: {
    alignItems: 'center',
    marginTop: 16,
  },
  starPattern: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  footerText: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: 'normal',
    letterSpacing: 1,
  },
});