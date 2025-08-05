import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { testFirebaseConnection } from '../api/services/orderService';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  // Test Firebase connection on component mount
  useEffect(() => {
    testFirebaseConnection().then(isConnected => {
      console.log('Firebase connection status:', isConnected ? 'Connected' : 'Failed');
    });
  }, []);

  const handleAddOrder = () => {
    navigation.navigate('AddOrder');
  };

  const handleViewOrders = () => {
    navigation.navigate('ViewOrders');
  };

  const handleKitchenView = () => {
    navigation.navigate('Kitchen');
  };

  const handleSettings = () => {
    console.log('Settings pressed');
  };

  // Calculate safe top padding with fallback
  const safeTopPadding = insets?.top || (Platform.OS === 'ios' ? 44 : 24);

  return (
    <View style={[styles.container, { paddingTop: safeTopPadding }]}>
      <StatusBar style="dark" backgroundColor="#F8F9FA" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Ionicons name="restaurant" size={32} color="#FFFFFF" />
              <Text style={styles.logoText}>Foody-Fy</Text>
            </View>
            <View style={styles.profileContainer}>
              <Ionicons name="person-circle" size={28} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Order Management</Text>
          
          <View style={styles.buttonGrid}>
            {/* Add New Order */}
            <TouchableOpacity style={styles.actionButton} onPress={handleAddOrder}>
              <View style={[styles.buttonIcon, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Add New Order</Text>
                <Text style={styles.buttonSubtext}>Take customer order</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#B8B8B8" />
            </TouchableOpacity>

            {/* View Orders */}
            <TouchableOpacity style={styles.actionButton} onPress={handleViewOrders}>
              <View style={[styles.buttonIcon, { backgroundColor: '#2196F3' }]}>
                <Ionicons name="list" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>View Orders</Text>
                <Text style={styles.buttonSubtext}>Manage all orders</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#B8B8B8" />
            </TouchableOpacity>

            {/* Kitchen Live View */}
            <TouchableOpacity style={styles.actionButton} onPress={handleKitchenView}>
              <View style={[styles.buttonIcon, { backgroundColor: '#FF5722' }]}>
                <Ionicons name="restaurant" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Kitchen View</Text>
                <Text style={styles.buttonSubtext}>Live kitchen updates</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#B8B8B8" />
            </TouchableOpacity>

            {/* Settings */}
            <TouchableOpacity style={styles.actionButton} onPress={handleSettings}>
              <View style={[styles.buttonIcon, { backgroundColor: '#9C27B0' }]}>
                <Ionicons name="settings" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Settings</Text>
                <Text style={styles.buttonSubtext}>App configuration</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#B8B8B8" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Quick Actions - Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.quickActionButton}>
          <Ionicons name="refresh" size={20} color="#4CAF50" />
          <Text style={styles.quickActionText}>Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <Ionicons name="notifications" size={20} color="#FF9800" />
          <Text style={styles.quickActionText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <Ionicons name="help-circle" size={20} color="#2196F3" />
          <Text style={styles.quickActionText}>Help</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#667EEA',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  profileContainer: {
    padding: 5,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: '#4A5568',
    marginBottom: 5,
    fontWeight: '600',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 20,
  },
  buttonGrid: {
    gap: 15,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  buttonIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  buttonContent: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 12,
    color: '#718096',
  },

  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  quickActionText: {
    fontSize: 11,
    color: '#4A5568',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
});

export default HomeScreen; 