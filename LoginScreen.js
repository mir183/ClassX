// filepath: /Users/mirhossainahmed/ClassX/LoginScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from './firebaseConfig'; // Import Firebase auth from firebaseConfig.js

// Custom logo component to display the logo without tinting
const FlowerImage = () => {
  return (
    <View style={styles.flowerContainer}>
      <Image
        source={require('./assets/logo.png')}
        style={{
          width: 100,
          height: 100
        }}
        resizeMode="contain"
      />
    </View>
  );
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create refs for input fields
  const passwordRef = useRef(null);

  // Email validation regex pattern
  const validateEmail = (text) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    setEmail(text);
    if (text.length > 0 && !emailRegex.test(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
    return emailRegex.test(text) || text.length === 0;
  };

  // Handle login with Firebase
  const handleLogin = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }
    if (!password) {
      alert('Please enter your password');
      return;
    }
    if (emailError) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      // Set loading state (if you implement it)
      setIsLoading(true); // You'll need to add this state
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Navigation is handled by auth state listener in App.js
    } catch (error) {
      // Display user-friendly error messages
      let errorMessage = 'An error occurred during login. Please try again.';
      
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/user-not-found') {
        errorMessage = 'Incorrect email or password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      
      alert(errorMessage);
    } finally {
      // Reset loading state (if you implement it)
      setIsLoading(false); // You'll need to add this state
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <FlowerImage />
            <Text style={styles.title}>ClassX</Text>
            <Text style={styles.subtitle}>Login</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={[styles.inputWrapper, emailError ? styles.inputWrapperError : null]}>
              <Ionicons name="mail-outline" size={24} color={emailError ? "#FF3B30" : "#6A3EA1"} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="andyj@gmail.com"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={validateEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onSubmitEditing={() => passwordRef.current.focus()}
                returnKeyType="next"
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={24} color="#6A3EA1" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="********"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color="#6A3EA1"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin} 
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={[styles.loginButtonText, {marginLeft: 8}]}>Logging in...</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.googleButton}>
            <Ionicons name="logo-google" size={20} color="white" style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account already? </Text>
            <TouchableOpacity onPress={() => navigation && navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Signup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40  // Increased bottom padding for better spacing
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  flowerContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6A3EA1',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 52,
    width: '100%',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#222',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#6A3EA1',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButton: {
    width: '100%',
    backgroundColor: '#00A66C',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 24,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20  // Added bottom margin
  },
  signupText: {
    color: '#333',
    fontSize: 14,
  },
  signupLink: {
    color: '#6A3EA1',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
  },
  inputWrapperError: {
    borderColor: '#FF3B30',
    borderWidth: 1,
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
  },
});
