import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getOrders, updateOrderStatus, subscribeToOrders } from '../api/services/orderService';

const { width, height } = Dimensions.get('window');

const ViewOrdersScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState([]);


  // Subscribe to real-time orders from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToOrders((ordersData) => {
      setOrders(ordersData);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);



  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'placed': return '#4CAF50';
      case 'completed': return '#2196F3';
      default: return '#B8B8B8';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'placed': return 'Placed';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    } else if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    } else {
      return 'Unknown time';
    }
  };

  const safeTopPadding = insets?.top || (Platform.OS === 'ios' ? 44 : 24);

  return (
    <View style={[styles.container, { paddingTop: safeTopPadding }]}>
      <StatusBar style="light" backgroundColor="#1A1A1A" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View Orders</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={80} color="#B8B8B8" />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>Orders will appear here once placed</Text>
          </View>
        ) : (
          <View style={styles.ordersContainer}>
            {orders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
                    <Text style={styles.orderTime}>
                      {formatTimestamp(order.timestamp)}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                  </View>
                </View>

                <View style={styles.itemsContainer}>
                  <Text style={styles.sectionTitle}>Items:</Text>
                  {order.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>
                          {item.quantity}x {item.name}
                        </Text>
                        {item.selectedSauces && item.selectedSauces.length > 0 && (
                          <Text style={styles.itemSauces}>
                            Sauces: {item.selectedSauces.map(sauce => {
                              if (typeof sauce === 'string') {
                                return sauce;
                              } else if (sauce && typeof sauce === 'object') {
                                return sauce.name || sauce.id || 'Unknown Sauce';
                              } else {
                                return 'Unknown Sauce';
                              }
                            }).join(', ')}
                          </Text>
                        )}
                      </View>
                      <Text style={styles.itemPrice}>Rs {item.price * item.quantity}</Text>
                    </View>
                  ))}
                </View>

                {order.instructions && (
                  <View style={styles.noteContainer}>
                    <Text style={styles.noteLabel}>Special Instructions:</Text>
                    <Text style={styles.noteText}>{order.instructions}</Text>
                  </View>
                )}

                <View style={styles.orderFooter}>
                  <Text style={styles.totalText}>Total: Rs {order.totalPrice}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FF4444',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 34,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#B8B8B8',
    textAlign: 'center',
  },
  ordersContainer: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 12,
    color: '#B8B8B8',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  itemsContainer: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  itemSauces: {
    fontSize: 11,
    color: '#FFD700',
    fontStyle: 'italic',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  noteContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  noteText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#3A3A3A',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },


});

export default ViewOrdersScreen; 