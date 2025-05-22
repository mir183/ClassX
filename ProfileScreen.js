import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from './firebaseConfig';
import { signOut, updateProfile } from "firebase/auth";
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen({ route, navigation }) {
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('Your Name');
  const [profileImage, setProfileImage] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    // Get user email from route params or current auth state
    if (route.params?.userEmail) {
      setUserEmail(route.params.userEmail);
    } else if (auth.currentUser) {
      setUserEmail(auth.currentUser.email);
      if (auth.currentUser.displayName) {
        setUserName(auth.currentUser.displayName);
        setNewName(auth.currentUser.displayName);
      }
      if (auth.currentUser.photoURL) {
        setProfileImage(auth.currentUser.photoURL);
      }
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
      
      if (!result.canceled && result.assets) {
        const selectedImage = result.assets[0].uri;
        setProfileImage(selectedImage);
        
        // Update profile photo in Firebase
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, {
            photoURL: selectedImage
          });
        }
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while picking the image: " + error.message);
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
        <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
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
    marginBottom: 60,
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
