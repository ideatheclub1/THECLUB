import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { MessageCircle, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface HeaderProps {
  onMessagesPress?: () => void;
}

export default function Header({ onMessagesPress }: HeaderProps) {
  const router = useRouter();
  const logoGlow = useSharedValue(0);
  const [unreadCount] = useState(2);

  React.useEffect(() => {
    logoGlow.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: interpolate(logoGlow.value, [0, 1], [0.4, 0.8]),
      shadowRadius: interpolate(logoGlow.value, [0, 1], [8, 20]),
    };
  });

  const handleMessagesPress = () => {
    router.push('/(tabs)/messages');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={styles.logoContent}>
              <Heart size={24} color="#E74C3C" fill="#E74C3C" />
              <Text style={styles.logo}>The Club</Text>
            </View>
          </Animated.View>
          
          <TouchableOpacity 
            onPress={handleMessagesPress} 
            style={styles.messagesButton}
          >
            <MessageCircle size={22} color="#F5F5F5" strokeWidth={2} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Subtle divider */}
        <View style={styles.divider} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#1E1E1E',
  },
  container: {
    backgroundColor: '#1E1E1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoContainer: {
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  logoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 26,
    fontWeight: '300',
    color: '#F5F5F5',
    letterSpacing: 0.5,
    marginLeft: 8,
    textShadowColor: '#6C5CE7',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  messagesButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#6C5CE7',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#1E1E1E',
  },
  notificationText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    marginHorizontal: 20,
  },
});