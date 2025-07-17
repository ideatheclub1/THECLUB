import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Story, User } from '../types';

interface StoryCarouselProps {
  stories: Story[];
  currentUser: User;
  onAddStory: () => void;
  onStoryPress: (story: Story) => void;
}

export default function StoryCarousel({
  stories,
  currentUser,
  onAddStory,
  onStoryPress,
}: StoryCarouselProps) {
  const router = useRouter();

  const handleUserPress = (userId: string) => {
    if (userId === currentUser.id) {
      Alert.alert(
        'Your Profile',
        'You are viewing your own profile. To make changes, go to your settings.',
        [
          { text: 'OK', style: 'cancel' },
          { text: 'Go to Profile', onPress: () => router.push('/(tabs)/profile') }
        ]
      );
      return;
    }
    router.push({
      pathname: '/ProfileScreen',
      params: { userId }
    });
  };

  const StoryItem = ({ story, isCurrentUser = false }: { story?: Story; isCurrentUser?: boolean }) => {
    const glowAnimation = useSharedValue(0);

    React.useEffect(() => {
      if (!isCurrentUser) {
        glowAnimation.value = withRepeat(
          withTiming(1, { duration: 2500 }),
          -1,
          true
        );
      }
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
      if (isCurrentUser) return {};
      
      return {
        shadowOpacity: interpolate(glowAnimation.value, [0, 1], [0.3, 0.7]),
        shadowRadius: interpolate(glowAnimation.value, [0, 1], [8, 16]),
      };
    });

    return (
      <TouchableOpacity
        style={styles.storyContainer}
        onPress={isCurrentUser ? onAddStory : () => story && onStoryPress(story)}
      >
        <Animated.View style={[
          styles.storyImageContainer,
          !isCurrentUser && styles.activeStoryBorder,
          !isCurrentUser && animatedStyle
        ]}>
          <Image 
            source={{ uri: isCurrentUser ? currentUser.avatar : story?.user.avatar }} 
            style={styles.storyImage} 
          />
          {isCurrentUser && (
            <View style={styles.addButton}>
              <Plus size={12} color="#FFFFFF" strokeWidth={3} />
            </View>
          )}
        </Animated.View>
        <Text style={styles.storyUsername} numberOfLines={1}>
          {isCurrentUser ? 'My Club' : story?.user.username}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {/* Current User Story */}
        <StoryItem isCurrentUser={true} />

        {/* Other Stories */}
        {stories.map((story) => (
          <StoryItem key={story.id} story={story} />
        ))}
      </ScrollView>
      
      {/* Bottom divider */}
      <View style={styles.bottomDivider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    paddingTop: 16,
  },
  scrollView: {
    paddingBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  storyContainer: {
    alignItems: 'center',
    width: 70,
  },
  storyImageContainer: {
    position: 'relative',
    marginBottom: 8,
    padding: 2,
    borderRadius: 26,
  },
  activeStoryBorder: {
    backgroundColor: 'rgba(108, 92, 231, 0.3)',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  storyImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#1E1E1E',
  },
  addButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1E1E1E',
  },
  storyUsername: {
    color: '#F5F5F5',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    maxWidth: 70,
  },
  bottomDivider: {
    height: 0.5,
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    marginHorizontal: 0,
  },
});