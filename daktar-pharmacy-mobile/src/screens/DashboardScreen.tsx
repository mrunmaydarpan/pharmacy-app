import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Dimensions, SafeAreaView } from 'react-native';
import apiService from '../services/apiService';
import Header from '../components/Header';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

export default function DashboardScreen({ navigation }: any) {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specialities, setSpecialities] = useState<any[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    loadDoctors();
    loadSpecialities();
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await apiService.getDoctors();
      setDoctors(response.data.doctors || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const loadSpecialities = async () => {
    try {
      const response = await apiService.getSpecialities();
      setSpecialities(response.data.specialities || []);
    } catch (error) {
      console.error('Error loading specialities:', error);
    }
  };

  const categories = [
    { id: 1, name: 'Denteeth', icon: '🦷' },
    { id: 2, name: 'Theripist', icon: '🧘' },
    { id: 3, name: 'Surgeon', icon: '⚕️' },
    { id: 4, name: 'Cardiologist', icon: '❤️' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search a Doctor"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.micIcon}>
              <Text style={styles.micText}>🎤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Medical Center Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.banner}>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Medical Center</Text>
              <Text style={styles.bannerText}>
                Yorem ipsum dolor sit amet,{'\n'}consectetur adipiscing elit. Nunc{'\n'}vulputate libero et velit interdum,{'\n'}ac aliquet odio mattis.
              </Text>
            </View>
            <View style={styles.bannerImagePlaceholder}>
              <Text style={styles.doctorEmoji}>👩‍⚕️</Text>
            </View>
          </View>
          <View style={styles.pagination}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={[styles.dot, index === 1 && styles.activeDot]}
              />
            ))}
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {specialities.map((speciality) => (
              <TouchableOpacity key={speciality.id} style={styles.categoryCard}>
                {speciality.image_url ? (
                  <Image
                    source={{ uri: `https://daaktar.com${speciality.image_url}` }}
                    style={styles.categoryImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.categoryIconContainer}>
                    <Text style={styles.categoryIcon}>🏥</Text>
                  </View>
                )}
                <View style={styles.categoryOverlay}>
                  <Text style={styles.categoryName} numberOfLines={1}>{speciality.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* All Doctors Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Doctors</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {doctors.slice(0, 3).map((doctor) => (
            <View key={doctor.id} style={styles.doctorCard}>
              <View style={styles.doctorImageContainer}>
                {doctor.image_url ? (
                  <Image
                    source={{ uri: `https://daaktar.com${doctor.image_url}` }}
                    style={styles.doctorImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.doctorAvatar}>
                    <Text style={styles.doctorAvatarText}>
                      {doctor.name?.charAt(0).toUpperCase() || 'D'}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.doctorInfo}>
                <View style={styles.doctorHeader}>
                  <Text style={styles.doctorName}>Dr. {doctor.name}</Text>
                  <TouchableOpacity style={styles.favoriteIcon}>
                    <Text style={styles.heartIcon}>🤍</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.doctorDescription} numberOfLines={2}>
                  {doctor.speciality || 'Specialist Doctor'}{'\n'}
                  {doctor.designation || 'Medical Professional'}
                </Text>
                <View style={styles.doctorFooter}>
                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => navigation.navigate('AddPatient')}
                  >
                    <Text style={styles.bookButtonText}>Book</Text>
                  </TouchableOpacity>
                  <View style={styles.rating}>
                    <Text style={styles.starIcon}>⭐</Text>
                    <Text style={styles.ratingText}>5.0</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 30,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
  },
  searchIcon: {
    fontSize: isSmallDevice ? 18 : 20,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: isSmallDevice ? 13 : 15,
    color: '#333',
  },
  micIcon: {
    marginLeft: 10,
  },
  micText: {
    fontSize: isSmallDevice ? 18 : 20,
  },
  bannerContainer: {
    paddingHorizontal: width * 0.05,
    marginBottom: 20,
  },
  banner: {
    backgroundColor: '#17a2b8',
    borderRadius: 20,
    padding: width * 0.05,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: isSmallDevice ? 150 : 180,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  bannerText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#fff',
    lineHeight: 18,
    opacity: 0.9,
  },
  bannerImagePlaceholder: {
    width: isSmallDevice ? 100 : 120,
    height: isSmallDevice ? 100 : 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorEmoji: {
    fontSize: isSmallDevice ? 60 : 80,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  activeDot: {
    backgroundColor: '#17a2b8',
    width: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 18 : 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  seeAll: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#999',
  },
  categoriesScroll: {
    paddingLeft: width * 0.05,
  },
  categoryCard: {
    width: isSmallDevice ? 120 : 140,
    height: isSmallDevice ? 85 : 100,
    borderRadius: 15,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryIconContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#80cbc4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: isSmallDevice ? 28 : 32,
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: isSmallDevice ? 12 : 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  doctorCard: {
    flexDirection: 'row',
    backgroundColor: '#f0f9fb',
    borderRadius: 15,
    padding: isSmallDevice ? 12 : 16,
    marginHorizontal: width * 0.05,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  doctorImageContainer: {
    marginRight: isSmallDevice ? 12 : 16,
  },
  doctorImage: {
    width: isSmallDevice ? 80 : 100,
    height: isSmallDevice ? 100 : 120,
    borderRadius: 12,
  },
  doctorAvatar: {
    width: isSmallDevice ? 80 : 100,
    height: isSmallDevice ? 100 : 120,
    borderRadius: 12,
    backgroundColor: '#4db8e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorAvatarText: {
    fontSize: isSmallDevice ? 36 : 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  doctorName: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  favoriteIcon: {
    padding: 4,
  },
  heartIcon: {
    fontSize: isSmallDevice ? 20 : 24,
  },
  doctorDescription: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  doctorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookButton: {
    backgroundColor: '#17a2b8',
    paddingHorizontal: isSmallDevice ? 18 : 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: isSmallDevice ? 12 : 14,
    fontWeight: '600',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starIcon: {
    fontSize: 18,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
});
