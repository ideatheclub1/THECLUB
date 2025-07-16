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
  const crinkle = useSharedValue(0);

  // Generate slight rotation for realistic effect
  const baseRotation = (index % 2 === 0 ? 1 : -1) * (Math.random() * 3 + 1);

  React.useEffect(() => {
    rotation.value = withSpring(baseRotation, { damping: 20 });
  }, []);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    scale.value = withSpring(0.94);
    crinkle.value = withSpring(0.5);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    crinkle.value = withSpring(0);
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
        { perspective: 1000 },
        { rotateY: `${crinkle.value * 3}deg` },
      ],
    };
  });

  const shadowAnimatedStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: interpolate(scale.value, [0.94, 1], [0.4, 0.7]),
      shadowRadius: interpolate(scale.value, [0.94, 1], [20, 30]),
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
        colors={['#1B4332', '#2D5016', '#40531B', '#1B4332']}
        style={styles.currencyCard}
      >
        {/* Worn edges effect */}
        <View style={styles.wornEdges}>
          <View style={[styles.wornEdge, styles.topEdge]} />
          <View style={[styles.wornEdge, styles.bottomEdge]} />
          <View style={[styles.wornEdge, styles.leftEdge]} />
          <View style={[styles.wornEdge, styles.rightEdge]} />
        </View>
        
        {/* Ornate border pattern */}
        <View style={styles.ornatePattern}>
          <View style={styles.borderPattern} />
          <View style={[styles.borderPattern, styles.innerBorder]} />
        </View>
        
        {/* Vintage texture overlay */}
        <View style={styles.textureOverlay}>
          <View style={[styles.textureSpot, styles.spot1]} />
          <View style={[styles.textureSpot, styles.spot2]} />
          <View style={[styles.textureSpot, styles.spot3]} />
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
            <DollarSign size={28} color="#D4AF37" />
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
              <Star key={i} size={8} color="#D4AF37" fill="#D4AF37" />
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
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 15,
  },
  currencyCard: {
    borderRadius: 16,
    padding: 24,
    minHeight: 320,
    position: 'relative',
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  wornEdges: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  wornEdge: {
    position: 'absolute',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  topEdge: {
    top: 0,
    left: 20,
    right: 30,
    height: 2,
    borderRadius: 1,
  },
  bottomEdge: {
    bottom: 0,
    left: 25,
    right: 20,
    height: 2,
    borderRadius: 1,
  },
  leftEdge: {
    left: 0,
    top: 30,
    bottom: 25,
    width: 2,
    borderRadius: 1,
  },
  rightEdge: {
    right: 0,
    top: 20,
    bottom: 30,
    width: 2,
    borderRadius: 1,
  },
  ornatePattern: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
  },
  borderPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 12,
    opacity: 0.7,
  },
  innerBorder: {
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    opacity: 0.4,
  },
  textureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  textureSpot: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
  },
  spot1: {
    top: 40,
    left: 30,
    width: 30,
    height: 25,
  },
  spot2: {
    top: 200,
    right: 40,
    width: 25,
    height: 20,
  },
  spot3: {
    bottom: 80,
    left: 50,
    width: 35,
    height: 30,
  },
  currencyHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  currencyTitle: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: 'normal',
    letterSpacing: 2,
  },
  serialNumber: {
    marginTop: 6,
  },
  serialText: {
    fontSize: 11,
    color: '#A0C4A0',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  currencyContent: {
    alignItems: 'center',
    flex: 1,
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  amount: {
    fontSize: 32,
    color: '#D4AF37',
    fontWeight: 'normal',
    marginLeft: 8,
  },
  currencyDescription: {
    fontSize: 16,
    color: '#E8F5E8',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  smallImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    paddingVertical: 2,
  },
  tapText: {
    color: '#FFFFFF',
    fontSize: 9,
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
    marginTop: 20,
  },
  starPattern: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  footerText: {
    fontSize: 10,
    color: '#D4AF37',
    fontWeight: 'normal',
    letterSpacing: 1.5,
  },
});