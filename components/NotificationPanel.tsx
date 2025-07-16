import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { X, Heart, MessageCircle, UserPlus, AtSign, CircleAlert as AlertCircle, Trash2 } from 'lucide-react-native';

const { height } = Dimensions.get('window');

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
  user?: {
    id: string;
    username: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  isRead: boolean;
  postId?: string;
  postImage?: string;
}

interface NotificationPanelProps {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationPress: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string) => void;
  onDeleteNotification: (notificationId: string) => void;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    user: {
      id: '2',
      username: 'cosmic_soul',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    content: 'liked your post',
    timestamp: '2m ago',
    isRead: false,
    postId: '1',
    postImage: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: '2',
    type: 'comment',
    user: {
      id: '3',
      username: 'purple_vibes',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    content: 'commented on your post: "This is amazing! 🔥"',
    timestamp: '15m ago',
    isRead: false,
    postId: '2',
    postImage: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: '3',
    type: 'follow',
    user: {
      id: '4',
      username: 'neon_dreamer',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    content: 'started following you',
    timestamp: '1h ago',
    isRead: true,
  },
  {
    id: '4',
    type: 'mention',
    user: {
      id: '5',
      username: 'stellar_guide',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    content: 'mentioned you in a comment',
    timestamp: '2h ago',
    isRead: true,
    postId: '3',
  },
  {
    id: '5',
    type: 'system',
    content: 'Your profile was featured in trending creators!',
    timestamp: '1d ago',
    isRead: false,
  },
];

export default function NotificationPanel({ 
  visible, 
  onClose, 
  notifications = mockNotifications,
  onNotificationPress,
  onMarkAsRead,
  onDeleteNotification 
}: NotificationPanelProps) {
  const router = useRouter();
  const slideX = useSharedValue(300);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      slideX.value = withSpring(0, { damping: 15 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      slideX.value = withTiming(300, { duration: 250 });
      opacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: slideX.value }],
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const handleClose = () => {
    slideX.value = withTiming(300, { duration: 250 });
    opacity.value = withTiming(0, { duration: 250 }, () => {
      runOnJS(onClose)();
    });
  };

  const handleNotificationPress = (notification: Notification) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    
    // Route to appropriate content
    if (notification.type === 'follow' && notification.user) {
      router.push({
        pathname: '/ProfileScreen',
        params: { userId: notification.user.id }
      });
    } else if (notification.postId) {
      // Route to post details
      console.log('Navigate to post:', notification.postId);
    }
    
    onNotificationPress(notification);
    handleClose();
  };

  const handleDeleteNotification = (notificationId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDeleteNotification(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart size={18} color="#ff6b9d" fill="#ff6b9d" />;
      case 'comment':
        return <MessageCircle size={18} color="#8B5CF6" />;
      case 'follow':
        return <UserPlus size={18} color="#00D46A" />;
      case 'mention':
        return <AtSign size={18} color="#F59E0B" />;
      case 'system':
        return <AlertCircle size={18} color="#6366F1" />;
      default:
        return <AlertCircle size={18} color="#6B7280" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
        
        <Animated.View style={[styles.panel, animatedStyle]}>
          <BlurView intensity={60} style={styles.blurContainer}>
            <LinearGradient
              colors={['rgba(10, 10, 10, 0.95)', 'rgba(45, 27, 105, 0.95)']}
              style={styles.gradient}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Text style={styles.title}>Notifications</Text>
                  {unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{unreadCount}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Notifications List */}
              <ScrollView 
                style={styles.notificationsList}
                showsVerticalScrollIndicator={false}
              >
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <TouchableOpacity
                      key={notification.id}
                      style={[
                        styles.notificationItem,
                        !notification.isRead && styles.unreadNotification
                      ]}
                      onPress={() => handleNotificationPress(notification)}
                    >
                      <View style={styles.notificationContent}>
                        {/* Icon */}
                        <View style={styles.notificationIcon}>
                          {getNotificationIcon(notification.type)}
                        </View>

                        {/* User Avatar */}
                        {notification.user && (
                          <Image 
                            source={{ uri: notification.user.avatar }} 
                            style={styles.userAvatar}
                          />
                        )}

                        {/* Content */}
                        <View style={styles.notificationText}>
                          <Text style={styles.notificationContent}>
                            {notification.user && (
                              <Text style={styles.username}>
                                {notification.user.username}{' '}
                              </Text>
                            )}
                            <Text style={styles.content}>
                              {notification.content}
                            </Text>
                          </Text>
                          <Text style={styles.timestamp}>
                            {notification.timestamp}
                          </Text>
                        </View>

                        {/* Post Image */}
                        {notification.postImage && (
                          <Image 
                            source={{ uri: notification.postImage }} 
                            style={styles.postImage}
                          />
                        )}
                      </View>

                      {/* Actions */}
                      <View style={styles.notificationActions}>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteNotification(notification.id)}
                        >
                          <Trash2 size={14} color="#EF4444" />
                        </TouchableOpacity>
                      </View>

                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <View style={styles.unreadIndicator} />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <AlertCircle size={48} color="#6B7280" />
                    <Text style={styles.emptyTitle}>No notifications</Text>
                    <Text style={styles.emptySubtitle}>
                      You're all caught up!
                    </Text>
                  </View>
                )}
              </ScrollView>
            </LinearGradient>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '85%',
    maxWidth: 400,
  },
  blurContainer: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  notificationsList: {
    flex: 1,
    padding: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
    marginRight: 12,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    fontSize: 14,
    color: '#D1D5DB',
    fontFamily: 'Inter-Regular',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  postImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  notificationActions: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});