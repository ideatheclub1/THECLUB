import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { Camera, Image as ImageIcon, FileText, X } from 'lucide-react-native';

const { height } = Dimensions.get('window');

interface CoverPhotoModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (imageUri: string) => void;
}

export default function CoverPhotoModal({ visible, onClose, onImageSelected }: CoverPhotoModalProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      scale.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const handleClose = () => {
    scale.value = withTiming(0, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onClose)();
    });
  };

  const handleOptionPress = async (option: 'camera' | 'gallery' | 'file') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      let result;
      
      switch (option) {
        case 'camera':
          // Request camera permissions
          const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
          if (!cameraPermission.granted) {
            Alert.alert('Permission Required', 'Camera permission is required to take photos.');
            return;
          }
          
          result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
          });
          break;
          
        case 'gallery':
          // Request media library permissions
          const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!galleryPermission.granted) {
            Alert.alert('Permission Required', 'Media library permission is required to select photos.');
            return;
          }
          
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
          });
          break;
          
        case 'file':
          result = await DocumentPicker.getDocumentAsync({
            type: 'image/*',
            copyToCacheDirectory: true,
          });
          break;
      }
      
      if (result && !result.canceled) {
        let imageUri;
        
        if (option === 'file') {
          // For DocumentPicker
          imageUri = (result as any).assets?.[0]?.uri || (result as any).uri;
        } else {
          // For ImagePicker
          imageUri = result.assets?.[0]?.uri;
        }
        
        if (imageUri) {
          onImageSelected(imageUri);
          handleClose();
        }
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
        
        <Animated.View style={[styles.modalContent, animatedStyle]}>
          <BlurView intensity={60} style={styles.blurContainer}>
            <LinearGradient
              colors={['rgba(10, 10, 10, 0.95)', 'rgba(45, 27, 105, 0.95)']}
              style={styles.gradient}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Change Cover Photo</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Options */}
              <View style={styles.options}>
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleOptionPress('gallery')}
                >
                  <View style={styles.optionIconContainer}>
                    <ImageIcon size={28} color="#8B5CF6" />
                  </View>
                  <Text style={styles.optionTitle}>Select from Gallery</Text>
                  <Text style={styles.optionDescription}>Choose an existing photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleOptionPress('file')}
                >
                  <View style={styles.optionIconContainer}>
                    <FileText size={28} color="#8B5CF6" />
                  </View>
                  <Text style={styles.optionTitle}>Choose a File</Text>
                  <Text style={styles.optionDescription}>Browse files on your device</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleOptionPress('camera')}
                >
                  <View style={styles.optionIconContainer}>
                    <Camera size={28} color="#8B5CF6" />
                  </View>
                  <Text style={styles.optionTitle}>Take a Photo</Text>
                  <Text style={styles.optionDescription}>Use camera to capture new photo</Text>
                </TouchableOpacity>
              </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: '85%',
    maxHeight: height * 0.6,
    borderRadius: 24,
    overflow: 'hidden',
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
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  options: {
    padding: 24,
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  optionDescription: {
    fontSize: 14,
    color: '#A0A0A0',
    fontFamily: 'Inter-Regular',
  },
});