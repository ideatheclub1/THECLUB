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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.7;

interface Achievement {
  id: string;
  title: string;
  smallImage: string;
  fullImage: string;
  createdAt: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  onImagePress: (achievement: Achievement) => void;
  index: number;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function AchievementCard({ achievement, onImagePress, index }: AchievementCardProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  // Generate random rotation for sticky note effect
  const baseRotation = (index % 2 === 0 ? 1 : -1) * (Math.random() * 4 + 2);

  React.useEffect(() => {
    rotation.value = withSpring(baseRotation, { damping: 20 });
  }, []);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleImagePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onImagePress(achievement);
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
      shadowOpacity: interpolate(scale.value, [0.95, 1], [0.15, 0.25]),
      shadowRadius: interpolate(scale.value, [0.95, 1], [8, 12]),
    };
  });

  return (
    <AnimatedTouchableOpacity
      style={[styles.cardContainer, cardAnimatedStyle, shadowAnimatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[
          index % 3 === 0 ? '#FFE066' : index % 3 === 1 ? '#66E0FF' : '#FF66E0',
          index % 3 === 0 ? '#FFD93D' : index % 3 === 1 ? '#3DD4FF' : '#FF3DD4',
        ]}
        style={styles.card}
      >
        {/* Pin effect */}
        <View style={styles.pin} />
        
        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={3}>
            {achievement.title}
          </Text>
          
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={handleImagePress}
          >
            <Image
              source={{ uri: achievement.smallImage }}
              style={styles.smallImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <Text style={styles.tapText}>Tap to view</Text>
            </View>
          </TouchableOpacity>
          
          <Text style={styles.date}>{achievement.createdAt}</Text>
        </View>
      </LinearGradient>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: cardWidth,
    marginHorizontal: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    minHeight: 200,
    position: 'relative',
  },
  pin: {
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 16,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
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
    borderColor: '#333333',
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
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
});