import React from 'react';
import { StyleSheet, Text, View, Dimensions, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  return (
    <View style={styles.splashContainer}>
      <StatusBar style="light" />
      <Image 
        source={require('../spalsh.png')} 
        style={styles.splashImage}
        resizeMode="contain"
      />
      <Text style={styles.splashText}>Foody-Fy</Text>
      <Text style={styles.splashSubtext}>Your Food Companion</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashImage: {
    width: width * 0.8,
    height: height * 0.4,
    marginBottom: 30,
  },
  splashText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  splashSubtext: {
    fontSize: 20,
    color: '#B8B8B8',
    textAlign: 'center',
  },
});

export default SplashScreen; 