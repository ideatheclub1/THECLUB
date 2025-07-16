import React, { useState, useRef } from 'react';
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
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Share2, Settings, Grid2x2 as Grid, Camera, UserPlus, UserMinus, MessageCircle, Crown, DollarSign, Shield, MapPin, Clock, CreditCard as Edit3, Chrome as Home, TrendingUp, ArrowRight, ArrowLeft, Flag, Bell, Heart, UserCheck, Clock3, X, ChevronLeft, ChevronRight, Star, Trophy, Upload } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  useAnimatedScrollHandler,
  runOnJS,
} from 'react-native-reanimated';
import { mockUsers, mockPosts } from '../data/mockData';
import { Post, User } from '../types';
import FullScreenPostViewer from '../components/FullScreenPostViewer';
import BulletinBoardSection from '../components/BulletinBoardSection';
import CoverPhotoModal from '../components/CoverPhotoModal';
import NotificationPanel from '../components/NotificationPanel';

const { width, height } = Dimensions.get('window');
const imageSize = (width - 56) / 3;
const HEADER_HEIGHT = 100;
const PROFILE_IMAGE_SIZE = 120;

interface ProfileScreenProps {
  route?: {
    params?: {
      userId?: string;
    };
  };
}

export default function ProfileScreen({ route }: ProfileScreenProps) {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const params = useLocalSearchParams<{ userId: string }>();
  
  const userId = route?.params?.userId || params?.userId || '1';
  const actualUserId = userId === 'me' ? '1' : userId;
  const isCurrentUser = actualUserId === '1';
  
  const [user, setUser] = useState<User>(() => {
    const foundUser = mockUsers.find(u => u.id === actualUserId);
    return foundUser || mockUsers[0];
  });
  
  const [userPosts, setUserPosts] = useState<Post[]>(
    mockPosts.filter(post => post.user.id === actualUserId)
  );
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [showFullScreenPost, setShowFullScreenPost] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState(0);
  const [coverImage, setCoverImage] = useState('https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800');
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Animation values
  const scrollY = useSharedValue(0);
  const profileGlow = useSharedValue(0);
  const buttonPulse = useSharedValue(0);
  const coverFade = useSharedValue(1);
  const notificationBounce = useSharedValue(0);

  React.useEffect(() => {
    // Subtle glow animation for premium users
    if (user.isHost) {
      profileGlow.value = withRepeat(
        withTiming(1, { duration: 4000 }),
        -1,
        true
      );
    }
    
    // Subtle button pulse
    buttonPulse.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );

    // Notification bounce when there are unread notifications
    const unreadCount = 2; // Mock unread count
    if (unreadCount > 0) {
      notificationBounce.value = withRepeat(
        withSpring(1, { damping: 8 }),
        -1,
        true
      );
    }
  }, [user.isHost]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setUser(prev => ({ ...prev, isFollowing: !isFollowing }));
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing functionality would open here');
  };

  const handleMessages = () => {
    router.push('/messages');
  };

  const handleUploadCover = () => {
    setShowCoverModal(true);
  };

  const handleCoverImageSelected = (imageUri: string) => {
    coverFade.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(setCoverImage)(imageUri);
      coverFade.value = withTiming(1, { duration: 600 });
    });
  };

  const handlePostPress = (post: Post) => {
    const postIndex = userPosts.findIndex(p => p.id === post.id);
    setSelectedPostIndex(postIndex);
    setShowFullScreenPost(true);
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

  const handleNotificationPress = () => {
    setShowNotifications(true);
  };

  const handleNotificationItemPress = (notification: any) => {
    console.log('Notification pressed:', notification);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 150, 300],
      [0, 0.7, 1],
      'clamp'
    );
    
    return {
      opacity,
    };
  });

  const profileImageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, 200, 400],
      [1, 0.75, 0.5],
      'clamp'
    );
    
    const translateY = interpolate(
      scrollY.value,
      [0, 200, 400],
      [0, -30, -60],
      'clamp'
    );
    
    const glowOpacity = user.isHost ? interpolate(profileGlow.value, [0, 1], [0.3, 0.7]) : 0;
    
    return {
      transform: [{ scale }, { translateY }],
      shadowOpacity: glowOpacity,
      shadowRadius: interpolate(profileGlow.value, [0, 1], [10, 20]),
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: interpolate(buttonPulse.value, [0, 1], [1, 1.01]) }
      ],
      shadowOpacity: interpolate(buttonPulse.value, [0, 1], [0.2, 0.4]),
    };
  });

  const coverAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: coverFade.value,
    };
  });

  const miniHeaderStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [250, 300],
      [50, 0],
      'clamp'
    );
    
    const opacity = interpolate(
      scrollY.value,
      [250, 300],
      [0, 1],
      'clamp'
    );
    
    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  const notificationAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: interpolate(notificationBounce.value, [0, 1], [1, 1.1]) }
      ],
    };
  });

  const renderPost = ({ item, index }: { item: Post; index: number }) => (
    <TouchableOpacity
      style={[styles.gridItem, { marginRight: (index + 1) % 3 === 0 ? 0 : 6 }]}
      onPress={() => handlePostPress(item)}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.gridImage} />
      ) : (
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.1)']}
          style={styles.gridPlaceholder}
        >
          <Text style={styles.gridPlaceholderText} numberOfLines={3}>
            {item.content}
          </Text>
        </LinearGradient>
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
        size={16}
        color={index < Math.floor(rating) ? '#D4AF37' : '#4A4A4A'}
        fill={index < Math.floor(rating) ? '#D4AF37' : 'transparent'}
      />
    ));
  };

  return (
    <View style={styles.container}>
      {/* Sophisticated Dark Background */}
      <LinearGradient
        colors={['#0a0a0a', '#1a0f2e', '#2d1b69', '#0a0a0a']}
        style={styles.background}
      >
        {/* Subtle Nebula Stars */}
        <View style={styles.nebulaPattern}>
          {[...Array(30)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.nebulaStar,
                {
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.6 + 0.2,
                  transform: [{ scale: Math.random() * 0.8 + 0.2 }],
                }
              ]}
            />
          ))}
        </View>

        {/* Refined Sticky Mini Header */}
        <Animated.View style={[styles.stickyHeader, headerAnimatedStyle, miniHeaderStyle]}>
          <BlurView intensity={40} style={styles.blurHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.miniHeaderTitle}>{user.username}</Text>
            <View style={styles.headerRight}>
              <Animated.View style={notificationAnimatedStyle}>
                <TouchableOpacity style={styles.headerIcon} onPress={handleNotificationPress}>
                  <Bell size={20} color="#FFFFFF" />
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationText}>2</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
              <TouchableOpacity onPress={handleMessages} style={styles.headerIcon}>
                <MessageCircle size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>

        <Animated.ScrollView
          ref={scrollViewRef}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          {/* Elegant Cover Section */}
          <View style={styles.coverContainer}>
            <Animated.View style={coverAnimatedStyle}>
              <ImageBackground
                source={{ uri: coverImage }}
                style={styles.coverImage}
                blurRadius={1}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
                  style={styles.coverGradient}
                />
                {isCurrentUser && (
                  <TouchableOpacity
                    style={styles.coverEditButton}
                    onPress={handleUploadCover}
                  >
                    <BlurView intensity={30} style={styles.coverEditBlur}>
                      <Camera size={18} color="#FFFFFF" />
                    </BlurView>
                  </TouchableOpacity>
                )}
              </ImageBackground>
            </Animated.View>
          </View>

          {/* Refined Profile Section */}
          <View style={styles.profileSection}>
            {/* Premium Profile Image */}
            <Animated.View style={[styles.profileImageContainer, profileImageAnimatedStyle]}>
              <View style={styles.profileImageWrapper}>
                <Image source={{ uri: user.avatar }} style={styles.profileImage} />
                {user.isHost && (
                  <View style={styles.crownBadge}>
                    <Crown size={18} color="#D4AF37" fill="#D4AF37" />
                  </View>
                )}
                {user.isHost && <View style={styles.premiumGlow} />}
              </View>
            </Animated.View>

            {/* Clean Typography */}
            <View style={styles.userInfo}>
              <Text style={styles.username}>{user.username}</Text>
              
              <View style={styles.locationContainer}>
                <MapPin size={16} color="#9CA3AF" />
                <Text style={styles.locationText}>{user.location}</Text>
                <Text style={styles.ageText}>• {user.age}</Text>
              </View>
              
              <Text style={styles.bio}>{user.bio}</Text>
            </View>

            {/* Refined Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#D4AF37' }]}>{userPosts.length}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#C0C0C0' }]}>17.8K</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#4B5563' }]}>856</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>

            {/* Sophisticated Rating */}
            {user.isHost && (
              <View style={styles.ratingSection}>
                <View style={styles.starsContainer}>
                  {renderStars(4.8)}
                  <Text style={styles.ratingNumber}>4.8</Text>
                </View>
                <Text style={styles.ratingLabel}>Rating</Text>
              </View>
            )}

            {/* Elegant Action Buttons */}
            <View style={styles.actionButtons}>
              {isCurrentUser ? (
                <Animated.View style={[styles.editButton, buttonAnimatedStyle]}>
                  <TouchableOpacity onPress={handleEditProfile}>
                    <LinearGradient
                      colors={['#6366F1', '#8B5CF6', '#A855F7']}
                      style={styles.editButtonGradient}
                    >
                      <Edit3 size={18} color="#FFFFFF" />
                      <Text style={styles.editButtonText}>Edit Profile</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ) : (
                <View style={styles.socialButtons}>
                  <TouchableOpacity 
                    style={[styles.followButton, isFollowing && styles.followingButton]} 
                    onPress={handleFollow}
                  >
                    <LinearGradient
                      colors={isFollowing ? ['#6B7280', '#374151'] : ['#6366F1', '#8B5CF6']}
                      style={styles.followButtonGradient}
                    >
                      {isFollowing ? (
                        <UserCheck size={18} color="#FFFFFF" />
                      ) : (
                        <UserPlus size={18} color="#FFFFFF" />
                      )}
                      <Text style={styles.followButtonText}>
                        {isFollowing ? 'Following' : 'Follow'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.messageButton} onPress={handleMessages}>
                    <BlurView intensity={30} style={styles.messageButtonBlur}>
                      <MessageCircle size={18} color="#FFFFFF" />
                      <Text style={styles.messageButtonText}>Message</Text>
                    </BlurView>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Mature Bulletin Board */}
          <BulletinBoardSection isCurrentUser={isCurrentUser} />

          {/* Sophisticated Posts Grid */}
          <View style={styles.postsSection}>
            <View style={styles.postsHeader}>
              <Grid size={22} color="#FFFFFF" />
              <Text style={styles.postsHeaderText}>Posts</Text>
            </View>

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
                  {isCurrentUser ? 'Share your creative work' : `${user.username} hasn't posted yet`}
                </Text>
              </View>
            )}
          </View>
        </Animated.ScrollView>

        {/* Full Screen Post Viewer */}
        <FullScreenPostViewer
          visible={showFullScreenPost}
          posts={userPosts}
          initialIndex={selectedPostIndex}
          onClose={() => setShowFullScreenPost(false)}
          onLike={handleLike}
          onComment={handleComment}
        />

        {/* Cover Photo Modal */}
        <CoverPhotoModal
          visible={showCoverModal}
          onClose={() => setShowCoverModal(false)}
          onImageSelected={handleCoverImageSelected}
        />

        {/* Notification Panel */}
        <NotificationPanel
          visible={showNotifications}
          onClose={() => setShowNotifications(false)}
          notifications={notifications}
          onNotificationPress={handleNotificationItemPress}
          onMarkAsRead={handleMarkAsRead}
          onDeleteNotification={handleDeleteNotification}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  nebulaPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  nebulaStar: {
    position: 'absolute',
    width: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 0.5,
    shadowColor: '#E5E7EB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 100,
  },
  blurHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
  },
  miniHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIcon: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#000000',
  },
  notificationText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
  },
  coverContainer: {
    height: 220,
    marginBottom: -70,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  coverEditButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  coverEditBlur: {
    padding: 14,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
    zIndex: 20,
  },
  profileImageContainer: {
    marginBottom: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#374151',
  },
  premiumGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: PROFILE_IMAGE_SIZE + 4,
    height: PROFILE_IMAGE_SIZE + 4,
    borderRadius: 62,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    opacity: 0.6,
  },
  crownBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  username: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginLeft: 6,
    fontFamily: 'Inter-Regular',
  },
  ageText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginLeft: 12,
    fontFamily: 'Inter-Regular',
  },
  bio: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
    fontFamily: 'Inter-Regular',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ratingNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D4AF37',
    marginLeft: 12,
    fontFamily: 'Inter-SemiBold',
  },
  ratingLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  actionButtons: {
    width: '100%',
  },
  editButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 10,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  followButton: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  followingButton: {
    opacity: 0.8,
  },
  followButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  followButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  messageButton: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  messageButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  postsSection: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  postsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  postsHeaderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
    fontFamily: 'Inter-SemiBold',
  },
  postsGrid: {
    paddingBottom: 32,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gridItem: {
    width: imageSize,
    height: imageSize,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.2)',
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
    padding: 12,
  },
  gridPlaceholderText: {
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  likeCountOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  likeCountText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'Inter-SemiBold',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});