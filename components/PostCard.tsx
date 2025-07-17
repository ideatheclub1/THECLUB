import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Heart, MessageCircle, Share2, Bookmark, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';
import { Post } from '../types';
import { useComments } from '../contexts/CommentContext';
import CommentSystem from './CommentSystem';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
}

const { width } = Dimensions.get('window');

export default function PostCard({ post, onLike, onComment }: PostCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likes, setLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const { getCommentCount } = useComments();
  
  const likeScale = useSharedValue(1);
  const likeGlow = useSharedValue(0);
  const shareScale = useSharedValue(1);

  const handleLike = () => {
    // Heart bounce + glow animation
    likeScale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
    
    likeGlow.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 800 })
    );
    
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    onLike(post.id);
  };

  const handleShare = () => {
    // Ripple/expand animation
    shareScale.value = withSequence(
      withSpring(1.2, { damping: 6, stiffness: 200 }),
      withSpring(1, { damping: 6, stiffness: 200 })
    );
    Alert.alert('Share', 'Share functionality would be implemented here');
  };

  const handleCommentPress = () => {
    setShowComments(true);
  };

  const handleCloseComments = () => {
    setShowComments(false);
  };

  const handleUserPress = () => {
    if (post.user.id === '1') {
      Alert.alert(
        'Your Profile',
        'You are viewing your own profile. To make changes, go to your settings.',
        [
          { text: 'OK', style: 'cancel' },
          { 
            text: 'Go to Profile', 
            onPress: () => router.push('/(tabs)/profile')
          }
        ]
      );
      return;
    }
    router.push({
      pathname: '/ProfileScreen',
      params: { userId: post.user.id }
    });
  };

  const likeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: likeScale.value }],
      shadowOpacity: interpolate(likeGlow.value, [0, 1], [0, 0.8]),
      shadowRadius: interpolate(likeGlow.value, [0, 1], [0, 15]),
    };
  });

  const shareAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: shareScale.value }],
    };
  });

  const commentCount = getCommentCount(post.id);

  // Extract hashtags and create pill badges
  const renderCaption = () => {
    const maxLines = 3;
    const words = post.content.split(' ');
    const shouldTruncate = words.length > 20 && !showFullCaption;
    const displayText = shouldTruncate ? words.slice(0, 20).join(' ') + '...' : post.content;
    
    const parts = displayText.split(/(\#\w+)/g);
    
    return (
      <View style={styles.captionContainer}>
        <Text style={styles.caption}>
          <Text style={styles.captionUsername}>{post.user.username}</Text>{' '}
          {parts.map((part, index) => {
            if (part.startsWith('#')) {
              return (
                <View key={index} style={styles.hashtagPill}>
                  <Text style={styles.hashtagText}>{part}</Text>
                </View>
              );
            }
            return <Text key={index} style={styles.captionText}>{part}</Text>;
          })}
        </Text>
        {shouldTruncate && (
          <TouchableOpacity onPress={() => setShowFullCaption(true)}>
            <Text style={styles.readMore}>Read more</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.userInfo} onPress={handleUserPress}>
            <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
            <View style={styles.userDetails}>
              <Text style={styles.username}>{post.user.username}</Text>
              <Text style={styles.timestamp}>{post.timestamp}</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerRight}>
            {post.isTrending && (
              <View style={styles.trendingPill}>
                <Text style={styles.trendingText}>Trending</Text>
              </View>
            )}
            <TouchableOpacity style={styles.moreButton}>
              <MoreHorizontal size={18} color="#F5F5F5" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Image with padding */}
        <View style={styles.imageContainer}>
          {post.image && (
            <Image source={{ uri: post.image }} style={styles.postImage} />
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <View style={styles.leftActions}>
            <Animated.View style={[styles.actionButton, likeAnimatedStyle]}>
              <TouchableOpacity onPress={handleLike}>
                <Heart
                  size={26}
                  color={isLiked ? '#E74C3C' : '#F5F5F5'}
                  fill={isLiked ? '#E74C3C' : 'transparent'}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCommentPress}
            >
              <MessageCircle size={26} color="#F5F5F5" strokeWidth={2} />
            </TouchableOpacity>

            <Animated.View style={[styles.actionButton, shareAnimatedStyle]}>
              <TouchableOpacity onPress={handleShare}>
                <Share2 size={26} color="#F5F5F5" strokeWidth={2} />
              </TouchableOpacity>
            </Animated.View>
          </View>
          
          <View style={styles.rightActions}>
            <Text style={styles.engagementText}>{likes} likes</Text>
            <Text style={styles.engagementText}>{commentCount} comments</Text>
          </View>
        </View>

        {/* Caption with hashtag pills */}
        {renderCaption()}

        {/* Comments */}
        <TouchableOpacity onPress={handleCommentPress}>
          <Text style={styles.viewComments}>
            {commentCount > 0 ? `View all ${commentCount} comments` : 'Add a comment...'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Comment System */}
      <CommentSystem
        visible={showComments}
        onClose={handleCloseComments}
        postId={post.id}
        postType="feed"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#6C5CE7',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F5F5F5',
  },
  timestamp: {
    fontSize: 12,
    color: '#B0B0B0',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trendingPill: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  trendingText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  moreButton: {
    padding: 4,
  },
  imageContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: width - 32,
    resizeMode: 'cover',
    borderRadius: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 20,
    padding: 4,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 15,
    elevation: 0,
  },
  rightActions: {
    alignItems: 'flex-end',
  },
  engagementText: {
    fontSize: 13,
    color: '#B0B0B0',
    fontWeight: '500',
  },
  captionContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  captionUsername: {
    fontWeight: '600',
    color: '#F5F5F5',
  },
  captionText: {
    color: '#F5F5F5',
  },
  hashtagPill: {
    backgroundColor: 'rgba(108, 92, 231, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  hashtagText: {
    color: '#6C5CE7',
    fontSize: 14,
    fontWeight: '600',
  },
  readMore: {
    color: '#B0B0B0',
    fontSize: 14,
    marginTop: 4,
  },
  viewComments: {
    fontSize: 13,
    color: '#B0B0B0',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
});