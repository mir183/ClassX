// Updated version of the Tab Navigator component
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import RoutineScreen from './RoutineScreen';
import InspireScreen from './InspireScreen';
import ToolsScreen from './ToolsScreen';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();

// Custom tab bar component to handle the focused state styles
const TabNavigator = ({ route, navigation }) => {
  const userEmail = route.params?.userEmail;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: true,
        headerShown: false,
        tabBarStyle: {
          height: 65,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#EEEEEE',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#AAAAAA',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          paddingBottom: 4,
        }
      }}
    >
      <Tab.Screen 
        name="Routine" 
        component={RoutineScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeBlackCircleContainer : styles.blackCircleContainer}>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </View>
          ),
          tabBarItemStyle: {
            borderTopWidth: 2,
            borderTopColor: '#FF9500',
          }
        }}
      />
      <Tab.Screen 
        name="Inspire" 
        component={InspireScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons name="menu" size={24} color={focused ? "#000000" : "#AAAAAA"} />
          )
        }}
      />
      <Tab.Screen 
        name="Tools" 
        component={ToolsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons name="create" size={24} color={focused ? "#000000" : "#AAAAAA"} />
          )
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        initialParams={{ userEmail: userEmail }}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons name="person" size={24} color={focused ? "#000000" : "#AAAAAA"} />
          )
        }}
      />
    </Tab.Navigator>
  );
};

// Use this component as a wrapper for the HomeScreen
export default function HomeScreen(props) {
  return <TabNavigator {...props} />;
}

const styles = StyleSheet.create({
  blackCircleContainer: {
    backgroundColor: '#AAAAAA',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBlackCircleContainer: {
    backgroundColor: '#000000',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF9500',
  }
});
