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

const { width } = Dimensions.get('window');
const cardWidth = width * 0.65;

interface Note {
  id: string;
  title: string;
  smallImage: string;
  fullImage: string;
  createdAt: string;
  type: 'sticky' | 'currency';
  amount?: number;
}

interface StickyNoteCardProps {
  note: Note;
  onImagePress: (note: Note) => void;
  index: number;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const noteColors = [
  '#FFF59D', // Light yellow
  '#FFE0B2', // Light orange
  '#F8BBD9', // Light pink
  '#E1F5FE', // Light blue
  '#C8E6C9', // Light green
];

export default function StickyNoteCard({ note, onImagePress, index }: StickyNoteCardProps) {
  const [fontsLoaded] = useFonts({
    PatrickHand_400Regular,
  });

  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const wiggle = useSharedValue(0);

  // Generate random rotation and color for sticky note effect
  const baseRotation = (index % 2 === 0 ? 1 : -1) * (Math.random() * 6 + 2);
  const noteColor = noteColors[index % noteColors.length];

  React.useEffect(() => {
    rotation.value = withSpring(baseRotation, { damping: 20 });
    
    // Add subtle wiggle animation
    wiggle.value = withSpring(Math.random() * 0.5 - 0.25, { damping: 15 });
  }, []);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.95);
    wiggle.value = withSpring(Math.random() * 1 - 0.5, { damping: 10 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    wiggle.value = withSpring(0, { damping: 15 });
  };

  const handleImagePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onImagePress(note);
  };

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value + wiggle.value}deg` },
      ],
    };
  });

  const shadowAnimatedStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: interpolate(scale.value, [0.95, 1], [0.2, 0.3]),
      shadowRadius: interpolate(scale.value, [0.95, 1], [10, 15]),
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
      <View style={[styles.card, { backgroundColor: noteColor }]}>
        {/* Pin effect */}
        <View style={styles.pin} />
        
        {/* Peeling corner effect */}
        <View style={styles.peelingCorner}>
          <View style={[styles.peelingTriangle, { borderBottomColor: noteColor }]} />
          <View style={styles.peelingTriangleInner} />
        </View>
        
        {/* Ruled lines background */}
        <View style={styles.ruledLines}>
          {[...Array(9)].map((_, i) => (
            <View key={i} style={styles.ruledLine} />
          ))}
        </View>
        
        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={[styles.title, { fontFamily: 'PatrickHand_400Regular' }]} numberOfLines={3}>
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
            {note.createdAt}
          </Text>
        </View>
      </View>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: cardWidth,
    marginHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  card: {
    borderRadius: 8,
    padding: 16,
    minHeight: 240,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  pin: {
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 16,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  peelingCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
  },
  peelingTriangle: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderBottomColor: '#FFF59D',
  },
  peelingTriangleInner: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 16,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderBottomColor: '#FFFFFF',
  },
  ruledLines: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
  },
  ruledLine: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 14,
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'normal',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
    transform: [{ rotate: '0.5deg' }],
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  smallImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2D3748',
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
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 'normal',
  },
  date: {
    fontSize: 14,
    color: '#666666',
    fontWeight: 'normal',
    transform: [{ rotate: '-0.5deg' }],
  },
});