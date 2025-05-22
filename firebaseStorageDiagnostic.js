// Firebase Storage Diagnostic Tool
import { auth, storage } from './firebaseConfig';
import { ref as storageRef, getDownloadURL, uploadBytes, listAll } from 'firebase/storage';
import { Alert, Platform } from 'react-native';
import { updateProfile } from "firebase/auth";
import NetInfo from '@react-native-community/netinfo';

// This function tests Firebase Storage connectivity and permissions
// with specific focus on profile image syncing issues
export const testFirebaseStorage = async () => {
  if (!auth.currentUser) {
    Alert.alert("Error", "You must be logged in to test storage");
    return;
  }

  try {
    console.log('DEBUG: Starting storage diagnostic test...');
    console.log('DEBUG: Current user:', auth.currentUser.uid);
    console.log('DEBUG: Storage bucket:', storage._service.app.options.storageBucket);
    console.log('DEBUG: Running on platform:', Platform.OS);
    
    // Check network connectivity first
    const netInfo = await NetInfo.fetch();
    console.log('DEBUG: Network state:', JSON.stringify(netInfo));
    
    if (!netInfo.isConnected) {
      console.error('DEBUG: No internet connection detected ❌');
      Alert.alert("No Internet Connection", "Your device is offline. Internet connection is required for storage operations.");
      return;
    }

    // Phase 1: Test Firebase Auth profile
    console.log('\nDEBUG: PHASE 1 - Testing Auth Profile Settings');
    console.log('DEBUG: Current user displayName:', auth.currentUser.displayName);
    console.log('DEBUG: Current user photoURL:', auth.currentUser.photoURL);
    
    if (auth.currentUser.photoURL) {
      try {
        console.log('DEBUG: Testing photoURL accessibility...');
        const response = await fetch(auth.currentUser.photoURL);
        if (response.ok) {
          console.log('DEBUG: photoURL is accessible ✅');
        } else {
          console.error(`DEBUG: photoURL fetch failed with status ${response.status} ❌`);
        }
      } catch (fetchError) {
        console.error('DEBUG: Failed to fetch photoURL ❌', fetchError.message);
      }
    } else {
      console.log('DEBUG: No photoURL set in Auth profile');
    }
    
    // Phase 2: Test Storage Directory Listing
    console.log('\nDEBUG: PHASE 2 - Testing Storage Directory Access');
    const userStorageRef = storageRef(storage, `users/${auth.currentUser.uid}`);
    console.log('DEBUG: User storage path:', userStorageRef.fullPath);
    
    try {
      console.log('DEBUG: Attempting to list contents...');
      const listResult = await listAll(userStorageRef);
      console.log('DEBUG: Directory listing successful ✅');
      console.log('DEBUG: Files found:', listResult.items.length);
      
      // Look for profile images specifically
      const profileImages = listResult.items.filter(item => 
        item.name.startsWith('profile_') || item.name === 'profile.jpg'
      );
      
      console.log('DEBUG: Profile images found:', profileImages.length);
      profileImages.forEach(item => {
        console.log('DEBUG: Profile image:', item.fullPath);
      });
      
      if (profileImages.length > 0) {
        // Test accessing the most recent profile image
        try {
          const latestImage = profileImages[profileImages.length - 1];
          const url = await getDownloadURL(latestImage);
          console.log('DEBUG: Successfully retrieved download URL for profile image ✅');
          console.log('DEBUG: URL:', url);
        } catch (urlError) {
          console.error('DEBUG: Failed to get download URL for profile image ❌', urlError.code);
        }
      }
    } catch (listError) {
      console.error('DEBUG: Failed to list directory content ❌', listError.code, listError.message);
    }
    
    // Phase 3: Test writing to Storage
    console.log('\nDEBUG: PHASE 3 - Testing Storage Write Access');
    try {
      console.log('DEBUG: Attempting to create test file...');
      const timestamp = Date.now();
      const testFileRef = storageRef(storage, `users/${auth.currentUser.uid}/profile-test-${timestamp}.txt`);
      
      // Create a small text file
      const testBlob = new Blob([`Profile sync test at ${new Date().toISOString()}`], { type: 'text/plain' });
      
      // Add metadata similar to profile image
      const metadata = {
        contentType: 'text/plain',
        customMetadata: {
          'testTime': timestamp.toString(),
          'userId': auth.currentUser.uid,
          'platform': Platform.OS,
          'purpose': 'profile-sync-test'
        }
      };
      
      const snapshot = await uploadBytes(testFileRef, testBlob, metadata);
      console.log('DEBUG: Test file created successfully ✅', snapshot.ref.fullPath);
      
      // Try to get URL for the test file
      const url = await getDownloadURL(testFileRef);
      console.log('DEBUG: Test file URL obtained successfully ✅', url);
      
      // Show diagnostic results
      Alert.alert("Storage Tests Complete", 
        "✅ Network Connection: OK\n" + 
        `✅ Auth Profile: ${auth.currentUser.photoURL ? "Has Photo URL" : "No Photo URL"}\n` +
        `✅ Storage Access: ${profileImages?.length || 0} profile images found\n` +
        "✅ Storage Write: Test file created successfully"
      );
    } catch (uploadError) {
      console.error('DEBUG: Failed to upload test file ❌', uploadError.code, uploadError.message);
      Alert.alert("Storage Test Failed", `Error: ${uploadError.code}\n${uploadError.message}`);
    }
  } catch (error) {
    console.error('DEBUG: Diagnostic test failed:', error);
    Alert.alert("Error", `Storage diagnostic failed: ${error.message}`);
  }
};

// Special diagnostic function for profile image sync issues
export const diagnoseSyncIssues = async () => {
  if (!auth.currentUser) {
    Alert.alert("Error", "You must be logged in to diagnose sync issues");
    return;
  }
  
  try {
    console.log('\nDEBUG: STARTING PROFILE SYNC DIAGNOSIS');
    
    // Check if the Firebase app is properly initialized
    console.log('DEBUG: Storage config:', {
      bucket: storage._service.app.options.storageBucket || 'not set',
      projectId: storage._service.app.options.projectId || 'not set'
    });
    
    // Check network 
    const netInfo = await NetInfo.fetch();
    console.log('DEBUG: Network state:', JSON.stringify(netInfo));
    
    if (!netInfo.isConnected) {
      Alert.alert("No Internet", "You need internet connection to sync profiles");
      return;
    }
    
    // 1. Force token refresh
    console.log('DEBUG: Forcing token refresh...');
    try {
      await auth.currentUser.getIdToken(true);
      await auth.currentUser.reload();
      console.log('DEBUG: User reloaded successfully');
    } catch (tokenError) {
      console.error('DEBUG: Error refreshing token:', tokenError);
      // Continue anyway with diagnostics
    }
    
    // 2. Check for URL in auth profile first
    const authURL = auth.currentUser.photoURL;
    let authUrlWorks = false;
    
    console.log('DEBUG: Auth profile URL:', authURL);
    
    if (authURL) {
      try {
        // Test if the existing URL is accessible
        console.log('DEBUG: Testing auth photoURL accessibility...');
        const response = await fetch(authURL, { method: 'HEAD' });
        
        if (response.ok) {
          console.log('DEBUG: Auth photoURL is accessible ✅');
          authUrlWorks = true;
        } else {
          console.error('DEBUG: Auth photoURL returned status:', response.status);
        }
      } catch (urlError) {
        console.error('DEBUG: Auth photoURL is not accessible:', urlError.message);
      }
    }
    
    // 3. Check for fixed "profile.jpg" first (simpler approach)
    let fixedProfileUrl = null;
    
    try {
      console.log('DEBUG: Checking for fixed profile.jpg...');
      const fixedImageRef = storageRef(storage, `users/${auth.currentUser.uid}/profile.jpg`);
      fixedProfileUrl = await getDownloadURL(fixedImageRef);
      console.log('DEBUG: Fixed profile.jpg exists ✅:', fixedProfileUrl);
    } catch (fixedProfileError) {
      console.log('DEBUG: No fixed profile.jpg found:', fixedProfileError.code);
    }
    
    // 4. Check for timestamped profile images in storage
    const userStorageRef = storageRef(storage, `users/${auth.currentUser.uid}`);
    let latestTimestampedUrl = null;
    let latestImageRef = null;
    
    try {
      console.log('DEBUG: Listing user storage directory...');
      const listResult = await listAll(userStorageRef);
      console.log('DEBUG: Storage listing successful ✅');
      console.log('DEBUG: Files found:', listResult.items.length);
      
      // Look specifically for profile images with timestamps
      const profileImages = listResult.items.filter(item => 
        item.name.startsWith('profile_') || item.name === 'profile.jpg'
      );
      
      console.log(`DEBUG: Found ${profileImages.length} profile images in storage`);
      
      if (profileImages.length > 0) {
        // Log all profile images found
        profileImages.forEach(img => {
          console.log('DEBUG: Profile image:', img.name);
        });
        
        // Sort by timestamp (newest first)
        profileImages.sort((a, b) => {
          const getTimestamp = name => {
            const match = name.match(/profile_(\d+)\.jpg/);
            return match ? parseInt(match[1]) : 0;
          };
          return getTimestamp(b.name) - getTimestamp(a.name);
        });
        
        // Get the most recent image
        latestImageRef = profileImages[0];
        try {
          latestTimestampedUrl = await getDownloadURL(latestImageRef);
          console.log('DEBUG: Latest timestamped image URL:', latestTimestampedUrl);
        } catch (downloadError) {
          console.error('DEBUG: Failed to get URL for latest image:', downloadError);
        }
      }
    } catch (listError) {
      console.error('DEBUG: Error listing storage:', listError.code, listError.message);
      
      // Special handling for unknown errors that might indicate misconfiguration
      if (listError.code === 'storage/unknown') {
        console.error('DEBUG: Received storage/unknown error - checking Firebase configuration...');
        
        // Check if Firebase is properly configured
        if (!storage._service.app.options.storageBucket) {
          console.error('DEBUG: Storage bucket is not configured properly!');
        }
      }
    }
    
    // 5. Generate diagnosis and fix options
    let diagnosis = '';
    let fixAction = null;
    
    // Try to create a simplified test file to verify write access
    let canWriteToStorage = false;
    try {
      const testRef = storageRef(storage, `users/${auth.currentUser.uid}/sync-test-${Date.now()}.txt`);
      const testBlob = new Blob(['Sync test'], { type: 'text/plain' });
      await uploadBytes(testRef, testBlob);
      console.log('DEBUG: Test write to storage successful ✅');
      canWriteToStorage = true;
    } catch (writeTestError) {
      console.error('DEBUG: Test write to storage failed ❌:', writeTestError.code);
      
      // Special case for the error you're seeing
      if (writeTestError.code === 'storage/unknown') {
        diagnosis += "Firebase Storage configuration issue detected. ";
        diagnosis += "This may be due to incorrect Firebase configuration or expired credentials.\n\n";
      }
    }
    
    // Decision tree for diagnosis and fixes
    if (authUrlWorks) {
      diagnosis += "Your profile image is working: the URL in your profile is accessible.\n\n";
      
      // If auth URL works but doesn't match latest image, offer update
      if (latestTimestampedUrl && !authURL.includes(latestTimestampedUrl.split('?')[0])) {
        diagnosis += "However, a newer image was found in storage. Would you like to use it instead?";
        
        fixAction = async () => {
          try {
            const timestamp = Date.now();
            const cacheBreakingURL = `${latestTimestampedUrl}?t=${timestamp}`;
            await updateProfile(auth.currentUser, { photoURL: cacheBreakingURL });
            await auth.currentUser.reload();
            Alert.alert("Updated", "Your profile now uses the latest image");
          } catch (e) {
            Alert.alert("Error", "Failed to update profile: " + e.message);
          }
        };
      }
      // If auth URL works but needs a cache buster
      else if (!authURL.includes('?t=')) {
        diagnosis += "Your profile image could be refreshed to ensure it syncs across devices.";
        
        fixAction = async () => {
          try {
            const timestamp = Date.now();
            const cacheBreakingURL = `${authURL}?t=${timestamp}`;
            await updateProfile(auth.currentUser, { photoURL: cacheBreakingURL });
            await auth.currentUser.reload();
            Alert.alert("Enhanced", "Added cache control to improve sync between devices");
          } catch (e) {
            Alert.alert("Error", "Failed to update profile: " + e.message);
          }
        };
      }
    } 
    else if (latestTimestampedUrl) {
      diagnosis += "Found an image in storage, but it's not linked to your profile.\n\n";
      diagnosis += "This is likely why your image doesn't sync across devices.";
      
      fixAction = async () => {
        try {
          const timestamp = Date.now();
          const cacheBreakingURL = `${latestTimestampedUrl}?t=${timestamp}`;
          await updateProfile(auth.currentUser, { photoURL: cacheBreakingURL });
          await auth.currentUser.reload();
          Alert.alert("Fixed", "Profile image successfully linked to your account");
        } catch (e) {
          Alert.alert("Error", "Failed to update profile: " + e.message);
        }
      };
    }
    else if (fixedProfileUrl) {
      diagnosis += "Found a default profile.jpg in storage, but it's not linked to your profile.\n\n";
      diagnosis += "Let's connect this image to your profile.";
      
      fixAction = async () => {
        try {
          const timestamp = Date.now();
          const cacheBreakingURL = `${fixedProfileUrl}?t=${timestamp}`;
          await updateProfile(auth.currentUser, { photoURL: cacheBreakingURL });
          await auth.currentUser.reload();
          Alert.alert("Fixed", "Default profile image linked to your account");
        } catch (e) {
          Alert.alert("Error", "Failed to update profile: " + e.message);
        }
      };
    }
    else if (authURL && !authUrlWorks) {
      diagnosis += "Your profile has an image URL, but we can't access it.\n\n";
      diagnosis += "This might be because the image was deleted from storage or there are permission issues.";
      
      if (canWriteToStorage) {
        diagnosis += "\n\nWould you like to upload a new profile image to fix this?";
        
        fixAction = async () => {
          // Just clear the broken URL for now
          try {
            await updateProfile(auth.currentUser, { photoURL: '' });
            await auth.currentUser.reload();
            Alert.alert(
              "Cleared",
              "Your profile image URL has been cleared. Please upload a new image.",
              [
                { text: "OK", onPress: () => {} }
              ]
            );
          } catch (e) {
            Alert.alert("Error", "Failed to clear profile: " + e.message);
          }
        };
      }
    }
    else if (!authURL && !latestTimestampedUrl && !fixedProfileUrl) {
      diagnosis += "No profile image found in your account or in storage.\n\n";
      diagnosis += "You need to upload a new profile image.";
    }
    else {
      diagnosis += "We're having trouble diagnosing your specific issue.\n\n";
      
      // Check for specific errors and add relevant info
      if (!canWriteToStorage) {
        diagnosis += "You don't have permission to write to Firebase Storage. ";
        diagnosis += "This could be due to Firebase rules or configuration issues.";
      }
    }
    
    console.log('DEBUG: Diagnosis:', diagnosis);
    
    if (fixAction) {
      Alert.alert(
        "Profile Sync Diagnosis",
        diagnosis,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Fix Issue", onPress: fixAction }
        ]
      );
    } else {
      Alert.alert("Profile Sync Diagnosis", diagnosis);
    }
    
  } catch (error) {
    console.error('DEBUG: Sync diagnosis failed:', error);
    Alert.alert(
      "Diagnostic Error",
      `We encountered an error while trying to diagnose your profile sync issue: ${error.message}\n\nPlease check your internet connection and Firebase configuration.`
    );
  }
};

// Export functions with the names used in ProfileScreen
export const runStorageDiagnostic = diagnoseSyncIssues; // Using the more comprehensive diagnostic tool
export const testStorageBasic = testFirebaseStorage; // Keep this available but not as default