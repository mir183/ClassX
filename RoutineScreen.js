import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RoutineScreen() {
  const today = new Date('May 19, 2025'); // Using May 19, 2025 as the current date
  const [selectedDay, setSelectedDay] = useState(1); // Monday (May 19) is selected by default
  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [tasks, setTasks] = useState([
  
  ]);
  
  // Get the week days starting from Sunday
  const getWeekDays = () => {
    // Hardcoded calendar for the week of May 19, 2025 (Monday)
    // Sunday is May 18, 2025
    return [
      { dayName: 'Sun', date: 18, isToday: false },
      { dayName: 'Mon', date: 19, isToday: true },  // Current day (May 19, 2025)
      { dayName: 'Tue', date: 20, isToday: false },
      { dayName: 'Wed', date: 21, isToday: false },
      { dayName: 'Thu', date: 22, isToday: false },
      { dayName: 'Fri', date: 23, isToday: false },
      { dayName: 'Sat', date: 24, isToday: false },
    ];
  };
  
  // Add a new task function
  const addNewTask = () => {
    // Task name validation is now done before calling this function
    const newTask = {
      id: tasks.length + 1,
      title: newTaskTitle.trim(),
      icon: 'create-outline', // Default icon
      iconColor: getRandomColor(),
      day: selectedDay,
      completed: false, // All new tasks start as not completed
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskTitle(''); // Reset to empty for next task
  };
  
  // Helper to generate random colors for new task icons
  const getRandomColor = () => {
    const colors = ['#FF6B6B', '#4D96FF', '#6C5CE7', '#00A66C', '#FFA500', '#8A2BE2'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // Toggle task completion status
  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(updatedTasks);
  };
  
  // Delete a task
  const deleteTask = (taskId) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => {
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            setTasks(updatedTasks);
          },
          style: "destructive"
        }
      ]
    );
  };
  
  // Filter tasks for the selected day
  const filteredTasks = tasks.filter(task => {
    return task.day === selectedDay;
  });
  
  const weekDays = getWeekDays();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
        {/* Header with date display */}
        <View style={styles.header}>
          <Text style={styles.todayText}>Today</Text>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Week calendar */}
        <View style={styles.weekCalendar}>
          <View style={styles.daysRow}>
            {weekDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayContainer,
                  selectedDay === index ? styles.selectedDayContainer : null,
                ]}
                onPress={() => setSelectedDay(index)}
              >
                <Text style={[styles.dayName, selectedDay === index ? styles.selectedDayText : null]}>
                  {day.dayName}
                </Text>
                <View style={[
                  styles.dateCircle,
                  day.isToday ? styles.todayCircle : null,
                  selectedDay === index ? styles.selectedDateCircle : null
                ]}>
                  <Text style={[
                    styles.dateNumber,
                    day.isToday ? styles.todayNumber : null,
                    selectedDay === index ? styles.selectedDateNumber : null
                  ]}>
                    {day.date}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filter tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              styles.activeFilterTab
            ]}
          >
            <Text style={[
              styles.filterText,
              styles.activeFilterText
            ]}>All</Text>
          </TouchableOpacity>
        </View>

        {/* Task List */}
        <ScrollView style={styles.taskList}>
          {filteredTasks.map(task => (
            <Swipeable
              key={task.id}
              renderRightActions={(progress, dragX) => {
                const taskHeight = task.title.length > 30 ? 'auto' : 80; // Adjust height based on content
                return (
                  <View style={[styles.rightActionsContainer, { height: taskHeight }]}>
                    <TouchableOpacity 
                      style={styles.deleteAction}
                      onPress={() => deleteTask(task.id)}
                    >
                      <View style={styles.deleteContainer}>
                        <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
                        <Text style={styles.deleteText}>Delete</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              }}
              friction={1.5}
              rightThreshold={30}
              overshootRight={false}
            >
              <View style={styles.taskCard}>
                <View style={styles.taskIconContainer} backgroundColor={task.iconColor}>
                  <Ionicons name={task.icon} size={24} color="#FFF" />
                </View>
                <View style={styles.taskDetails}>
                  {task.progress && (
                    <Text style={styles.taskProgress}>{task.progress}</Text>
                  )}
                  <Text 
                    style={[
                      styles.taskTitle, 
                      task.completed ? styles.completedTaskTitle : null
                    ]}
                  >
                    {task.title}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[styles.checkCircle, task.completed ? styles.completedCheckCircle : null]}
                  onPress={() => toggleTaskCompletion(task.id)}
                >
                  {task.completed && (
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </Swipeable>
          ))}
          {filteredTasks.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No tasks for this day</Text>
            </View>
          )}
        </ScrollView>

        {/* Add Task Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        {/* New Task Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Close button */}
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close-outline" size={32} color="#000" />
              </TouchableOpacity>

              {/* Task title input */}
              <Text style={styles.modalTitle}>Add a new Task!</Text>
              
              <TextInput
                style={styles.taskNameInput}
                placeholder="New Task"
                placeholderTextColor="#aaa"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                onFocus={() => {
                  // Clear the field when user focuses on it
                  if (newTaskTitle === '') {
                    setNewTaskTitle('');
                  }
                }}
                autoFocus={false}
              />

              {/* Continue Button */}
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={() => {
                  // Add the new task and close the modal only if validation passes
                  if (newTaskTitle.trim() === '') {
                    alert('Please enter a task name');
                  } else {
                    addNewTask();
                    setModalVisible(false);
                  }
                }}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f0ff', // Light purple background from the screenshot
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f0ff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  todayText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  menuButton: {
    padding: 5,
  },
  weekCalendar: {
    marginBottom: 20,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dayContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderRadius: 20,
    width: '13%', // Slightly less than 1/7th to account for any margins
  },
  selectedDayContainer: {
    backgroundColor: 'rgba(148, 108, 237, 0.2)', // Light purple background
  },
  dayName: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 6,
  },
  selectedDayText: {
    color: '#000',
    fontWeight: '600',
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  todayCircle: {
    backgroundColor: '#92c5fd', // Light blue for today
  },
  selectedDateCircle: {
    backgroundColor: '#6A3EA1', // Purple when selected
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  todayNumber: {
    color: '#FFFFFF',
  },
  selectedDateNumber: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterTab: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
  },
  activeFilterTab: {
    backgroundColor: 'rgba(148, 108, 237, 0.2)', // Light purple background
  },
  filterText: {
    fontSize: 16,
    color: '#888888',
  },
  activeFilterText: {
    color: '#000000',
    fontWeight: '600',
  },
  taskList: {
    flex: 1,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#FFE8CC', // Light orange background
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    minHeight: 80, // Ensure consistent height
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  taskDetails: {
    flex: 1,
  },
  taskProgress: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  taskTime: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  checkCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#888',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCheckCircle: {
    backgroundColor: '#4CAF50', // Green color for completed tasks
    borderColor: '#4CAF50',
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6C5CE7', // Purple color for the add button
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: '80%',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 30,
    color: '#333',
  },
  taskNameInput: {
    width: '100%',
    padding: 15,
    marginBottom: 20,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    flex: 1,
    borderRadius: 16, // Make all corners evenly rounded
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  rightActionsContainer: {
    width: 100,
    marginLeft: 10,
    overflow: 'hidden',
    borderRadius: 16, // Make all corners evenly rounded
    height: 80, // Match the minimum height of taskCard
    alignSelf: 'flex-start', // Align to top
    flexDirection: 'row',
    marginBottom: 16, // Match task card's marginBottom
  },
  deleteContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
});
