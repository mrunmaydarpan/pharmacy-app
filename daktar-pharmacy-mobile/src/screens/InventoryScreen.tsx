import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import apiService from '../services/apiService';

export default function InventoryScreen({ navigation }: any) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMedicines();
      setMedicines(response.data.data);
    } catch (error) {
      console.error('Error loading medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.medicineCard}
      onPress={() => navigation.navigate('MedicineDetail', { medicineId: item.id })}
    >
      <View style={styles.medicineHeader}>
        <Text style={styles.medicineName}>{item.name}</Text>
        <Text style={styles.medicinePrice}>₹{item.selling_price}</Text>
      </View>
      <Text style={styles.medicineSubtitle}>{item.dosage} - {item.manufacturer}</Text>
      <View style={styles.medicineFooter}>
        <Text style={styles.stock}>Stock: {item.quantity_in_stock}</Text>
        <Text style={styles.expiry}>Exp: {new Date(item.expiry_date).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddMedicine')}
      >
        <Text style={styles.addButtonText}>+ Add Medicine</Text>
      </TouchableOpacity>

      <FlatList
        data={medicines}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        onRefresh={loadMedicines}
        refreshing={loading}
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
  medicineCard: {
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
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  medicinePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  medicineSubtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  medicineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stock: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  expiry: {
    fontSize: 12,
    color: '#ef4444',
  },
});
