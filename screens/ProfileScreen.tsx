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
import { useFonts, PatrickHand_400Regular } from '@expo-google-fonts/patrick-hand';
import { Caveat_400Regular } from '@expo-google-fonts/caveat';
import * as SplashScreen from 'expo-splash-screen';
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
  const isCurrentUser = userId === '1';
  
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

  // Animation values
  const scrollY = useSharedValue(0);
  const profileGlow = useSharedValue(0);
  const buttonPulse = useSharedValue(0);
  const coverFade = useSharedValue(1);

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
    profileGlow.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
    
    buttonPulse.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

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

  const handleUploadCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      coverFade.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(setCoverImage)(result.assets[0].uri);
        coverFade.value = withTiming(1, { duration: 500 });
      });
    }
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

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100, 200],
      [0, 0.5, 1],
      'clamp'
    );
    
    return {
      opacity,
    };
  });

  const profileImageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, 150, 300],
      [1, 0.8, 0.6],
      'clamp'
    );
    
    const translateY = interpolate(
      scrollY.value,
      [0, 150, 300],
      [0, -20, -40],
      'clamp'
    );
    
    return {
      transform: [{ scale }, { translateY }],
      shadowOpacity: interpolate(profileGlow.value, [0, 1], [0.4, 0.8]),
      shadowRadius: interpolate(profileGlow.value, [0, 1], [15, 25]),
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: interpolate(buttonPulse.value, [0, 1], [1, 1.02]) }
      ],
      shadowOpacity: interpolate(buttonPulse.value, [0, 1], [0.3, 0.6]),
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
      [200, 250],
      [50, 0],
      'clamp'
    );
    
    const opacity = interpolate(
      scrollY.value,
      [200, 250],
      [0, 1],
      'clamp'
    );
    
    return {
      transform: [{ translateY }],
      opacity,
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
        size={14}
        color={index < Math.floor(rating) ? '#FFD700' : '#666'}
        fill={index < Math.floor(rating) ? '#FFD700' : 'transparent'}
      />
    ));
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Cosmic Background */}
      <LinearGradient
        colors={['#1a0033', '#2d1b69', '#16213e', '#0f0518']}
        style={styles.background}
      >
        {/* Star Pattern Overlay */}
        <View style={styles.starPattern}>
          {[...Array(50)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.star,
                {
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.8 + 0.2,
                }
              ]}
            />
          ))}
        </View>

        {/* Sticky Mini Header */}
        <Animated.View style={[styles.stickyHeader, headerAnimatedStyle, miniHeaderStyle]}>
          <BlurView intensity={80} style={styles.blurHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.miniHeaderTitle}>{user.username}</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerIcon}>
                <Bell size={20} color="#FFFFFF" />
              </TouchableOpacity>
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
          {/* Cover Image */}
          <View style={styles.coverContainer}>
            <Animated.View style={coverAnimatedStyle}>
              <ImageBackground
                source={{ uri: coverImage }}
                style={styles.coverImage}
                blurRadius={2}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0, 0, 0, 0.6)']}
                  style={styles.coverGradient}
                />
                {isCurrentUser && (
                  <TouchableOpacity
                    style={styles.coverEditButton}
                    onPress={handleUploadCover}
                  >
                    <BlurView intensity={60} style={styles.coverEditBlur}>
                      <Camera size={16} color="#FFFFFF" />
                    </BlurView>
                  </TouchableOpacity>
                )}
              </ImageBackground>
            </Animated.View>
          </View>

          {/* Profile Section */}
          <View style={styles.profileSection}>
            {/* Profile Image */}
            <Animated.View style={[styles.profileImageContainer, profileImageAnimatedStyle]}>
              <View style={styles.profileImageWrapper}>
                <Image source={{ uri: user.avatar }} style={styles.profileImage} />
                {user.isHost && (
                  <View style={styles.crownBadge}>
                    <Crown size={16} color="#FFD700" fill="#FFD700" />
                  </View>
                )}
              </View>
            </Animated.View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={styles.username}>{user.username}</Text>
              
              <View style={styles.locationContainer}>
                <MapPin size={14} color="#B794F6" />
                <Text style={styles.locationText}>{user.location}</Text>
                <Text style={styles.ageText}>• {user.age} years old</Text>
              </View>
              
              <Text style={styles.bio}>{user.bio}</Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#FF6B9D' }]}>{userPosts.length}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#4ECDC4' }]}>17.8K</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#FFE66D' }]}>856</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>

            {/* Rating Section */}
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
                <Animated.View style={[styles.editButton, buttonAnimatedStyle]}>
                  <TouchableOpacity onPress={handleEditProfile}>
                    <LinearGradient
                      colors={['#9B61E5', '#7C3AED', '#6D28D9']}
                      style={styles.editButtonGradient}
                    >
                      <Edit3 size={16} color="#FFFFFF" />
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
                      colors={isFollowing ? ['#4ECDC4', '#44B8B5'] : ['#9B61E5', '#7C3AED']}
                      style={styles.followButtonGradient}
                    >
                      {isFollowing ? (
                        <UserCheck size={16} color="#FFFFFF" />
                      ) : (
                        <UserPlus size={16} color="#FFFFFF" />
                      )}
                      <Text style={styles.followButtonText}>
                        {isFollowing ? 'Following' : 'Follow'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.messageButton} onPress={handleMessages}>
                    <BlurView intensity={60} style={styles.messageButtonBlur}>
                      <MessageCircle size={16} color="#FFFFFF" />
                      <Text style={styles.messageButtonText}>Message</Text>
                    </BlurView>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Bulletin Board Section */}
          <BulletinBoardSection isCurrentUser={isCurrentUser} />

          {/* Posts Section */}
          <View style={styles.postsSection}>
            <View style={styles.postsHeader}>
              <Grid size={20} color="#FFFFFF" />
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
                  {isCurrentUser ? 'Share your first story!' : `${user.username} hasn't posted yet`}
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
  starPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
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
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  miniHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIcon: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
  },
  coverContainer: {
    height: 200,
    marginBottom: -60,
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
    height: 100,
  },
  coverEditButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  coverEditBlur: {
    padding: 12,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    zIndex: 20,
  },
  profileImageContainer: {
    marginBottom: 20,
    shadowColor: '#9B61E5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#9B61E5',
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
  userInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#B794F6',
    marginLeft: 4,
  },
  ageText: {
    fontSize: 14,
    color: '#B794F6',
    marginLeft: 8,
  },
  bio: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#A0AEC0',
    marginTop: 2,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 24,
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
    color: '#A0AEC0',
    fontWeight: '400',
  },
  actionButtons: {
    width: '100%',
  },
  editButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#9B61E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  followButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  followingButton: {
    opacity: 0.8,
  },
  followButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  followButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  messageButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  messageButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  postsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  postsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  postsHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  postsGrid: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  gridItem: {
    width: imageSize,
    height: imageSize,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(155, 97, 229, 0.2)',
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
  likeCountOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
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
    color: '#A0AEC0',
    textAlign: 'center',
  },
});