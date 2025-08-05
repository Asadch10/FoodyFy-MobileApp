import { 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    doc, 
    query, 
    orderBy, 
    onSnapshot 
  } from 'firebase/firestore';
  import { db } from '../config';
  
  // Create new order
export const createOrder = async (orderData) => {
  try {
    const order = {
      orderNumber: orderData.orderNumber,
      tableNumber: orderData.tableNumber || '',
      items: orderData.items,
      instructions: orderData.instructions || '',
      totalPrice: orderData.totalPrice,
      status: 'placed',
      timestamp: new Date(),
      waiterId: 'waiter_001',
      waiterName: 'Asad'
    };

    const docRef = await addDoc(collection(db, 'orders'), order);
    return { id: docRef.id, ...order };
  } catch (error) {
    console.error('Error creating order:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check Firebase security rules.');
    } else if (error.code === 'unavailable') {
      throw new Error('Firebase is currently unavailable. Please try again.');
    } else {
      throw new Error('Failed to create order. Please check your connection.');
    }
  }
};
  
  // Get all orders
  export const getOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  };
  
  // Update order status
  export const updateOrderStatus = async (orderId, status) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status });
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };
  
  // Real-time orders listener
export const subscribeToOrders = (callback) => {
  const q = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));
  
  return onSnapshot(q, 
    (querySnapshot) => {
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(orders);
    },
    (error) => {
      console.error('Error listening to orders:', error);
      if (error.code === 'permission-denied') {
        console.error('Permission denied. Please check Firebase security rules.');
      } else if (error.code === 'unavailable') {
        console.error('Firebase is currently unavailable.');
      }
      // Return empty array on error
      callback([]);
    }
  );
};

// Test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    const testDoc = await addDoc(collection(db, 'test'), {
      test: true,
      timestamp: new Date()
    });
    console.log('Firebase connection test successful:', testDoc.id);
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
};