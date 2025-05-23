import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Alert, TextInput, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveProfileImage, loadProfileImage, clearProfileImageCache } from './ProfileImageManager';


export default function ProfileScreen({ route, navigation }) {
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('Your Name');
  const [profileImage, setProfileImage] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Subscribe to auth state changes and load basic profile info
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('DEBUG: User ID:', user.uid);
        console.log('DEBUG: User email:', user.email);
        console.log('DEBUG: User displayName:', user.displayName);
        
        setUserEmail(user.email || '');
        setUserName(user.displayName || 'Your Name');
        setNewName(user.displayName || '');
        
        // Load profile image using the utility function
        try {
          const result = await loadProfileImage();
          if (result.success) {
            console.log(`DEBUG: Profile image loaded from ${result.source}`);
            setProfileImage(result.imageUri);
          } else {
            console.log('DEBUG: No profile image found for user');
          }
        } catch (error) {
          console.error('DEBUG: Error loading profile image:', error);
        }
      } else {
        // User is logged out
        console.log('DEBUG: User signed out - clearing profile data');
        setUserEmail('');
        setUserName('Your Name');
        setNewName('');
        setProfileImage(null);
      }
    });
    
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      // Clear cached profile image before logout using the utility function
      await clearProfileImageCache();
      console.log('DEBUG: Profile image cache cleared on logout');
      
      // Sign out from Firebase
      await signOut(auth);
      console.log('DEBUG: User signed out successfully');
      
      // Let App.js auth listener handle navigation back to Login
    } catch (error) {
      console.error('DEBUG: Error during logout:', error);
      Alert.alert('Error', 'Error logging out: ' + error.message);
    }
  };
  
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert("Permission Denied", "You need to grant gallery permissions to change your profile photo.");
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      
      if (!result.canceled && result.assets && result.assets[0].uri) {
        const localUri = result.assets[0].uri;
        console.log('Image picked:', localUri);
        
        // Upload and cache the profile image
        await uploadProfileImage(localUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert("Error", "An error occurred while picking the image: " + error.message);
    }
  };
  
  // Call this after selecting a profile image
  const uploadProfileImage = async (uri) => {
    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to change your profile image");
      return;
    }
    
    setUploading(true);
    
    try {
      console.log('DEBUG: Processing profile image:', uri);
      
      // Update local state immediately for better UX
      setProfileImage(uri);
      
      // Save the profile image using the utility function
      const result = await saveProfileImage(uri);
      
      if (!result.success) {
        console.error('DEBUG: Error saving profile image:', result.error);
        Alert.alert('Note', 'Your profile picture is saved on this device but might not sync to your account.');
      }
    } catch (error) {
      console.error('ERROR in profile image update:', error);
      Alert.alert("Error", `Could not update profile image: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };
  
  const handleNameEdit = () => {
    if (isEditingName) {
      // Save the new name
      if (newName.trim() !== '' && newName !== userName) {
        setUserName(newName.trim());
        
        // Update name in Firebase
        if (auth.currentUser) {
          updateProfile(auth.currentUser, {
            displayName: newName.trim()
          }).catch(error => {
            Alert.alert("Error", "Failed to update name: " + error.message);
          });
        }
      }
    } else {
      // Start editing
      setNewName(userName);
    }
    
    setIsEditingName(!isEditingName);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Profile</Text>
      
      <View style={styles.contentContainer}>
        {/* Profile Photo */}
        <TouchableOpacity style={styles.photoContainer} onPress={uploading ? null : pickImage}>
          {profileImage ? (
            <>
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color="#6A3EA1" />
                </View>
              )}
            </>
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.editIconContainer}>
            <Ionicons name="pencil" size={16} color="white" />
          </View>
        </TouchableOpacity>
        
        {/* User Name */}
        <View style={styles.nameContainer}>
          {isEditingName ? (
            <TextInput
              style={styles.nameInput}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
          ) : (
            <Text style={styles.userName}>{userName}</Text>
          )}
          <TouchableOpacity style={styles.editButton} onPress={handleNameEdit}>
            <Ionicons 
              name={isEditingName ? "checkmark" : "pencil"} 
              size={20} 
              color="#6A3EA1" 
            />
          </TouchableOpacity>
        </View>
        
        {/* Email */}
        <Text style={styles.userEmail}>{userEmail}</Text>
        
        {/* Logout Button */}
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
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingTop: 20
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E4D5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6A3EA1',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6A3EA1',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 10,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#6A3EA1',
    paddingBottom: 5,
    marginRight: 10,
    minWidth: 150,
    textAlign: 'center',
  },
  editButton: {
    padding: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
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
    width: '100%',
    maxWidth: 300,
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
