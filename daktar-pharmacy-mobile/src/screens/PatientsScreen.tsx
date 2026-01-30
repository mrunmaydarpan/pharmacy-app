import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import apiService from '../services/apiService';
import Header from '../components/Header';

export default function PatientsScreen({ navigation }: any) {
  const pharmacy = useSelector((state: RootState) => state.auth.pharmacy);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadPatients(1);
  }, []);

  const loadPatients = async (pageNum: number, append: boolean = false) => {
    if (!pharmacy?.id) {
      console.error('No pharmacy ID available');
      setLoading(false);
      return;
    }
    
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await apiService.getPatients(pharmacy.id, pageNum, 10);
      console.log('Patients API response:', response.data);
      const patientsData = response.data.bookings || [];
      const pagination = response.data.pagination || {};
      
      if (append) {
        setPatients(prev => [...prev, ...patientsData]);
      } else {
        setPatients(patientsData);
      }
      
      setTotalPages(pagination.totalPages || 1);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading patients:', error);
      if (!append) setPatients([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && page < totalPages) {
      loadPatients(page + 1, true);
    }
  };

  const handleCancelBooking = (patientId: number) => {
    setSelectedPatientId(patientId);
    setShowCancelModal(true);
  };

  const cancelBooking = async (patientId: number) => {
    setShowCancelModal(false);
    try {
      setLoading(true);
      const response = await apiService.deletePatient(patientId);
      
      const message = response.data?.message || 'Booking cancelled successfully';
      setResponseMessage({ title: 'Success', message, type: 'success' });
      setShowResponseModal(true);
      
      // Reload the list
      loadPatients(1);
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      const errorMessage = error.response?.data?.message || 'Failed to cancel booking';
      setResponseMessage({ title: 'Error', message: errorMessage, type: 'error' });
      setShowResponseModal(true);
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => 
    patient.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.patient_mobile?.includes(searchQuery)
  );

  const renderItem = ({ item }: any) => (
    <View style={styles.patientCard}>
      <View style={styles.cardContent}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.patient_name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        
        <View style={styles.patientInfo}>
          <View style={styles.headerRow}>
            <Text style={styles.patientName}>{item.patient_name || 'Unknown'}</Text>
          </View>
          
          <Text style={styles.phoneNumber}>📞 {item.patient_mobile || 'N/A'}</Text>
          
          {item.doctor_name && item.doctor_name !== 'N/A' && (
            <Text style={styles.doctorName} numberOfLines={1}>
              Dr: {item.doctor_name}
            </Text>
          )}
          
          <View style={styles.footer}>
            <View style={styles.appointmentInfo}>
              {item.date && (
                <Text style={styles.dateText}>
                  📅 {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              )}
              {item.slot && <Text style={styles.slotText}>🕐 {item.slot}</Text>}
            </View>
            
            {item.status && (
              <View style={[
                styles.statusBadge,
                item.status === 'COMPLETED' && styles.statusCompleted,
                item.status === 'CREATED' && styles.statusPending
              ]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            )}
          </View>
          
          {item.status === 'CREATED' && (
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => handleCancelBooking(item.id)}
            >
              <Text style={styles.cancelButtonText}>Cancel Booking</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#0094b8" />
      </View>
    );
  };

  if (loading && page === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0094b8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search a Patient"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.micIcon}>
            <Text style={styles.micIconText}>🎤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Patient Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddPatient')}
      >
        <Text style={styles.addButtonText}>+ Add New Patient</Text>
      </TouchableOpacity>

      {filteredPatients.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>No Patients Yet</Text>
          <Text style={styles.emptySubtitle}>Tap the button above to add your first patient</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPatients}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          onRefresh={() => loadPatients(1)}
          refreshing={loading && page === 1}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Cancel Booking</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to cancel this booking?
            </Text>
            
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonNo]}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.confirmButtonTextNo}>No</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonYes]}
                onPress={() => selectedPatientId && cancelBooking(selectedPatientId)}
              >
                <Text style={styles.confirmButtonTextYes}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Response Modal */}
      <Modal
        visible={showResponseModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResponseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.responseModal}>
            <View style={[
              styles.responseIcon,
              responseMessage.type === 'success' ? styles.responseIconSuccess : styles.responseIconError
            ]}>
              <Text style={styles.responseIconText}>
                {responseMessage.type === 'success' ? '✓' : '✕'}
              </Text>
            </View>
            
            <Text style={styles.responseTitle}>{responseMessage.title}</Text>
            <Text style={styles.responseText}>{responseMessage.message}</Text>
            
            <TouchableOpacity
              style={[
                styles.responseButton,
                responseMessage.type === 'success' ? styles.responseButtonSuccess : styles.responseButtonError
              ]}
              onPress={() => setShowResponseModal(false)}
            >
              <Text style={styles.responseButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  micIcon: {
    marginLeft: 10,
  },
  micIconText: {
    fontSize: 18,
  },
  addButton: {
    backgroundColor: '#0094b8',
    marginHorizontal: 15,
    marginVertical: 12,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#0094b8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  patientCard: {
    backgroundColor: '#f0f9fb',
    borderRadius: 15,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 15,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 15,
    backgroundColor: '#0094b8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  patientInfo: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  favoriteIcon: {
    padding: 4,
  },
  favoriteText: {
    fontSize: 24,
    color: '#0094b8',
  },
  phoneNumber: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  appointmentInfo: {
    flexDirection: 'row',
    gap: 10,
  },
  dateText: {
    fontSize: 11,
    color: '#666',
  },
  slotText: {
    fontSize: 11,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#999',
  },
  statusCompleted: {
    backgroundColor: '#10b981',
  },
  statusPending: {
    backgroundColor: '#f59e0b',
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonNo: {
    backgroundColor: '#e5e7eb',
  },
  confirmButtonYes: {
    backgroundColor: '#ef4444',
  },
  confirmButtonTextNo: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonTextYes: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  responseModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  responseIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  responseIconSuccess: {
    backgroundColor: '#10b981',
  },
  responseIconError: {
    backgroundColor: '#ef4444',
  },
  responseIconText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  responseTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  responseText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  responseButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  responseButtonSuccess: {
    backgroundColor: '#10b981',
  },
  responseButtonError: {
    backgroundColor: '#ef4444',
  },
  responseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
