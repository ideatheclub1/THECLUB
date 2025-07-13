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
import { Share2, Settings, Grid2x2 as Grid, Camera, UserPlus, UserMinus, MessageCircle, Crown, DollarSign, Shield, MapPin, Clock, CreditCard as Edit3, Chrome as Home, TrendingUp, ArrowRight, ArrowLeft, Flag, Bell, Heart, UserCheck, Clock3, X, ChevronLeft, ChevronRight, Star } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { mockUsers, mockPosts } from '../data/mockData';
import { Post, User } from '../types';
import FullScreenPostViewer from '../components/FullScreenPostViewer';

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 3; // 3 columns with padding

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
  {
    id: '3',
    type: 'previous_host',
    title: 'Previous Host Message',
    message: 'Emma Wilson sent you a message',
    timestamp: '1 hour ago',
    isRead: true,
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: '4',
    type: 'like',
    title: 'New Like',
    message: 'David Rodriguez liked your profile',
    timestamp: '3 hours ago',
    isRead: true,
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: '5',
    type: 'client_request',
    title: 'New Client Request',
    message: 'Lisa Thompson wants to schedule a session',
    timestamp: '1 day ago',
    isRead: true,
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150'
  }
];

// Mock photos for users
const mockPhotos: { [userId: string]: Photo[] } = {
  '1': [ // Current user photos
    { id: '1', uri: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Beautiful sunset' },
    { id: '2', uri: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'City lights' },
    { id: '3', uri: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Nature walk' },
    { id: '4', uri: 'https://images.pexels.com/photos/1181276/pexels-photo-1181276.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Coffee time' },
    { id: '5', uri: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Weekend vibes' },
    { id: '6', uri: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Art gallery' },
  ],
  '2': [ // neon_dreamer photos
    { id: '1', uri: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Digital art creation' },
    { id: '2', uri: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Neon nights' },
    { id: '3', uri: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Creative workspace' },
    { id: '4', uri: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Inspiration' },
  ],
  '3': [ // purple_vibes photos
    { id: '1', uri: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Purple dreams' },
    { id: '2', uri: 'https://images.pexels.com/photos/1181276/pexels-photo-1181276.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Aesthetic vibes' },
    { id: '3', uri: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Color therapy' },
    { id: '4', uri: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Purple rain' },
    { id: '5', uri: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Lavender fields' },
  ],
  '4': [ // cosmic_soul photos
    { id: '1', uri: 'https://images.pexels.com/photos/1181276/pexels-photo-1181276.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Stargazing night' },
    { id: '2', uri: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Cosmic meditation' },
    { id: '3', uri: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Universe connection' },
  ],
  '5': [ // cyber_punk photos
    { id: '1', uri: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Future tech' },
    { id: '2', uri: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Cyberpunk aesthetic' },
    { id: '3', uri: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Digital world' },
    { id: '4', uri: 'https://images.pexels.com/photos/1181276/pexels-photo-1181276.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Tech innovation' },
    { id: '5', uri: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Future is now' },
    { id: '6', uri: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Neon dreams' },
    { id: '7', uri: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Digital art' },
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
  
  // Get userId from route params or URL params, default to current user
  const userId = route?.params?.userId || params?.userId || '1';
  
  // If userId is "me", treat as current user
  const actualUserId = userId === 'me' ? '1' : userId;
  
  const isCurrentUser = userId === '1'; // Current user is luna_mystic (ID: '1')
  
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
    // Mark all notifications as read when opened
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

  const renderPost = ({ item, index }: { item: Post; index: number }) => (
    <TouchableOpacity
      style={[styles.gridItem, { marginRight: (index + 1) % 3 === 0 ? 0 : 8 }]}
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0f0518', '#1a0a2e', '#16213e', '#0f0518']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#c77dff" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleHomeNavigation} style={styles.headerIcon}>
              <Home size={20} color="#c77dff" />
            </TouchableOpacity>
            {!isCurrentUser && (
              <TouchableOpacity onPress={handleReportUser} style={styles.headerIcon}>
                <Flag size={20} color="#c77dff" />
              </TouchableOpacity>
            )}
            {isCurrentUser && (
              <TouchableOpacity onPress={handleNotifications} style={styles.headerIcon}>
                <Bell size={20} color="#c77dff" />
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleMessages} style={styles.messagesButton}>
              <MessageCircle size={20} color="#c77dff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Register as Host Section */}
        {isCurrentUser && !user.isHost && (
          <View style={styles.registerHostSection}>
            <Text style={styles.registerHostTitle}>Register as Host</Text>
            <Text style={styles.registerHostSubtitle}>
              Want to start earning? Share your expertise and connect with people who value meaningful conversations.
            </Text>
            <TouchableOpacity style={styles.registerHostButton} onPress={handleRegisterAsHost}>
              <LinearGradient
                colors={['#00D46A', '#059669']}
                style={styles.registerHostGradient}
              >
                <Text style={styles.registerHostText}>Register as Host</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Notifications Panel */}
          {showNotifications && isCurrentUser && (
            <View style={styles.notificationsPanel}>
              <Text style={styles.notificationsPanelTitle}>Notifications</Text>
              {notifications.map((notification) => (
                <View key={notification.id} style={[
                  styles.notificationItem,
                  !notification.isRead && styles.unreadNotification
                ]}>
                  <View style={styles.notificationIcon}>
                    {getNotificationIcon(notification.type)}
                  </View>
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationTimestamp}>{notification.timestamp}</Text>
                    </View>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                  </View>
                  {notification.avatar && (
                    <Image source={{ uri: notification.avatar }} style={styles.notificationAvatar} />
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Profile Header Section */}
          <View style={styles.profileSection}>
            {/* Profile Image and Stats */}
            <View style={styles.profileHeader}>
              <View style={styles.profileImageContainer}>
                <Image source={{ uri: user.avatar }} style={styles.profileImage} />
                {user.isHost && (
                  <View style={styles.hostBadge}>
                    <Crown size={12} color="#ffd700" />
                  </View>
                )}
              </View>
              
              {/* Profile Stats */}
              <View style={styles.statsContainer}>
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
            </View>

            {/* User Details */}
            <View style={styles.userDetailsSection}>
              <View style={styles.nameRatingContainer}>
                <Text style={styles.username}>{user.username}</Text>
                {user.isHost && (
                  <View style={styles.ratingContainer}>
                    {renderStars(4.8)}
                    <Text style={styles.ratingText}>4.8</Text>
                  </View>
                )}
              </View>
              
              {/* Location and Age */}
              <View style={styles.locationAgeContainer}>
                <View style={styles.locationContainer}>
                  <MapPin size={14} color="#a855f7" />
                  <Text style={styles.locationText}>{user.location}</Text>
                </View>
                <Text style={styles.ageText}>• {user.age} years old</Text>
              </View>
              
              {/* Bio */}
              <Text style={styles.bio}>{user.bio}</Text>
            </View>

            {/* Available for Chat Section */}
            {user.isHost && !isCurrentUser && (
              <View style={styles.availableChatSection}>
                <Text style={styles.availableChatTitle}>Available for Chat</Text>
                <TouchableOpacity style={styles.bookChatButton} onPress={handleBookChat}>
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={styles.bookChatGradient}
                  >
                    <MessageCircle size={20} color="#ffffff" />
                    <Text style={styles.bookChatText}>Book 1-Hour Chat</Text>
                    <View style={styles.priceTag}>
                      <DollarSign size={14} color="#000000" />
                      <Text style={styles.priceText}>{user.hourlyRate}/hr</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Response Time and Total Chats */}
                <View style={styles.responseTimeContainer}>
                  <Clock size={14} color="#10b981" />
                  <Text style={styles.responseTimeText}>Usually responds in {user.responseTime}</Text>
                </View>
                <View style={styles.totalChatsContainer}>
                  <MessageCircle size={14} color="#9B61E5" />
                  <Text style={styles.totalChatsText}>{user.totalChats} total chats completed</Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {isCurrentUser ? (
                // Current user: Show Edit Profile only
                <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
                  <Edit3 size={16} color="#e0aaff" />
                  <Text style={styles.editProfileText}>Edit Profile</Text>
                </TouchableOpacity>
              ) : (
                // Other users: Show Follow/Message/Block
                <View style={styles.socialButtons}>
                  <TouchableOpacity 
                    style={[styles.followButton, isFollowing && styles.followingButton]} 
                    onPress={handleFollow}
                  >
                    {isFollowing ? (
                      <UserMinus size={16} color="#ffffff" />
                    ) : (
                      <UserPlus size={16} color="#c77dff" />
                    )}
                    <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.messageButton} onPress={handleMessages}>
                    <MessageCircle size={16} color="#9B61E5" />
                    <Text style={styles.messageButtonText}>Message</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.blockButton} onPress={handleBlock}>
                    <Shield size={16} color="#ef4444" />
                    <Text style={styles.blockButtonText}>Block</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Posts Grid Header */}
          <View style={styles.postsHeader}>
            <Grid size={20} color="#e0aaff" />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    position: 'relative',
    backgroundColor: '#121212',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 10,
    padding: 8,
    backgroundColor: '#121212',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#9B61E5',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    padding: 8,
    backgroundColor: '#121212',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#9B61E5',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#9B61E5',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  messagesButton: {
    padding: 8,
    backgroundColor: '#121212',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#9B61E5',
  },
  notificationsPanel: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#121212',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#9B61E5',
    padding: 16,
  },
  notificationsPanelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(155, 97, 229, 0.1)',
  },
  unreadNotification: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#9B61E5',
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notificationTimestamp: {
    fontSize: 12,
    color: '#A0A0A0',
    opacity: 0.8,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#A0A0A0',
    lineHeight: 18,
  },
  notificationAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 8,
  },
  profileSection: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 20,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#9B61E5',
  },
  hostBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#121212',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 13,
    color: '#A0A0A0',
    marginTop: 2,
  },
  userDetailsSection: {
    marginBottom: 20,
  },
  nameRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#FFD700',
    marginLeft: 4,
    fontWeight: '600',
  },
  locationAgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#A0A0A0',
    marginLeft: 4,
  },
  ageText: {
    fontSize: 14,
    color: '#A0A0A0',
    marginLeft: 8,
  },
  bio: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  availableChatSection: {
    marginBottom: 20,
  },
  availableChatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  bookChatButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  bookChatGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    position: 'relative',
  },
  bookChatText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
    marginRight: 12,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 2,
  },
  responseTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  responseTimeText: {
    fontSize: 12,
    color: '#00D46A',
    marginLeft: 4,
  },
  totalChatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  totalChatsText: {
    fontSize: 12,
    color: '#9B61E5',
    marginLeft: 4,
  },
  actionButtons: {
    marginBottom: 20,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#9B61E5',
    borderRadius: 12,
    paddingVertical: 12,
  },
  editProfileText: {
    color: '#9B61E5',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  followButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#9B61E5',
    borderRadius: 12,
    paddingVertical: 12,
  },
  followingButton: {
    backgroundColor: '#9B61E5',
    borderColor: '#9B61E5',
  },
  followButtonText: {
    color: '#9B61E5',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  followingButtonText: {
    color: '#FFFFFF',
  },
  messageButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#9B61E5',
    borderRadius: 12,
    paddingVertical: 12,
  },
  messageButtonText: {
    color: '#9B61E5',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  blockButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#9B61E5',
    borderRadius: 12,
    paddingVertical: 12,
  },
  blockButtonText: {
    color: '#9B61E5',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  postsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  postsHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  postsGrid: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gridItem: {
    width: imageSize,
    height: imageSize,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
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
    backgroundColor: 'rgba(155, 97, 229, 0.2)',
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
  emptyState: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
  },
  registerHostSection: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#121212',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#9B61E5',
  },
  registerHostTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  registerHostSubtitle: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  registerHostButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  registerHostGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerHostText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});