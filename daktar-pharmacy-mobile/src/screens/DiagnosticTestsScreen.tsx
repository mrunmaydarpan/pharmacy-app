import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import apiService from '../services/apiService';
import Header from '../components/Header';

export default function DiagnosticTestsScreen({ navigation }: any) {
  const pharmacy = useSelector((state: RootState) => state.auth.pharmacy);
  const [bookings, setBookings] = useState([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [expandedPatients, setExpandedPatients] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadBookings(1);
  }, []);

  const loadBookings = async (pageNum: number, append: boolean = false) => {
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
      
      const response = await apiService.getDiagnosticBookings(pharmacy.id, pageNum, 10);
      console.log('Diagnostic bookings:', response.data);
      
      const items = response.data.items || [];
      
      // Group bookings by patient
      const patientMap = new Map();
      items.forEach((item: any) => {
        const patientId = item.patient?.id;
        if (patientId) {
          if (!patientMap.has(patientId)) {
            patientMap.set(patientId, {
              patient: item.patient,
              bookings: []
            });
          }
          patientMap.get(patientId).bookings.push(item);
        }
      });
      
      const groupedPatients = Array.from(patientMap.values());
      
      if (append) {
        setPatients(prev => [...prev, ...groupedPatients]);
      } else {
        setPatients(groupedPatients);
      }
      
      setPage(pageNum);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && page < totalPages) {
      loadBookings(page + 1, true);
    }
  };

  const togglePatient = (patientId: number) => {
    setExpandedPatients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(patientId)) {
        newSet.delete(patientId);
      } else {
        newSet.add(patientId);
      }
      return newSet;
    });
  };

  const renderBookingItem = (booking: any) => (
    <View key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.testName}>{booking.test?.test_name || 'N/A'}</Text>
        <Text style={styles.amount}>₹{booking.amount || 'N/A'}</Text>
      </View>
      <Text style={styles.department}>Dept: {booking.test?.department || 'N/A'}</Text>
      <View style={styles.bookingFooter}>
        <Text style={styles.bookingDate}>
          {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'N/A'}
        </Text>
        <View style={[styles.statusBadge, booking.status === 'PAID' && styles.statusPaid]}>
          <Text style={styles.statusText}>{booking.status || 'PENDING'}</Text>
        </View>
      </View>
    </View>
  );

  const renderPatientItem = ({ item }: any) => {
    const isExpanded = expandedPatients.has(item.patient.id);
    const totalAmount = item.bookings.reduce((sum: number, b: any) => sum + parseFloat(b.amount || 0), 0);
    
    return (
      <View style={styles.patientCard}>
        <TouchableOpacity 
          style={styles.patientHeader}
          onPress={() => togglePatient(item.patient.id)}
        >
          <View style={styles.patientAvatar}>
            <Text style={styles.avatarText}>
              {item.patient.name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{item.patient.name}</Text>
            <Text style={styles.patientMobile}>📞 {item.patient.mobile}</Text>
          </View>
          <View style={styles.patientStats}>
            <Text style={styles.bookingsCount}>{item.bookings.length} booking(s)</Text>
            <Text style={styles.totalAmount}>₹{totalAmount.toFixed(2)}</Text>
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
          </View>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.bookingsList}>
            {item.bookings.map((booking: any) => renderBookingItem(booking))}
          </View>
        )}
      </View>
    );
  };

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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('BookTest')}
      >
        <Text style={styles.addButtonText}>+ Book Diagnostic Test</Text>
      </TouchableOpacity>

      <FlatList
        data={patients}
        renderItem={renderPatientItem}
        keyExtractor={(item) => item.patient.id.toString()}
        contentContainerStyle={styles.list}
        onRefresh={() => loadBookings(1)}
        refreshing={loading && page === 1}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No diagnostic bookings found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  addButton: {
    backgroundColor: '#667eea',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  patientCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  patientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0094b8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  patientMobile: {
    fontSize: 13,
    color: '#666',
  },
  patientStats: {
    alignItems: 'flex-end',
  },
  bookingsCount: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0094b8',
    marginBottom: 4,
  },
  expandIcon: {
    fontSize: 12,
    color: '#0094b8',
  },
  bookingsList: {
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 12,
  },
  bookingCard: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0094b8',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  amount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0094b8',
  },
  department: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingDate: {
    fontSize: 11,
    color: '#999',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  testCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  testPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
  },
  testCategory: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  testFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f59e0b',
  },
  statusCompleted: {
    backgroundColor: '#10b981',
  },
  statusPaid: {
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
