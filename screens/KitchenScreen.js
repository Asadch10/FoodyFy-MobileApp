import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, ScrollView, Alert, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getOrders, updateOrderStatus, subscribeToOrders } from '../api/services/orderService';

const { width, height } = Dimensions.get('window');

const KitchenScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, placed, completed

  // Subscribe to real-time orders from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToOrders((ordersData) => {
      setOrders(ordersData);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Force refresh by re-subscribing
      const unsubscribe = subscribeToOrders((ordersData) => {
        setOrders(ordersData);
        setRefreshing(false);
      });
      return () => unsubscribe();
    } catch (error) {
      setRefreshing(false);
      console.error('Refresh error:', error);
    }
  };

  const handleStatusUpdate = (order, newStatus) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const confirmStatusUpdate = async () => {
    setLoading(true);
    
    try {
      await updateOrderStatus(selectedOrder.id, selectedOrder.newStatus);
      
      setLoading(false);
      setShowOrderModal(false);
      
      Alert.alert(
        'Status Updated Successfully!',
        `Order ${selectedOrder.orderNumber} status has been updated to ${getStatusText(selectedOrder.newStatus)}.`,
        [
          {
            text: 'OK',
            onPress: () => setSelectedOrder(null)
          }
        ]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to update order status. Please try again.');
      console.error('Status update error:', error);
    }
  };

  const cancelStatusUpdate = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

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

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'placed': return 'completed';
      case 'completed': return 'completed';
      default: return 'completed';
    }
  };

  const getStatusButtonText = (status) => {
    switch (status) {
      case 'placed': return 'Mark Complete';
      case 'completed': return 'Completed';
      default: return 'Update Status';
    }
  };

  const getStatusButtonColor = (status) => {
    switch (status) {
      case 'placed': return '#2196F3';
      case 'completed': return '#B8B8B8';
      default: return '#2196F3';
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

  const getFilteredOrders = () => {
    if (statusFilter === 'all') {
      return orders;
    }
    return orders.filter(order => order.status === statusFilter);
  };

  const getOrderCount = (status) => {
    return orders.filter(order => order.status === status).length;
  };

  const safeTopPadding = insets?.top || (Platform.OS === 'ios' ? 44 : 24);

  return (
    <View style={[styles.container, { paddingTop: safeTopPadding }]}>
      <StatusBar style="light" backgroundColor="#1A1A1A" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kitchen Dashboard</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterTab, statusFilter === 'all' && styles.activeFilterTab]}
          onPress={() => setStatusFilter('all')}
        >
          <Text style={[styles.filterText, statusFilter === 'all' && styles.activeFilterText]}>
            All ({orders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterTab, statusFilter === 'placed' && styles.activeFilterTab]}
          onPress={() => setStatusFilter('placed')}
        >
          <Text style={[styles.filterText, statusFilter === 'placed' && styles.activeFilterText]}>
            Cooking ({getOrderCount('placed')})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, statusFilter === 'completed' && styles.activeFilterTab]}
          onPress={() => setStatusFilter('completed')}
        >
          <Text style={[styles.filterText, statusFilter === 'completed' && styles.activeFilterText]}>
            Completed ({getOrderCount('completed')})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFD700"
            colors={["#FFD700"]}
          />
        }
      >
        {getFilteredOrders().length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={80} color="#B8B8B8" />
            <Text style={styles.emptyTitle}>No Orders</Text>
            <Text style={styles.emptySubtitle}>
              {statusFilter === 'all' 
                ? 'No orders have been placed yet' 
                : `No ${statusFilter} orders at the moment`
              }
            </Text>
          </View>
        ) : (
          <View style={styles.ordersContainer}>
            {getFilteredOrders().map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
                    <Text style={styles.orderTime}>
                      {formatTimestamp(order.timestamp)}
                    </Text>
                    {order.waiterName && (
                      <Text style={styles.waiterName}>Waiter: {order.waiterName}</Text>
                    )}
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
                  {order.status !== 'completed' && (
                    <TouchableOpacity 
                      style={[styles.statusButton, { backgroundColor: getStatusButtonColor(order.status) }]}
                      onPress={() => {
                        const newStatus = getNextStatus(order.status);
                        handleStatusUpdate(order, newStatus);
                      }}
                    >
                      <Text style={styles.statusButtonText}>
                        {getStatusButtonText(order.status)}
                      </Text>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Status Update Modal */}
      <Modal
        visible={showOrderModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelStatusUpdate}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="restaurant" size={40} color="#FFD700" />
              <Text style={styles.modalTitle}>Update Order Status</Text>
              <Text style={styles.modalSubtitle}>
                Order #{selectedOrder?.orderNumber}
              </Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                Current Status: {selectedOrder && getStatusText(selectedOrder.status)}
              </Text>
              <Text style={styles.modalText}>
                New Status: {selectedOrder && getStatusText(selectedOrder.newStatus)}
              </Text>
              <Text style={styles.modalText}>
                Items: {selectedOrder?.items.length} items
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={cancelStatusUpdate}
                disabled={loading}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmButton}
                onPress={confirmStatusUpdate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <>
                    <Text style={styles.modalConfirmButtonText}>Confirm</Text>
                    <Ionicons name="checkmark" size={16} color="#000000" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  refreshButton: {
    padding: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: '#FFD700',
  },
  filterText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#B8B8B8',
  },
  activeFilterText: {
    color: '#000000',
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
    alignItems: 'flex-start',
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
    marginBottom: 2,
  },
  waiterName: {
    fontSize: 12,
    color: '#FFD700',
    fontStyle: 'italic',
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
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    gap: 5,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    width: '85%',
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#B8B8B8',
    textAlign: 'center',
  },
  modalBody: {
    marginBottom: 25,
  },
  modalText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 15,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default KitchenScreen;
