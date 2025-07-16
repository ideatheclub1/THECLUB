import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { X, Camera, Upload } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface Achievement {
  id: string;
  title: string;
  smallImage: string;
  fullImage: string;
  createdAt: string;
}

interface AddAchievementModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (achievement: Omit<Achievement, 'id' | 'createdAt'>) => void;
}

export default function AddAchievementModal({ visible, onClose, onAdd }: AddAchievementModalProps) {
  const [title, setTitle] = useState('');
  const [smallImage, setSmallImage] = useState('');
  const [fullImage, setFullImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 20 });
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
      runOnJS(resetForm)();
    });
  };

  const resetForm = () => {
    setTitle('');
    setSmallImage('');
    setFullImage('');
    setIsSubmitting(false);
  };

  const pickImage = async (type: 'small' | 'full') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'small' ? [1, 1] : [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (type === 'small') {
        setSmallImage(result.assets[0].uri);
      } else {
        setFullImage(result.assets[0].uri);
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your achievement');
      return;
    }

    if (!smallImage || !fullImage) {
      Alert.alert('Error', 'Please select both preview and full images');
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      onAdd({
        title: title.trim(),
        smallImage,
        fullImage,
      });

      handleClose();
      Alert.alert('Success', 'Achievement added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add achievement. Please try again.');
    } finally {
      setIsSubmitting(false);
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
          <LinearGradient
            colors={['#1a0a2e', '#16213e', '#0f0518']}
            style={styles.modalGradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.modalTitle}>Add New Achievement</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Title Input */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>Achievement Title</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your achievement title..."
                  placeholderTextColor="#A0A0A0"
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                  multiline
                />
                <Text style={styles.charCount}>{title.length}/100</Text>
              </View>

              {/* Small Image */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>Preview Image</Text>
                <TouchableOpacity
                  style={styles.imageUpload}
                  onPress={() => pickImage('small')}
                >
                  {smallImage ? (
                    <Image source={{ uri: smallImage }} style={styles.previewImage} />
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Camera size={32} color="#9B61E5" />
                      <Text style={styles.uploadText}>Tap to select image</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Full Image */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>Full Image</Text>
                <TouchableOpacity
                  style={styles.imageUpload}
                  onPress={() => pickImage('full')}
                >
                  {fullImage ? (
                    <Image source={{ uri: fullImage }} style={styles.previewImageFull} />
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Upload size={32} color="#9B61E5" />
                      <Text style={styles.uploadText}>Tap to select image</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={isSubmitting ? ['#666666', '#555555'] : ['#9B61E5', '#7A4AE6']}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitText}>
                    {isSubmitting ? 'Adding...' : 'Add Achievement'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
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
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(155, 97, 229, 0.3)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 97, 229, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#A0A0A0',
    textAlign: 'right',
    marginTop: 4,
  },
  imageUpload: {
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(155, 97, 229, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    color: '#9B61E5',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  previewImageFull: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(155, 97, 229, 0.3)',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});