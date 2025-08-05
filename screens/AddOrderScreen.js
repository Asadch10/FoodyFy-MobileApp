import React, { useState } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, ScrollView, TextInput, Alert, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createOrder } from '../api/services/orderService';

const { width, height } = Dimensions.get('window');

const AddOrderScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [orderNumber, setOrderNumber] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [noteText, setNoteText] = useState('');
  const [selectedSauces, setSelectedSauces] = useState({});
  const [showSauceModal, setShowSauceModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [tempSauceSelection, setTempSauceSelection] = useState({});

  // Main menu items (Wraps, Burgers, Sides & Drinks, Sauces & Dips)
  const menuItems = [
    // Wraps
    { id: 1, name: 'Tortilla Wrap', price: 870, category: 'Wraps', description: '4 chicken tenderloin strips wrapped to perfection', requiresSauce: true },
    { id: 2, name: 'Smol Wrap', price: 580, category: 'Wraps', description: '2 chicken tenderloin strips wrapped to perfection', requiresSauce: true },
    { id: 3, name: 'Nugg Wrap', price: 580, category: 'Wraps', description: '4 whole-muscle chicken nuggets in a wrap', requiresSauce: true },
    
    // Burgers
    { id: 4, name: 'Wehshi Burger', price: 690, category: 'Burgers', description: 'Crispy & crunchy chicken burger', requiresSauce: true },
    { id: 5, name: 'Chicken Fillet Burger', price: 690, category: 'Burgers', description: 'Fried, breaded chicken fillet burger', requiresSauce: true },
    
    // Sauces & Dips (can be ordered separately)
    { id: 6, name: 'Atomic Dip', price: 100, category: 'Sauces & Dips', description: '', requiresSauce: false },
    { id: 7, name: 'Chipotle Dip', price: 100, category: 'Sauces & Dips', description: '', requiresSauce: false },
    { id: 8, name: 'Garlic Dip', price: 100, category: 'Sauces & Dips', description: '', requiresSauce: false },
    { id: 9, name: 'Mushroom Dip', price: 100, category: 'Sauces & Dips', description: '', requiresSauce: false },
    { id: 10, name: 'Greek Dip', price: 100, category: 'Sauces & Dips', description: '', requiresSauce: false },
    
    // Sides & Drinks
    { id: 11, name: 'Regular Fries', price: 220, category: 'Sides & Drinks', description: 'Crinkle cut fries', requiresSauce: false },
    { id: 12, name: 'Water', price: 90, category: 'Sides & Drinks', description: '500 ml', requiresSauce: false },
    { id: 13, name: 'Coke', price: 180, category: 'Sides & Drinks', description: '500 ml', requiresSauce: false },
    { id: 14, name: 'Sprite', price: 180, category: 'Sides & Drinks', description: '500 ml', requiresSauce: false },
  ];

  // Sauces and Dips (separate array)
  const saucesAndDips = [
    { id: 6, name: 'Atomic Dip', price: 100, category: 'Sauces & Dips', description: '' },
    { id: 7, name: 'Chipotle Dip', price: 100, category: 'Sauces & Dips', description: '' },
    { id: 8, name: 'Garlic Dip', price: 100, category: 'Sauces & Dips', description: '' },
    { id: 9, name: 'Mushroom Dip', price: 100, category: 'Sauces & Dips', description: '' },
    { id: 10, name: 'Greek Dip', price: 100, category: 'Sauces & Dips', description: '' },
  ];

  const handleSubmitOrder = () => {
    if (!orderNumber.trim()) {
      Alert.alert('Error', 'Please enter order number');
      return;
    }
    
    setShowMenu(true);
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getMenuByCategory = () => {
    const categories = {};
    menuItems.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });
    return categories;
  };

  const handleItemSelect = (item) => {
    if (item.requiresSauce) {
      // Show sauce selection modal for wraps and burgers
      setCurrentItem(item);
      setTempSauceSelection({});
      setShowSauceModal(true);
    } else {
      // Direct add for sides and drinks
      const existingItem = selectedItems.find(selected => selected.id === item.id);
      
      if (existingItem) {
        setSelectedItems(selectedItems.map(selected => 
          selected.id === item.id 
            ? { ...selected, quantity: selected.quantity + 1 }
            : selected
        ));
      } else {
        setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
      }
    }
  };

  const handleSauceSelect = (sauce) => {
    setSelectedSauces(prev => {
      const newSauces = { ...prev };
      if (newSauces[sauce.id]) {
        delete newSauces[sauce.id];
      } else {
        newSauces[sauce.id] = true;
      }
      return newSauces;
    });
  };

  const handleTempSauceSelect = (sauce) => {
    setTempSauceSelection(prev => {
      const newSauces = { ...prev };
      if (newSauces[sauce.id]) {
        delete newSauces[sauce.id];
      } else {
        // Check if already selected 2 sauces
        if (Object.keys(newSauces).length >= 2) {
          Alert.alert('Maximum Reached', 'You can select maximum 2 complimentary sauces.');
          return prev;
        }
        newSauces[sauce.id] = true;
      }
      return newSauces;
    });
  };

  const handleConfirmSauceSelection = () => {
    const selectedSauceCount = Object.keys(tempSauceSelection).length;
    
    if (selectedSauceCount === 0) {
      Alert.alert('Sauce Required', 'Please select at least 1 complimentary sauce.');
      return;
    }
    
    if (selectedSauceCount > 2) {
      Alert.alert('Too Many Sauces', 'You can select maximum 2 complimentary sauces.');
      return;
    }

    // Add item with selected sauces
    const selectedSaucesList = Object.keys(tempSauceSelection).map(sauceId => 
      saucesAndDips.find(sauce => sauce.id === parseInt(sauceId))
    ).filter(Boolean);

    const existingItem = selectedItems.find(selected => selected.id === currentItem.id);
    
    if (existingItem) {
      setSelectedItems(selectedItems.map(selected => 
        selected.id === currentItem.id 
          ? { ...selected, quantity: selected.quantity + 1 }
          : selected
      ));
    } else {
      const itemWithSauces = {
        ...currentItem,
        quantity: 1,
        selectedSauces: selectedSaucesList
      };
      setSelectedItems([...selectedItems, itemWithSauces]);
    }

    setShowSauceModal(false);
    setCurrentItem(null);
    setTempSauceSelection({});
  };

  const handleCancelSauceSelection = () => {
    setShowSauceModal(false);
    setCurrentItem(null);
    setTempSauceSelection({});
  };

  const handleItemRemove = (itemId) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleItemRemove(itemId);
      return;
    }
    
    setSelectedItems(selectedItems.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Please select at least one item');
      return;
    }

    try {
      const orderData = {
        orderNumber: orderNumber,
        items: selectedItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedSauces: item.selectedSauces || []
        })),
        instructions: noteText.trim(),
        totalPrice: calculateTotal()
      };

      await createOrder(orderData);
      
      Alert.alert(
        'Order Placed Successfully!',
        `Order ${orderNumber} has been sent to kitchen and is ready for preparation.\nTotal: Rs ${calculateTotal()}`,
        [
          {
            text: 'View Orders',
            onPress: () => navigation.navigate('ViewOrders')
          },
          {
            text: 'Add Another Order',
            onPress: () => {
              setOrderNumber('');
              setShowMenu(false);
              setSelectedItems([]);
              setNoteText('');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
      console.error('Order placement error:', error);
    }
  };

  const safeTopPadding = insets?.top || (Platform.OS === 'ios' ? 44 : 24);

  return (
    <View style={[styles.container, { paddingTop: safeTopPadding }]}>
      <StatusBar style="dark" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Order</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!showMenu ? (
          /* Table Number Input */
          <View style={styles.inputContainer}>
            <Text style={styles.sectionTitle}>Enter Order Number</Text>
            <View style={styles.inputCard}>
              <Ionicons name="receipt" size={24} color="#FFD700" />
              <TextInput
                style={styles.textInput}
                placeholder="Order No. / Table No. / Token No."
                placeholderTextColor="#A0AEC0"
                value={orderNumber}
                onChangeText={setOrderNumber}
                maxLength={20}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitOrder}>
              <Text style={styles.submitButtonText}>Continue to Menu</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          /* Menu Section */
          <View style={styles.menuContainer}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderText}>Order: {orderNumber}</Text>
              <TouchableOpacity onPress={() => setShowMenu(false)} style={styles.changeOrderButton}>
                <Text style={styles.changeOrderText}>Change</Text>
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <Text style={styles.sectionTitle}>Menu Items</Text>
            <View style={styles.menuGrid}>
              {Object.entries(getMenuByCategory()).map(([category, items]) => (
                <View key={category} style={styles.categoryContainer}>
                  <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(category)}
                  >
                    <View style={styles.categoryHeaderContent}>
                      <Text style={styles.categoryTitle}>{category}</Text>
                      <Text style={styles.categoryItemCount}>({items.length} items)</Text>
                    </View>
                    <Ionicons 
                      name={expandedCategories[category] ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#FFD700" 
                    />
                  </TouchableOpacity>
                  
                  {expandedCategories[category] && (
                    <View style={styles.categoryItems}>
                      {items.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.menuItem}
                          onPress={() => handleItemSelect(item)}
                        >
                          <View style={styles.menuItemContent}>
                            <Text style={styles.menuItemName}>{item.name}</Text>
                            {item.description ? (
                              <Text style={styles.menuItemDescription}>{item.description}</Text>
                            ) : null}
                            {item.requiresSauce && (
                              <Text style={styles.sauceRequired}>* Requires sauce selection</Text>
                            )}
                            <Text style={styles.menuItemPrice}>Rs {item.price}</Text>
                          </View>
                          <Ionicons name="add-circle" size={24} color="#FFD700" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>



            {/* Note Box */}
            <View style={styles.noteBoxContainer}>
              <Text style={styles.sectionTitle}>Special Instructions</Text>
              <View style={styles.noteBox}>
                <Ionicons name="create" size={20} color="#FFD700" />
                <TextInput
                  style={styles.noteInput}
                  placeholder="Add any special instructions, preferences, or notes..."
                  placeholderTextColor="#A0AEC0"
                  value={noteText}
                  onChangeText={setNoteText}
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Selected Items */}
            {selectedItems.length > 0 && (
              <View style={styles.selectedItemsContainer}>
                <Text style={styles.sectionTitle}>Selected Items</Text>
                {selectedItems.map((item) => (
                  <View key={item.id} style={styles.selectedItem}>
                    <View style={styles.selectedItemInfo}>
                      <Text style={styles.selectedItemName}>{item.name}</Text>
                      {item.selectedSauces && item.selectedSauces.length > 0 && (
                        <Text style={styles.selectedSaucesText}>
                          Sauces: {item.selectedSauces.map(sauce => sauce.name).join(', ')}
                        </Text>
                      )}
                      <Text style={styles.selectedItemPrice}>Rs {item.price}</Text>
                    </View>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        <Ionicons name="remove" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                
                <View style={styles.totalContainer}>
                  <Text style={styles.totalText}>Total: Rs {calculateTotal()}</Text>
                </View>

                <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
                  <Text style={styles.placeOrderButtonText}>Place Order</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#000000" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Sauce Selection Modal */}
      <Modal
        visible={showSauceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelSauceSelection}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select Complimentary Sauces for {currentItem?.name}
              </Text>
              <Text style={styles.modalSubtitle}>
                Choose 1-2 complimentary sauces (Free)
              </Text>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <View style={styles.modalSaucesGrid}>
                {saucesAndDips.map((sauce) => (
                  <TouchableOpacity
                    key={sauce.id}
                    style={[
                      styles.modalSauceItem,
                      tempSauceSelection[sauce.id] && styles.modalSauceItemSelected
                    ]}
                    onPress={() => handleTempSauceSelect(sauce)}
                  >
                    <View style={styles.modalSauceItemContent}>
                      <Text style={styles.modalSauceItemName}>{sauce.name}</Text>
                      <Text style={styles.modalSauceItemPrice}>Free</Text>
                    </View>
                    {tempSauceSelection[sauce.id] && (
                      <Ionicons name="checkmark-circle" size={24} color="#FFD700" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Text style={styles.modalSelectionText}>
                Selected: {Object.keys(tempSauceSelection).length}/2 sauces
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalCancelButton} 
                  onPress={handleCancelSauceSelection}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalConfirmButton} 
                  onPress={handleConfirmSauceSelection}
                >
                  <Text style={styles.modalConfirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#F8F9FA',
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
    backgroundColor: '#667EEA',
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
  inputContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 20,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
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
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    marginLeft: 15,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 10,
  },
  menuContainer: {
    padding: 20,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#667EEA',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  orderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  changeOrderButton: {
    padding: 8,
  },
  changeOrderText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '500',
  },
  menuGrid: {
    gap: 15,
  },
  noteBoxContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
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
  noteInput: {
    flex: 1,
    fontSize: 14,
    color: '#2D3748',
    marginLeft: 15,
    minHeight: 80,
  },
  sauceRequired: {
    fontSize: 11,
    color: '#FFD700',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  saucesContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  saucesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sauceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 12,
    minWidth: '48%',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sauceItemSelected: {
    borderColor: '#FFD700',
    backgroundColor: '#3A3A3A',
  },
  sauceItemContent: {
    flex: 1,
  },
  sauceItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  sauceItemPrice: {
    fontSize: 12,
    color: '#FFD700',
  },
  saucesSelectedText: {
    fontSize: 12,
    color: '#FFD700',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
  selectedSaucesText: {
    fontSize: 11,
    color: '#FFD700',
    marginBottom: 2,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#FFD700',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalSaucesGrid: {
    padding: 20,
    gap: 15,
  },
  modalSauceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  modalSauceItemSelected: {
    borderColor: '#667EEA',
    backgroundColor: '#EDF2F7',
  },
  modalSauceItemContent: {
    flex: 1,
  },
  modalSauceItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  modalSauceItemPrice: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalSelectionText: {
    fontSize: 14,
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5568',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  categoryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    overflow: 'hidden',
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
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#667EEA',
  },
  categoryHeaderContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  categoryItemCount: {
    fontSize: 12,
    color: '#FFD700',
  },
  categoryItems: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  menuItemCategory: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 11,
    color: '#718096',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  menuItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  selectedItemsContainer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
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
  selectedItemInfo: {
    flex: 1,
  },
  selectedItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 2,
  },
  selectedItemPrice: {
    fontSize: 12,
    color: '#FFD700',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#667EEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    minWidth: 20,
    textAlign: 'center',
  },
  totalContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  placeOrderButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 10,
  },
});

export default AddOrderScreen; 