import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from './firebaseConfig';
import { signOut } from "firebase/auth";

export default function ProfileScreen({ route, navigation }) {
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Get user email from route params or current auth state
    if (route.params?.userEmail) {
      setUserEmail(route.params.userEmail);
    } else if (auth.currentUser) {
      setUserEmail(auth.currentUser.email);
    }
  }, [route.params]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Let App.js auth listener handle navigation back to Login
    } catch (error) {
      alert('Error logging out: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to ClassX</Text>
        </View>

        <View style={styles.userInfoContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#6A3EA1" style={styles.userIcon} />
          <Text style={styles.welcomeText}>Hi, <Text style={styles.emailText}>{userEmail}</Text></Text>
          <Text style={styles.subtitleText}>You have successfully logged in</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6A3EA1',
    marginBottom: 8,
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  userIcon: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'medium',
    marginBottom: 8,
    textAlign: 'center',
  },
  emailText: {
    fontWeight: 'bold',
    color: '#6A3EA1',
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginTop: 20,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
