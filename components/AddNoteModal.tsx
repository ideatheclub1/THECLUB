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
import { BlurView } from 'expo-blur';
import { useFonts, PatrickHand_400Regular } from '@expo-google-fonts/patrick-hand';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { X, Camera, Upload, FileText, DollarSign } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface Note {
  id: string;
  title: string;
  smallImage: string;
  fullImage: string;
  createdAt: string;
  type: 'sticky' | 'currency';
  amount?: number;
}

interface AddNoteModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (note: Omit<Note, 'id' | 'createdAt'>) => void;
}

export default function AddNoteModal({ visible, onClose, onAdd }: AddNoteModalProps) {
  const [fontsLoaded] = useFonts({
    PatrickHand_400Regular,
  });

  const [title, setTitle] = useState('');
  const [smallImage, setSmallImage] = useState('');
  const [fullImage, setFullImage] = useState('');
  const [noteType, setNoteType] = useState<'sticky' | 'currency'>('sticky');
  const [amount, setAmount] = useState('');
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
    setNoteType('sticky');
    setAmount('');
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
      Alert.alert('Error', 'Please enter a title for your note');
      return;
    }

    if (!smallImage || !fullImage) {
      Alert.alert('Error', 'Please select both preview and full images');
      return;
    }

    if (noteType === 'currency' && !amount.trim()) {
      Alert.alert('Error', 'Please enter an amount for the currency note');
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      onAdd({
        title: title.trim(),
        smallImage,
        fullImage,
        type: noteType,
        amount: noteType === 'currency' ? parseInt(amount) : undefined,
      });

      handleClose();
      Alert.alert('Success', 'Note added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!fontsLoaded) return null;

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
          <BlurView intensity={100} style={styles.blurContainer}>
            <LinearGradient
              colors={['rgba(26, 0, 51, 0.9)', 'rgba(45, 27, 105, 0.9)']}
              style={styles.gradient}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, { fontFamily: 'PatrickHand_400Regular' }]}>
                  Add New Note
                </Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Note Type Selection */}
                <View style={styles.typeSelection}>
                  <Text style={[styles.label, { fontFamily: 'PatrickHand_400Regular' }]}>
                    Note Type
                  </Text>
                  <View style={styles.typeButtons}>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        noteType === 'sticky' && styles.activeTypeButton
                      ]}
                      onPress={() => setNoteType('sticky')}
                    >
                      <FileText size={20} color={noteType === 'sticky' ? '#FFFFFF' : '#B794F6'} />
                      <Text style={[
                        styles.typeButtonText,
                        { fontFamily: 'PatrickHand_400Regular' },
                        noteType === 'sticky' && styles.activeTypeButtonText
                      ]}>
                        Sticky Note
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        noteType === 'currency' && styles.activeTypeButton
                      ]}
                      onPress={() => setNoteType('currency')}
                    >
                      <DollarSign size={20} color={noteType === 'currency' ? '#FFFFFF' : '#B794F6'} />
                      <Text style={[
                        styles.typeButtonText,
                        { fontFamily: 'PatrickHand_400Regular' },
                        noteType === 'currency' && styles.activeTypeButtonText
                      ]}>
                        Currency Note
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Title Input */}
                <View style={styles.inputSection}>
                  <Text style={[styles.label, { fontFamily: 'PatrickHand_400Regular' }]}>
                    {noteType === 'currency' ? 'Achievement Description' : 'Note Title'}
                  </Text>
                  <TextInput
                    style={[styles.textInput, { fontFamily: 'PatrickHand_400Regular' }]}
                    placeholder="Enter your note title..."
                    placeholderTextColor="#B794F6"
                    value={title}
                    onChangeText={setTitle}
                    maxLength={100}
                    multiline
                  />
                  <Text style={[styles.charCount, { fontFamily: 'PatrickHand_400Regular' }]}>
                    {title.length}/100
                  </Text>
                </View>

                {/* Amount Input for Currency Notes */}
                {noteType === 'currency' && (
                  <View style={styles.inputSection}>
                    <Text style={[styles.label, { fontFamily: 'PatrickHand_400Regular' }]}>
                      Amount Earned
                    </Text>
                    <TextInput
                      style={[styles.textInput, { fontFamily: 'PatrickHand_400Regular' }]}
                      placeholder="Enter amount (e.g., 100)"
                      placeholderTextColor="#B794F6"
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="numeric"
                    />
                  </View>
                )}

                {/* Small Image */}
                <View style={styles.inputSection}>
                  <Text style={[styles.label, { fontFamily: 'PatrickHand_400Regular' }]}>
                    Preview Image
                  </Text>
                  <TouchableOpacity
                    style={styles.imageUpload}
                    onPress={() => pickImage('small')}
                  >
                    {smallImage ? (
                      <Image source={{ uri: smallImage }} style={styles.previewImage} />
                    ) : (
                      <View style={styles.uploadPlaceholder}>
                        <Camera size={32} color="#B794F6" />
                        <Text style={[styles.uploadText, { fontFamily: 'PatrickHand_400Regular' }]}>
                          Tap to select image
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Full Image */}
                <View style={styles.inputSection}>
                  <Text style={[styles.label, { fontFamily: 'PatrickHand_400Regular' }]}>
                    Full Image
                  </Text>
                  <TouchableOpacity
                    style={styles.imageUpload}
                    onPress={() => pickImage('full')}
                  >
                    {fullImage ? (
                      <Image source={{ uri: fullImage }} style={styles.previewImageFull} />
                    ) : (
                      <View style={styles.uploadPlaceholder}>
                        <Upload size={32} color="#B794F6" />
                        <Text style={[styles.uploadText, { fontFamily: 'PatrickHand_400Regular' }]}>
                          Tap to select image
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <LinearGradient
                    colors={isSubmitting ? ['#666666', '#444444'] : ['#9B61E5', '#7C3AED']}
                    style={styles.submitGradient}
                  >
                    <Text style={[styles.submitText, { fontFamily: 'PatrickHand_400Regular' }]}>
                      {isSubmitting ? 'Adding Note...' : 'Add Note'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
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
    maxHeight: height * 0.85,
    borderRadius: 20,
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(155, 97, 229, 0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'normal',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  typeSelection: {
    marginBottom: 24,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B794F6',
    backgroundColor: 'rgba(183, 148, 246, 0.1)',
  },
  activeTypeButton: {
    backgroundColor: '#9B61E5',
    borderColor: '#9B61E5',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#B794F6',
    marginLeft: 8,
  },
  activeTypeButtonText: {
    color: '#FFFFFF',
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: 'normal',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B794F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 14,
    color: '#B794F6',
    textAlign: 'right',
    marginTop: 4,
  },
  imageUpload: {
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#B794F6',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(183, 148, 246, 0.1)',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    color: '#B794F6',
    fontSize: 16,
    marginTop: 8,
    fontWeight: 'normal',
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
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
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
    fontSize: 18,
    fontWeight: 'normal',
    color: '#FFFFFF',
  },
});