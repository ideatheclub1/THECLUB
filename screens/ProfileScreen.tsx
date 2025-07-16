import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
  FlatList,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Share2, Settings, Grid2x2 as Grid, Camera, UserPlus, UserMinus, MessageCircle, Crown, DollarSign, Shield, MapPin, Clock, CreditCard as Edit3, Chrome as Home, TrendingUp, ArrowRight, ArrowLeft, Flag, Bell, Heart, UserCheck, Clock3, X, ChevronLeft, ChevronRight, Star, Trophy } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts, PatrickHand_400Regular } from '@expo-google-fonts/patrick-hand';
import { Caveat_400Regular } from '@expo-google-fonts/caveat';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { mockUsers, mockPosts } from '../data/mockData';
import { Post, User } from '../types';
import FullScreenPostViewer from '../components/FullScreenPostViewer';
import AchievementsSection from '../components/AchievementsSection';

const { width } = Dimensions.get('window');
const imageSize = (width - 56) / 3;

interface Notification {
  id: string;
  type: 'like' | 'client_request' | 'previous_host';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  avatar?: string;
}

interface Photo {
  id: string;
  uri: string;
  caption?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    title: 'New Like',
    message: 'Sarah Johnson liked your profile',
    timestamp: '2 min ago',
    isRead: false,
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: '2',
    type: 'client_request',
    title: 'New Client Request',
    message: 'Michael Chen wants to book a 1-hour chat session',
    timestamp: '15 min ago',
    isRead: false,
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
];

const mockPhotos: { [userId: string]: Photo[] } = {
  '1': [
    { id: '1', uri: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Beautiful sunset' },
    { id: '2', uri: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'City lights' },
    { id: '3', uri: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Nature walk' },
    { id: '4', uri: 'https://images.pexels.com/photos/1181276/pexels-photo-1181276.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Coffee time' },
    { id: '5', uri: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Weekend vibes' },
    { id: '6', uri: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Art gallery' },
  ],
};

interface ProfileScreenProps {
  route?: {
    params?: {
      userId?: string;
    };
  };
}

export default function ProfileScreen({ route }: ProfileScreenProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId: string }>();
  
  const userId = route?.params?.userId || params?.userId || '1';
  const actualUserId = userId === 'me' ? '1' : userId;
  const isCurrentUser = userId === '1';
  
  const [user, setUser] = useState<User>(() => {
    const foundUser = mockUsers.find(u => u.id === actualUserId);
    return foundUser || mockUsers[0];
  });
  
  const [userPosts, setUserPosts] = useState<Post[]>(
    mockPosts.filter(post => post.user.id === actualUserId)
  );
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const [showFullScreenPost, setShowFullScreenPost] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState(0);

  // Animation values
  const notificationBounce = useSharedValue(0);
  const profileGlow = useSharedValue(0);

  // Font loading
  const [fontsLoaded] = useFonts({
    PatrickHand_400Regular,
    Caveat_400Regular,
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  React.useEffect(() => {
    if (unreadCount > 0) {
      notificationBounce.value = withRepeat(
        withSpring(1, { damping: 8, stiffness: 200 }),
        -1,
        true
      );
    } else {
      notificationBounce.value = withTiming(0);
    }
  }, [unreadCount]);

  React.useEffect(() => {
    profileGlow.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
  }, []);

  const handleUserPress = (userId: string) => {
    if (userId === '1') {
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
      params: { userId }
    });
  };

  const handleBookChat = () => {
    Alert.alert(
      'Book 1-Hour Chat',
      `Book a private conversation session with ${user.username} for $${user.hourlyRate}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Book Now', 
          onPress: () => Alert.alert('Success!', 'Chat session booked successfully. You will receive a confirmation shortly.') 
        }
      ]
    );
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setUser(prev => ({ ...prev, isFollowing: !isFollowing }));
    Alert.alert(
      isFollowing ? 'Unfollowed' : 'Following',
      `You are now ${isFollowing ? 'not following' : 'following'} ${user.username}`
    );
  };

  const handleBlock = () => {
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${user.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Block', style: 'destructive', onPress: () => Alert.alert('Blocked', `${user.username} has been blocked`) }
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing functionality would open here');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Profile settings would open here');
  };

  const handleMessages = () => {
    router.push('/messages');
  };

  const handleReportUser = () => {
    Alert.alert(
      'Report User',
      `Report ${user.username} for inappropriate behavior?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Report', 
          style: 'destructive',
          onPress: () => Alert.alert('Reported', `Thank you for reporting ${user.username}. We will review this report.`) 
        }
      ]
    );
  };

  const handleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  const handleHomeNavigation = () => {
    router.push('/(tabs)');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart size={16} color="#ff6b9d" fill="#ff6b9d" />;
      case 'client_request':
        return <UserCheck size={16} color="#10b981" />;
      case 'previous_host':
        return <MessageCircle size={16} color="#c77dff" />;
      default:
        return <Bell size={16} color="#c77dff" />;
    }
  };

  const handlePostPress = (post: Post) => {
    const postIndex = userPosts.findIndex(p => p.id === post.id);
    setSelectedPostIndex(postIndex);
    setShowFullScreenPost(true);
  };

  const handleCloseFullScreen = () => {
    setShowFullScreenPost(false);
  };

  const handleLike = (postId: string) => {
    setUserPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    );
  };

  const handleComment = (postId: string) => {
    Alert.alert('Comment', 'Comment functionality would be implemented here');
  };

  const handleNavigateToFeed = () => {
    router.push('/(tabs)');
  };

  const handleNavigateToTrending = () => {
    router.push('/(tabs)/trending');
  };

  const handleRegisterAsHost = () => {
    router.push('/host-registration');
  };

  const notificationAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: interpolate(notificationBounce.value, [0, 1], [1, 1.1]) }
      ],
    };
  });

  const profileGlowStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: interpolate(profileGlow.value, [0, 1], [0.4, 0.8]),
      shadowRadius: interpolate(profileGlow.value, [0, 1], [10, 20]),
    };
  });

  const renderPost = ({ item, index }: { item: Post; index: number }) => (
    <TouchableOpacity
      style={[styles.gridItem, { marginRight: (index + 1) % 3 === 0 ? 0 : 4 }]}
      onPress={() => handlePostPress(item)}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.gridImage} />
      ) : (
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.3)', 'rgba(139, 92, 246, 0.1)']}
          style={styles.gridPlaceholder}
        >
          <Text style={styles.gridPlaceholderText} numberOfLines={3}>
            {item.content}
          </Text>
        </LinearGradient>
      )}
      
      {item.isTrending && (
        <View style={styles.trendingIndicator}>
          <Text style={styles.trendingText}>🔥</Text>
        </View>
      )}
      
      <View style={styles.likeCountOverlay}>
        <Heart size={12} color="#FFFFFF" fill="#FFFFFF" />
        <Text style={styles.likeCountText}>{item.likes}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={12}
        color={index < Math.floor(rating) ? '#FFD700' : '#666'}
        fill={index < Math.floor(rating) ? '#FFD700' : 'transparent'}
      />
    ));
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2A1A55', '#1E0D36', '#0F0518', '#2A1A55']}
        style={styles.background}
      >
        {/* Modern Header */}
        <View style={styles.modernHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <View style={styles.glassmorphButton}>
              <ArrowLeft size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerIcons}>
            {isCurrentUser && (
              <Animated.View style={[styles.headerIcon, notificationAnimatedStyle]}>
                <TouchableOpacity onPress={handleNotifications}>
                  <View style={styles.glassmorphButton}>
                    <Bell size={20} color="#FFFFFF" />
                    {unreadCount > 0 && (
                      <View style={styles.notificationBadge}>
                        <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            )}
            
            <TouchableOpacity onPress={handleMessages} style={styles.headerIcon}>
              <View style={styles.glassmorphButton}>
                <MessageCircle size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Header with Gradient Background */}
          <View style={styles.profileHeaderSection}>
            <LinearGradient
              colors={['rgba(162, 89, 255, 0.3)', 'rgba(162, 89, 255, 0.1)', 'transparent']}
              style={styles.profileGradientBg}
            />
            
            {/* Centered Profile Image */}
            <View style={styles.centeredProfileContainer}>
              <Animated.View style={[styles.profileImageWrapper, profileGlowStyle]}>
                <Image source={{ uri: user.avatar }} style={styles.profileImage} />
                {user.isHost && (
                  <View style={styles.crownBadge}>
                    <Crown size={16} color="#FFD700" fill="#FFD700" />
                  </View>
                )}
              </Animated.View>
            </View>

            {/* User Info Centered */}
            <View style={styles.centeredUserInfo}>
              <Text style={styles.username}>{user.username}</Text>
              
              <View style={styles.locationAgeContainer}>
                <View style={styles.locationContainer}>
                  <MapPin size={14} color="#888888" />
                  <Text style={styles.locationText}>{user.location}</Text>
                </View>
                <Text style={styles.ageText}>• {user.age} years old</Text>
              </View>
              
              <Text style={styles.bio}>{user.bio}</Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userPosts.length}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>17.8K</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>856</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>

            {/* Rating */}
            {user.isHost && (
              <View style={styles.ratingSection}>
                <View style={styles.starsContainer}>
                  {renderStars(4.8)}
                </View>
                <Text style={styles.ratingNumber}>4.8</Text>
                <Text style={styles.ratingLabel}>Rating</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {isCurrentUser ? (
                <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
                  <LinearGradient
                    colors={['#A259FF', '#7A4AE6']}
                    style={styles.editProfileGradient}
                  >
                    <Edit3 size={16} color="#FFFFFF" />
                    <Text style={styles.editProfileText}>Edit Profile</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <View style={styles.socialButtons}>
                  <TouchableOpacity 
                    style={[styles.followButton, isFollowing && styles.followingButton]} 
                    onPress={handleFollow}
                  >
                    {isFollowing ? (
                      <UserMinus size={16} color="#ffffff" />
                    ) : (
                      <UserPlus size={16} color="#A259FF" />
                    )}
                    <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.messageButton} onPress={handleMessages}>
                    <MessageCircle size={16} color="#A259FF" />
                    <Text style={styles.messageButtonText}>Message</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Achievements Section - Only for current user */}
          {isCurrentUser && (
            <AchievementsSection />
          )}

          {/* Posts Grid Header */}
          <View style={styles.postsHeader}>
            <Grid size={20} color="#FFFFFF" />
            <Text style={styles.postsHeaderText}>Posts</Text>
          </View>

          {/* Posts Grid */}
          {userPosts.length > 0 ? (
            <FlatList
              data={userPosts}
              renderItem={renderPost}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.postsGrid}
              columnWrapperStyle={styles.row}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No posts yet</Text>
              <Text style={styles.emptySubtext}>
                {isCurrentUser ? 'Share your first story!' : `${user.username} hasn't posted yet`}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Full Screen Post Viewer */}
        <FullScreenPostViewer
          visible={showFullScreenPost}
          posts={userPosts}
          initialIndex={selectedPostIndex}
          onClose={handleCloseFullScreen}
          onLike={handleLike}
          onComment={handleComment}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  modernHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    zIndex: 10,
  },
  backButton: {
    zIndex: 1,
  },
  glassmorphButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#A259FF',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  profileHeaderSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    position: 'relative',
  },
  profileGradientBg: {
    position: 'absolute',
    top: -50,
    left: 0,
    right: 0,
    height: 200,
    zIndex: -1,
  },
  centeredProfileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageWrapper: {
    shadowColor: '#A259FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#A259FF',
  },
  crownBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  centeredUserInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  locationAgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#888888',
    marginLeft: 4,
  },
  ageText: {
    fontSize: 14,
    color: '#888888',
    marginLeft: 8,
  },
  bio: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#888888',
    marginTop: 2,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 2,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#888888',
  },
  actionButtons: {
    width: '100%',
  },
  editProfileButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  editProfileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  editProfileText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#A259FF',
    borderRadius: 12,
    paddingVertical: 14,
  },
  followingButton: {
    backgroundColor: '#A259FF',
  },
  followButtonText: {
    color: '#A259FF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  followingButtonText: {
    color: '#FFFFFF',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#A259FF',
    borderRadius: 12,
    paddingVertical: 14,
  },
  messageButtonText: {
    color: '#A259FF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  postsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  postsHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  postsGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gridItem: {
    width: imageSize,
    height: imageSize,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  gridPlaceholderText: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  trendingIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 2,
  },
  trendingText: {
    fontSize: 12,
  },
  likeCountOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2,
  },
  likeCountText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
});