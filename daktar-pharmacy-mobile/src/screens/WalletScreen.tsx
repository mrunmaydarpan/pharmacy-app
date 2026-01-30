import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import apiService from '../services/apiService';
import Header from '../components/Header';

export default function WalletScreen() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPharmacyWalletTransactions();
      setBalance(response.data.balance || 0);
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0094b8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Wallet Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Pharmacy Wallet</Text>
          <Text style={styles.balanceAmount}>₹{balance.toFixed(2)}</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions Table */}
        <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDate]}>Date</Text>
            <Text style={[styles.tableHeaderText, styles.colType]}>Type</Text>
            <Text style={[styles.tableHeaderText, styles.colRef]}>Ref ID</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>Credit</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>Debit</Text>
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          ) : (
            transactions.map((transaction, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colDate]}>{formatDate(transaction.created_at)}</Text>
                <Text style={[styles.tableCell, styles.colType]}>{transaction.ref_type}</Text>
                <Text style={[styles.tableCell, styles.colRef]}>{transaction.ref_id}</Text>
                <Text style={[styles.tableCell, styles.colAmount, styles.creditText]}>
                  {transaction.credit ? `+₹${transaction.credit}` : '-'}
                </Text>
                <Text style={[styles.tableCell, styles.colAmount, styles.debitText]}>
                  {transaction.debit ? `-₹${transaction.debit}` : '-'}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  balanceCard: {
    backgroundColor: '#0094b8',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tableContainer: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableCell: {
    fontSize: 12,
    color: '#333',
  },
  colDate: {
    flex: 2.5,
  },
  colType: {
    flex: 1.5,
  },
  colRef: {
    flex: 1,
  },
  colAmount: {
    flex: 1,
    textAlign: 'right',
  },
  creditText: {
    color: '#10b981',
    fontWeight: '600',
  },
  debitText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
});
