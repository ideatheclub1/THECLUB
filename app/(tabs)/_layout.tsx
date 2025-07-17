import { Tabs } from 'expo-router';
import { Chrome as Home, TrendingUp, Search, User, Play } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { View, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopColor: 'rgba(108, 92, 231, 0.2)',
          borderTopWidth: 0.5,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: '#6C5CE7',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: '#6C5CE7',
        tabBarInactiveTintColor: '#666666',
        tabBarShowLabel: false,
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const glowAnimation = useSharedValue(focused ? 1 : 0);
          
          React.useEffect(() => {
            glowAnimation.value = withSpring(focused ? 1 : 0, {
              damping: 15,
              stiffness: 200,
            });
          }, [focused]);

          const animatedStyle = useAnimatedStyle(() => {
            return {
              shadowOpacity: interpolate(glowAnimation.value, [0, 1], [0, 0.8]),
              shadowRadius: interpolate(glowAnimation.value, [0, 1], [0, 20]),
              transform: [
                { scale: interpolate(glowAnimation.value, [0, 1], [1, 1.1]) }
              ],
            };
          });

          let IconComponent = Home;
          if (route.name === 'reels') IconComponent = Play;
          else if (route.name === 'trending') IconComponent = TrendingUp;
          else if (route.name === 'search') IconComponent = Search;
          else if (route.name === 'profile') IconComponent = User;

          return (
            <Animated.View style={[styles.iconContainer, animatedStyle]}>
              <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
                <IconComponent 
                  size={focused ? 26 : 24} 
                  color={color} 
                  strokeWidth={focused ? 2.5 : 2}
                  fill={focused ? 'rgba(108, 92, 231, 0.1)' : 'transparent'}
                />
              </View>
            </Animated.View>
          );
        },
      })}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="reels" />
      <Tabs.Screen name="trending" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 0,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrapper: {
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
  },
});