import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Flame } from 'lucide-react-native';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import { mockPosts } from '../data/mockData';
import { Post } from '../types';

export default function TrendingScreen() {
  const router = useRouter();
  const [trendingPosts, setTrendingPosts] = useState<Post[]>(
    mockPosts.filter(post => post.isTrending)
  );

  const fireGlow = useSharedValue(0);

  React.useEffect(() => {
    fireGlow.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const fireAnimatedStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: interpolate(fireGlow.value, [0, 1], [0.3, 0.7]),
      shadowRadius: interpolate(fireGlow.value, [0, 1], [4, 10]),
    };
  });

  const handleLike = (postId: string) => {
    setTrendingPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  };

  const handleComment = (postId: string) => {
    // Handle comment functionality
  };

  const handleMessagesPress = () => {
    router.push('/(tabs)/messages');
  };

  const renderTrendingHeader = () => (
    <View style={styles.hotRightNowSection}>
      <View style={styles.hotRightNowHeader}>
        <Animated.View style={[styles.fireIconContainer, fireAnimatedStyle]}>
          <Flame size={14} color="#ff6b9d" fill="#ff6b9d" />
        </Animated.View>
        <Text style={styles.hotRightNowText}>Hot Right Now</Text>
      </View>
      
      <View style={styles.algorithmUpdateBar}>
        <Text style={styles.algorithmUpdateText}>
          Trending Algorithm Updated Every 5 Minutes
        </Text>
      </View>
    </View>
  );

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onLike={handleLike}
      onComment={handleComment}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header onMessagesPress={handleMessagesPress} />

      {trendingPosts.length > 0 ? (
        <FlatList
          data={trendingPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderTrendingHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          style={styles.flatList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Flame size={64} color="#9B61E5" style={styles.emptyIcon} />
          <Text style={styles.emptyText}>No trending posts right now</Text>
          <Text style={styles.emptySubtext}>Check back later for hot content!</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  flatList: {
    flex: 1,
  },
  hotRightNowSection: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
  },
  hotRightNowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fireIconContainer: {
    marginRight: 5,
    shadowColor: '#ff6b9d',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  hotRightNowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  algorithmUpdateBar: {
    backgroundColor: 'rgba(155, 97, 229, 0.1)',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(155, 97, 229, 0.2)',
  },
  algorithmUpdateText: {
    fontSize: 10,
    color: '#A0A0A0',
    textAlign: 'center',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    opacity: 0.5,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#A0A0A0',
    textAlign: 'center',
  },
});