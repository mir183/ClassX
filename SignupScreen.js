import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
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

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create refs for input fields
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

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

  // Password validation - check minimum length and match
  const validatePasswordMatch = () => {
    if (password && password.length < 4) {
      setPasswordError('Password must be at least 4 characters');
      return false;
    } else if (confirmPassword && password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  // Handle signup with Firebase
  const handleSignup = async () => {
    if (!fullName) {
      alert('Please enter your full name');
      return;
    }
    if (!email) {
      alert('Please enter your email address');
      return;
    }
    if (!phoneNo) {
      alert('Please enter your phone number');
      return;
    }
    if (!password) {
      alert('Please create a password');
      return;
    }
    if (!confirmPassword) {
      alert('Please confirm your password');
      return;
    }
    if (emailError) {
      alert('Please enter a valid email address');
      return;
    }
    if (password.length < 4) {
      alert('Password must be at least 4 characters');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      // Set loading state
      setIsLoading(true);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with name
      await updateProfile(userCredential.user, {
        displayName: fullName
      });
      
      // Navigation is handled by auth state listener in App.js
    } catch (error) {
      // Display user-friendly error messages
      let errorMessage = 'An error occurred during signup. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email or try logging in.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Your password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      alert(errorMessage);
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <FlowerImage />
            <Text style={styles.title}>ClassX</Text>
            <Text style={styles.subtitle}>Account Signup</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={24} color="#6A3EA1" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Richard Barnes"
                placeholderTextColor="#aaa"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current.focus()}
              />
            </View>

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
                ref={emailRef}
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current.focus()}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={24} color="#6A3EA1" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor="#aaa"
                value={phoneNo}
                onChangeText={setPhoneNo}
                keyboardType="phone-pad"
                ref={phoneRef}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current.focus()}
              />
            </View>

            <Text style={styles.inputLabel}>Password</Text>
            <View style={[styles.inputWrapper, passwordError && password.length < 4 ? styles.inputWrapperError : null]}>
              <Ionicons name="lock-closed-outline" size={24} color={(passwordError && password.length < 4) ? "#FF3B30" : "#6A3EA1"} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="********"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  validatePasswordMatch();
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                ref={passwordRef}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current.focus()}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color="#6A3EA1"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={[styles.inputWrapper, passwordError ? styles.inputWrapperError : null]}>
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color={passwordError ? "#FF3B30" : "#6A3EA1"}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="********"
                placeholderTextColor="#aaa"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  validatePasswordMatch();
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color="#6A3EA1"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          <TouchableOpacity 
            style={styles.signupButton} 
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={[styles.signupButtonText, {marginLeft: 8}]}>Signing up...</Text>
              </View>
            ) : (
              <Text style={styles.signupButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation && navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
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
    paddingBottom: 20,
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
  signupButton: {
    width: '100%',
    backgroundColor: '#6A3EA1',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 16,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20  // Added bottom margin
  },
  loginText: {
    color: '#333',
    fontSize: 14,
  },
  loginLink: {
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