import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Switch,
  Modal,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Filter, MessageCircle, MapPin, Star, Heart, Search, X, ChevronDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface User {
  id: string;
  name: string;
  age: number;
  rating: number;
  location: string;
  hourlyRate: number;
  profileImage: string;
  tags: string[];
  role: string;
  gender: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 28,
    rating: 4.8,
    location: 'Los Angeles, CA',
    hourlyRate: 45,
    profileImage: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Relationship Advice', 'Therapist'],
    role: 'Girlfriend',
    gender: 'Female'
  },
  {
    id: '2',
    name: 'Michael Chen',
    age: 32,
    rating: 4.9,
    location: 'San Francisco, CA',
    hourlyRate: 60,
    profileImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Life Coach', 'Mentor'],
    role: 'Friend',
    gender: 'Male'
  },
  {
    id: '3',
    name: 'Emma Wilson',
    age: 26,
    rating: 4.7,
    location: 'New York, NY',
    hourlyRate: 40,
    profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Listener', 'Support'],
    role: 'Listener',
    gender: 'Female'
  },
  {
    id: '4',
    name: 'David Rodriguez',
    age: 35,
    rating: 4.6,
    location: 'Chicago, IL',
    hourlyRate: 55,
    profileImage: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Career Advice', 'Father Figure'],
    role: 'Father',
    gender: 'Male'
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    age: 30,
    rating: 4.8,
    location: 'Miami, FL',
    hourlyRate: 50,
    profileImage: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Emotional Support', 'Mother Figure'],
    role: 'Mother',
    gender: 'Female'
  },
  {
    id: '6',
    name: 'Alex Kim',
    age: 29,
    rating: 4.5,
    location: 'Seattle, WA',
    hourlyRate: 42,
    profileImage: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Gaming', 'Tech Support'],
    role: 'Boyfriend',
    gender: 'Male'
  },
  {
    id: '7',
    name: 'Jessica Martinez',
    age: 27,
    rating: 4.9,
    location: 'Austin, TX',
    hourlyRate: 48,
    profileImage: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Wellness Coach', 'Meditation'],
    role: 'Friend',
    gender: 'Female'
  },
  {
    id: '8',
    name: 'Ryan O\'Connor',
    age: 31,
    rating: 4.7,
    location: 'Denver, CO',
    hourlyRate: 52,
    profileImage: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Fitness Coach', 'Motivator'],
    role: 'Boyfriend',
    gender: 'Male'
  },
  {
    id: '9',
    name: 'Sophia Lee',
    age: 25,
    rating: 4.8,
    location: 'Portland, OR',
    hourlyRate: 38,
    profileImage: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Art Therapy', 'Creative Support'],
    role: 'Listener',
    gender: 'Female'
  },
  {
    id: '10',
    name: 'Marcus Johnson',
    age: 38,
    rating: 4.6,
    location: 'Atlanta, GA',
    hourlyRate: 58,
    profileImage: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Business Mentor', 'Life Coach'],
    role: 'Father',
    gender: 'Male'
  },
  {
    id: '11',
    name: 'Isabella Garcia',
    age: 29,
    rating: 4.9,
    location: 'Phoenix, AZ',
    hourlyRate: 46,
    profileImage: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Relationship Coach', 'Therapist'],
    role: 'Girlfriend',
    gender: 'Female'
  },
  {
    id: '12',
    name: 'James Wilson',
    age: 33,
    rating: 4.5,
    location: 'Nashville, TN',
    hourlyRate: 44,
    profileImage: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Music Therapy', 'Creative Arts'],
    role: 'Friend',
    gender: 'Male'
  }
];

const popularLocations = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'Philadelphia, PA',
  'San Antonio, TX',
  'San Diego, CA',
  'Dallas, TX',
  'San Jose, CA'
];

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocalHosts, setShowLocalHosts] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Los Angeles, CA');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  
  // Filter states
  const [minAge, setMinAge] = useState('18');
  const [maxAge, setMaxAge] = useState('65');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedRating, setSelectedRating] = useState('Any');

  const roles = ['All Roles', 'Boyfriend', 'Girlfriend', 'Listener', 'Mother', 'Father', 'Friend'];
  const genders = ['All', 'Male', 'Female', 'Other'];
  const ratings = ['Any', '3+', '4+', '4.5+', '4.8+'];

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'All Roles' || user.role === selectedRole;
    const matchesGender = selectedGender === 'All' || user.gender === selectedGender;
    const matchesAge = user.age >= parseInt(minAge) && user.age <= parseInt(maxAge);
    
    let matchesRating = true;
    if (selectedRating !== 'Any') {
      const minRating = parseFloat(selectedRating.replace('+', ''));
      matchesRating = user.rating >= minRating;
    }

    return matchesSearch && matchesRole && matchesGender && matchesAge && matchesRating;
  });

  const handleLocationSelect = (location: string) => {
    setCurrentLocation(location);
    setShowLocationModal(false);
  };

  const handleUseCurrentLocation = () => {
    setCurrentLocation('Current Location');
    setShowLocationModal(false);
  };

  const handleMessagesPress = () => {
    router.push('/(tabs)/messages');
  };

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

  const renderUserCard = (user: User) => (
    <TouchableOpacity 
      key={user.id} 
      style={styles.userCard}
      onPress={() => {
        if (user.id === '1') {
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
          params: { userId: user.id }
        });
      }}
    >
      <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
      <View style={styles.userInfo}>
        <View style={styles.nameRatingRow}>
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.ratingContainer}>
            {renderStars(user.rating)}
            <Text style={styles.ratingText}>{user.rating}</Text>
          </View>
        </View>
        <Text style={styles.hourlyRate}>${user.hourlyRate}/hr</Text>
        <Text style={styles.location}>{user.location}</Text>
        <Text style={styles.tags}>{user.tags.join(' • ')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0f0518', '#1a0a2e', '#16213e', '#0f0518']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Heart size={24} color="#c77dff" fill="#c77dff" />
            <Text style={styles.logoText}>The Club</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.iconButton}>
              <Filter size={24} color="#c77dff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleMessagesPress} style={styles.iconButton}>
              <MessageCircle size={24} color="#c77dff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={20} color="#a855f7" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by username, interests, roles..."
              placeholderTextColor="#a855f7"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color="#a855f7" />
              </TouchableOpacity>
            )}
          </View>

          {/* Location and Local Host Bar */}
          <View style={styles.locationHostBar}>
            <TouchableOpacity style={styles.setLocationButton} onPress={() => setShowLocationModal(true)}>
              <MapPin size={16} color="#c77dff" />
              <Text style={styles.setLocationText}>Set Location</Text>
              <ChevronDown size={16} color="#c77dff" />
            </TouchableOpacity>
            
            <View style={styles.localHostToggle}>
              <Text style={styles.toggleText}>Local Hosts</Text>
              <Switch
                value={showLocalHosts}
                onValueChange={setShowLocalHosts}
                trackColor={{ false: '#333', true: '#c77dff' }}
                thumbColor={showLocalHosts ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Current Location Display */}
          <View style={styles.currentLocationContainer}>
            <Text style={styles.currentLocationText}>Current: {currentLocation}</Text>
          </View>

          {/* Discover People Section */}
          <View style={styles.discoverSection}>
            <Text style={styles.sectionTitle}>Discover People ({filteredUsers.length})</Text>
            <View style={styles.userGrid}>
              {filteredUsers.map(renderUserCard)}
            </View>
          </View>
        </ScrollView>

        {/* Location Modal */}
        <Modal visible={showLocationModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Set Location</Text>
                <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                  <X size={24} color="#c77dff" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.locationOption} onPress={handleUseCurrentLocation}>
                <MapPin size={20} color="#c77dff" />
                <Text style={styles.locationOptionText}>Use Current Location</Text>
              </TouchableOpacity>

              <View style={styles.searchLocationContainer}>
                <TextInput
                  style={styles.searchLocationInput}
                  placeholder="Search for a city or area"
                  placeholderTextColor="#a855f7"
                  value={locationSearch}
                  onChangeText={setLocationSearch}
                />
              </View>

              <Text style={styles.popularTitle}>Popular Locations</Text>
              <ScrollView style={styles.popularLocations}>
                {popularLocations.map((location, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.locationOption}
                    onPress={() => handleLocationSelect(location)}
                  >
                    <Text style={styles.locationOptionText}>{location}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Filter Modal */}
        <Modal visible={showFilterModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter Options</Text>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <X size={24} color="#c77dff" />
                </TouchableOpacity>
              </View>

              {/* Age Range */}
              <Text style={styles.filterLabel}>Age Range</Text>
              <View style={styles.ageRangeContainer}>
                <TextInput
                  style={styles.ageInput}
                  placeholder="Min"
                  placeholderTextColor="#a855f7"
                  value={minAge}
                  onChangeText={setMinAge}
                  keyboardType="numeric"
                />
                <Text style={styles.ageRangeText}>to</Text>
                <TextInput
                  style={styles.ageInput}
                  placeholder="Max"
                  placeholderTextColor="#a855f7"
                  value={maxAge}
                  onChangeText={setMaxAge}
                  keyboardType="numeric"
                />
              </View>

              {/* Relationship Role */}
              <Text style={styles.filterLabel}>Relationship Role</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleContainer}>
                {roles.map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[styles.roleChip, selectedRole === role && styles.selectedRoleChip]}
                    onPress={() => setSelectedRole(role)}
                  >
                    <Text style={[styles.roleText, selectedRole === role && styles.selectedRoleText]}>
                      {role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Gender */}
              <Text style={styles.filterLabel}>Gender</Text>
              <View style={styles.genderContainer}>
                {genders.map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[styles.genderButton, selectedGender === gender && styles.selectedGenderButton]}
                    onPress={() => setSelectedGender(gender)}
                  >
                    <Text style={[styles.genderText, selectedGender === gender && styles.selectedGenderText]}>
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Minimum Rating */}
              <Text style={styles.filterLabel}>Minimum Rating</Text>
              <View style={styles.ratingFilterContainer}>
                {ratings.map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[styles.ratingButton, selectedRating === rating && styles.selectedRatingButton]}
                    onPress={() => setSelectedRating(rating)}
                  >
                    <Text style={[styles.ratingButtonText, selectedRating === rating && styles.selectedRatingButtonText]}>
                      {rating}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#121212',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: '#9B61E5',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 15,
    padding: 8,
    backgroundColor: '#121212',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#9B61E5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#9B61E5',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  locationHostBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#9B61E5',
  },
  setLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  setLocationText: {
    color: '#9B61E5',
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
  },
  localHostToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleText: {
    color: '#9B61E5',
    fontSize: 14,
    marginRight: 8,
  },
  currentLocationContainer: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 20,
  },
  currentLocationText: {
    color: '#A0A0A0',
    fontSize: 14,
    opacity: 0.8,
  },
  discoverSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  userGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  userCard: {
    width: '48%',
    backgroundColor: '#121212',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#9B61E5',
    shadowColor: '#9B61E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  nameRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#A0A0A0',
    fontSize: 12,
    marginLeft: 4,
  },
  hourlyRate: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  location: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 5,
  },
  tags: {
    color: '#9B61E5',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(155, 97, 229, 0.3)',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(155, 97, 229, 0.2)',
  },
  locationOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
  },
  searchLocationContainer: {
    marginVertical: 15,
  },
  searchLocationInput: {
    backgroundColor: '#121212',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#9B61E5',
  },
  popularTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  popularLocations: {
    maxHeight: 200,
  },
  filterLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  ageRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ageInput: {
    backgroundColor: '#121212',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 16,
    width: '40%',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#9B61E5',
  },
  ageRangeText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  roleContainer: {
    marginBottom: 10,
  },
  roleChip: {
    backgroundColor: '#121212',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#9B61E5',
  },
  selectedRoleChip: {
    backgroundColor: '#9B61E5',
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  selectedRoleText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    backgroundColor: '#121212',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9B61E5',
  },
  selectedGenderButton: {
    backgroundColor: '#9B61E5',
  },
  genderText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  selectedGenderText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  ratingFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ratingButton: {
    backgroundColor: '#121212',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9B61E5',
  },
  selectedRatingButton: {
    backgroundColor: '#9B61E5',
  },
  ratingButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  selectedRatingButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});