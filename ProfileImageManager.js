// Profile Image Management Utility
import { auth } from './firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { updateProfile } from "firebase/auth";

/**
 * This utility provides functions to handle profile images locally with AsyncStorage
 * It caches profile pictures and ensures they persist between app sessions
 */

// Save profile image to local storage and update Auth profile
export const saveProfileImage = async (imageUri) => {
  if (!auth.currentUser) {
    return { success: false, error: 'User not authenticated' };
  }
  
  try {
    const userId = auth.currentUser.uid;
    
    // Save to AsyncStorage
    await AsyncStorage.setItem(`@profile_image_${userId}`, imageUri);
    
    // Update Auth profile
    await updateProfile(auth.currentUser, {
      photoURL: imageUri
    });
    
    return { 
      success: true,
      message: 'Profile image saved successfully'
    };
  } catch (error) {
    console.error('Error saving profile image:', error);
    return {
      success: false,
      error: error.message || 'Unknown error saving profile image'
    };
  }
};

// Load profile image from local storage or Auth profile
export const loadProfileImage = async () => {
  if (!auth.currentUser) {
    return { success: false, error: 'User not authenticated' };
  }
  
  try {
    const userId = auth.currentUser.uid;
    
    // Try AsyncStorage first
    const cachedImage = await AsyncStorage.getItem(`@profile_image_${userId}`);
    if (cachedImage) {
      return {
        success: true,
        imageUri: cachedImage,
        source: 'asyncstorage'
      };
    }
    
    // Fall back to Auth photoURL
    if (auth.currentUser.photoURL) {
      // Save to AsyncStorage for future use
      await AsyncStorage.setItem(`@profile_image_${userId}`, auth.currentUser.photoURL);
      
      return {
        success: true,
        imageUri: auth.currentUser.photoURL,
        source: 'auth'
      };
    }
    
    return {
      success: false,
      error: 'No profile image found'
    };
  } catch (error) {
    console.error('Error loading profile image:', error);
    return {
      success: false,
      error: error.message || 'Unknown error loading profile image'
    };
  }
};

// Clear profile image from local storage on logout
export const clearProfileImageCache = async () => {
  if (!auth.currentUser) {
    return { success: false, error: 'User not authenticated' };
  }
  
  try {
    const userId = auth.currentUser.uid;
    await AsyncStorage.removeItem(`@profile_image_${userId}`);
    
    return {
      success: true,
      message: 'Profile image cache cleared'
    };
  } catch (error) {
    console.error('Error clearing profile image cache:', error);
    return {
      success: false,
      error: error.message || 'Unknown error clearing profile image cache'
    };
  }
};
