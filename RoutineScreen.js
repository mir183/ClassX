import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Modal, TextInput, Alert, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable, GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';

export default function RoutineScreen() {
  // Get the current date
  const [currentDate, setCurrentDate] = useState(new Date());
  // State to keep track of the week offset (0 = current week, -1 = previous week, 1 = next week)
  const [weekOffset, setWeekOffset] = useState(0);
  // Selected day index within the week (0-6, where 0 = Sunday)
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date();
    return today.getDay(); // Today's day of the week (0-6)
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  // Task detail modal state
  const [taskDetailVisible, setTaskDetailVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Task edit modal state
  const [taskEditVisible, setTaskEditVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState('');
  
  // Animation values for calendar swipe
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);
  const [tasks, setTasks] = useState([]);
  
  
  // Generate week days based on current date and week offset
  const getWeekDays = () => {
    // Get the current date
    const now = new Date();
    const realToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Get the first day of the current week (Sunday)
    const firstDayOfWeek = new Date(currentDate);
    // Adjust to first day (Sunday) of the week
    firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay());
    
    // Apply the week offset
    firstDayOfWeek.setDate(firstDayOfWeek.getDate() + (weekOffset * 7));
    
    // Create the array of days for the week
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(firstDayOfWeek);
      day.setDate(firstDayOfWeek.getDate() + i);
      
      // Check if this day is today
      const isToday = day.toDateString() === realToday.toDateString();
      
      days.push({
        dayName: dayNames[i],
        date: day.getDate(),
        fullDate: new Date(day), // Store the full date for reference
        isToday: isToday,
      });
    }
    
    return days;
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
      weekOffset: weekOffset, // Store the current week offset
      date: weekDays[selectedDay].fullDate, // Store the full date
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
  
  // Animation value for task reordering
  const [animatingTaskId, setAnimatingTaskId] = useState(null);
  const taskAnimatedValues = useRef(new Map()).current;
  
  // Get or create animated value for a task
  const getTaskAnimatedValue = (taskId) => {
    if (!taskAnimatedValues.has(taskId)) {
      // Create new animated values with configurations optimized for smooth animations
      const translateY = new Animated.Value(0);
      const opacity = new Animated.Value(1);
      
      taskAnimatedValues.set(taskId, {
        opacity,
        translateY
      });
    }
    return taskAnimatedValues.get(taskId);
  };

  // Toggle task completion status with animation
  const toggleTaskCompletion = (taskId) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    const newCompletedValue = !taskToUpdate.completed;
    
    // Get the animated values for this task
    const animatedValues = getTaskAnimatedValue(taskId);
    
    if (newCompletedValue) {
      // Task is being completed - animate it
      setAnimatingTaskId(taskId);
      
      // Get the current task's index in filteredTasks
      const currentTaskIndex = filteredTasks.findIndex(t => t.id === taskId);
      
      // Calculate the number of incomplete tasks below the current task
      const tasksAbove = filteredTasks.filter((t, idx) => idx < currentTaskIndex && !t.completed).length;
      const tasksBelow = filteredTasks.filter((t, idx) => idx > currentTaskIndex && !t.completed).length;
      
      // Each task is approximately 96px tall (80px + 16px margin)
      const taskHeight = 96;
      
      // Calculate exact move distance based on position in the list
      // This calculation ensures consistent animation regardless of task position
      const moveDistance = tasksBelow * taskHeight;
      
      // Prepare animations for all tasks
      const animations = [];
      
      // Configure a constant-speed animation with no acceleration/deceleration
      // Adjust base duration based on position in the list
      // Tasks at the bottom need slightly longer animations to prevent bounce
      const duration = currentTaskIndex >= filteredTasks.length - 2 ? 500 : 450;
      
      const animationConfig = {
        duration: duration,
        useNativeDriver: true,
        easing: Easing.linear // Linear easing is essential for no bounce
      };
      
      // Make sure we're starting from a clean state
      animatedValues.translateY.setValue(0);
      
      // Create explicit animation with fixed distance calculation
      // Breaking it into smaller steps for tasks at bottom of list
      if (currentTaskIndex >= filteredTasks.length - 2) {
        // For tasks near the bottom, use a multi-step approach to prevent bounce
        animations.push(
          Animated.sequence([
            // First move halfway with slower timing
            Animated.timing(animatedValues.translateY, {
              toValue: moveDistance / 2,
              duration: 225,
              useNativeDriver: true,
              easing: Easing.linear
            }),
            // Then complete the movement
            Animated.timing(animatedValues.translateY, {
              toValue: moveDistance,
              duration: 225,
              useNativeDriver: true,
              easing: Easing.linear
            })
          ])
        );
      } else {
        // For tasks higher in the list, normal animation works fine
        animations.push(
          Animated.timing(animatedValues.translateY, {
            toValue: moveDistance,
            ...animationConfig
          })
        );
      }
      
      // Simple opacity change without animation
      animatedValues.opacity.setValue(0.85);
      
      // For each task that needs to move up (tasks after the completed one that aren't completed)
      filteredTasks.forEach((task, index) => {
        // Only animate incomplete tasks that are below the completed task
        if (index > currentTaskIndex && !task.completed) {
          const taskAnimValues = getTaskAnimatedValue(task.id);
          
          // Reset to ensure starting from 0
          taskAnimValues.translateY.setValue(0);
          
          // Position-aware animation adjustment
          // Tasks closer to the bottom need more careful animation
          if (index >= filteredTasks.length - 2) {
            animations.push(
              Animated.timing(taskAnimValues.translateY, {
                toValue: -taskHeight,
                duration: 500, // Slightly longer duration for bottom tasks
                useNativeDriver: true,
                easing: Easing.linear
              })
            );
          } else {
            // For tasks higher up, normal animation works fine
            animations.push(
              Animated.timing(taskAnimValues.translateY, {
                toValue: -taskHeight, // Move up by one task height
                ...animationConfig
              })
            );
          }
        }
      });
      
      // Run all animations in parallel with position-aware strategy
      // The animations array now contains position-optimized animations
      Animated.parallel(animations, { stopTogether: true }).start(() => {
        // Update the actual data structures behind the scenes
        const updatedTasks = tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, completed: newCompletedValue };
          }
          return task;
        });
        
        // Reset all animation values immediately and simultaneously
        requestAnimationFrame(() => {
          // Reset the completed task animation
          animatedValues.translateY.setValue(0);
          animatedValues.opacity.setValue(1);
          
          // Reset translate values for all other tasks
          filteredTasks.forEach(task => {
            if (task.id !== taskId) {
              getTaskAnimatedValue(task.id).translateY.setValue(0);
            }
          });
        });
        
        // Update state after animation completes
        setTasks(updatedTasks);
        setAnimatingTaskId(null);
      });
      
      return; // We'll update the tasks after animation completes
    } 
    
    // For toggling from completed to incomplete - implement reverse animation
    // Set animating state
    setAnimatingTaskId(taskId);
    
    console.log("UNCHECKING TASK ANIMATION STARTED");
    
    // Get current sorted task list
    const sortedTasks = [...filteredTasks];
    
    // Find where the task currently is in the list (should be in the completed section)
    const currentTaskIndex = sortedTasks.findIndex(t => t.id === taskId);
    
    // Find where it should go in the list - it should be at the end of the incomplete tasks section
    const incompleteCount = sortedTasks.filter(t => !t.completed && t.id !== taskId).length;
    
    // Target index should be the position after all incomplete tasks
    const targetIndex = incompleteCount;
    
    console.log(`Current task index: ${currentTaskIndex}, target index: ${targetIndex}`);
    
    // Constants for task height and animation parameters
    const taskHeight = 96; // 80px for the task + 16px margin
    
    // Position-aware animation duration
    const duration = currentTaskIndex >= filteredTasks.length - 2 ? 600 : 500;
    
    // Animation config with position-aware duration and improved easing
    const animationConfig = {
      duration: duration,
      useNativeDriver: true,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1.0) // Smooth easing with no bounce
    };
    
    // Calculate how far the task needs to move up
    // For unchecking: this is the distance from current position to target position
    // A negative value means moving up the list, positive means moving down
    console.log(`Task should move from index ${currentTaskIndex} to index ${targetIndex}`);
    const positionsToMove = targetIndex - currentTaskIndex;
    const moveDistance = positionsToMove * taskHeight;
    console.log(`Move distance calculated: ${moveDistance}px`);
    
    // Update state to mark the task as incomplete immediately
    // This ensures the z-index is correct during animation
    const updatedTasksList = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, completed: false };
      }
      return task;
    });
    setTasks(updatedTasksList);
    
    // Prepare animations array
    const animations = [];
    
    // Reset vertical position to start clean
    animatedValues.translateY.setValue(0);
    
    // Debug log to help diagnose animation issues
    console.log(`Unchecking task at index ${currentTaskIndex}, moving to ${targetIndex}, distance: ${moveDistance}px`);
    
    // Make sure unchecked tasks have full opacity immediately
    animatedValues.opacity.setValue(1);
    
    // Create a snapshot of the task list before the state update
    // This ensures our animation calculations are based on the current layout
    const taskSnapshot = [...filteredTasks];
    
    // Add a small delay before starting the animation to allow state update to apply
    setTimeout(() => {
      // For tasks near the bottom, handle them differently
      if (currentTaskIndex >= taskSnapshot.length - 2) {
        // For tasks near the bottom, use a simplified approach for more intuitive animation
        Animated.timing(animatedValues.translateY, {
          toValue: moveDistance,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1.0)
        }).start(() => {
          // Reset animation values after completion
          requestAnimationFrame(() => {
            console.log("RESETTING ANIMATION VALUES");
            animatedValues.translateY.setValue(0);
            setAnimatingTaskId(null);
          });
        });
      } else {
        // For tasks higher in the list, use standard animation
        Animated.timing(animatedValues.translateY, {
          toValue: moveDistance,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1.0)
        }).start(() => {
          // Reset animation values after completion
          requestAnimationFrame(() => {
            console.log("RESETTING ANIMATION VALUES");
            animatedValues.translateY.setValue(0);
            setAnimatingTaskId(null);
          });
        });
      }
    }, 0); // Immediate execution is better with the snapshot
    
    // Animate tasks that need to move down (tasks that will be below our now uncompleted task)
    filteredTasks.forEach((task, index) => {
      // We need to move down any incomplete tasks between the target index and current index
      // These are tasks that will need to make space for our unchecked task
      if (index >= targetIndex && index < currentTaskIndex && !task.completed) {
        const taskAnimValues = getTaskAnimatedValue(task.id);
        
        // Reset animation value before starting
        taskAnimValues.translateY.setValue(0);
        
        // Move all affected tasks in a single smooth motion
        Animated.timing(taskAnimValues.translateY, {
          toValue: taskHeight,
          duration: 400, // Same duration as main task for synchronization
          useNativeDriver: true,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1.0)
        }).start(() => {
          // Reset after animation completes
          requestAnimationFrame(() => {
            taskAnimValues.translateY.setValue(0);
          });
        });
        
        console.log(`Moving task at index ${index} down to make room for unchecked task`);
      }
    });
    
    // No need for Animated.parallel anymore since we're using individual animation starts and completion callbacks
    console.log("All animations triggered - completion callbacks will handle cleanup");
  };
  
  // Update task with new values
  const updateTask = (taskId, updatedValues) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, ...updatedValues };
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
  
  // Navigate to previous week with animation
  const goToPreviousWeek = () => {
    if (isAnimating) return; // Prevent multiple animations at once
    
    setIsAnimating(true);
    // Animate from center to right (positive)
    slideAnim.setValue(0);
    Animated.timing(slideAnim, {
      toValue: 300, // Slide right
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(-300); // Jump to left side
      // Update the actual week offset after animation completes
      setWeekOffset(prevOffset => prevOffset - 1);
      
      // Animate back to center
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
      });
    });
  };
  
  // Navigate to next week with animation
  const goToNextWeek = () => {
    if (isAnimating) return; // Prevent multiple animations at once
    
    setIsAnimating(true);
    // Animate from center to left (negative)
    slideAnim.setValue(0);
    Animated.timing(slideAnim, {
      toValue: -300, // Slide left
      duration: 250,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start(() => {
      slideAnim.setValue(300); // Jump to right side
      // Update the actual week offset after animation completes
      setWeekOffset(prevOffset => prevOffset + 1);
      
      // Animate back to center
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
      });
    });
  };
  
  // Navigate to current week
  const goToCurrentWeek = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    // Animate a fade out and in
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setWeekOffset(0);
      // Also set the selected day to today
      const today = new Date();
      setSelectedDay(today.getDay());
      
      slideAnim.setValue(100);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
      });
    });
  };
  
  // Generate the weekdays whenever the week offset changes
  const weekDays = getWeekDays();
  
  // Filter tasks for the selected day
  // We need to match both the day index and the week
  // Also sort so incomplete tasks come first, followed by completed tasks
  const filteredTasks = tasks
    .filter(task => task.day === selectedDay && task.weekOffset === weekOffset)
    .sort((a, b) => {
      // Sort by completion status (incomplete tasks first)
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return 0; // Maintain original order for tasks with same completion status
    });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
        {/* Header with date display */}
        <View style={styles.header}>
          <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.todayText} numberOfLines={1}>
              {/* Show the date in the format "20 May 2025" with full month name */}
              {`${weekDays[selectedDay]?.date} ${new Date(weekDays[selectedDay]?.fullDate).toLocaleDateString('en-US', {month: 'long'})} ${new Date(weekDays[selectedDay]?.fullDate).getFullYear()}`}
            </Text>
          </View>

          {/* Today/This Week button positioned between date and menu icon */}
          <TouchableOpacity onPress={goToCurrentWeek} style={styles.todayButton}>
            <Text style={styles.todayButtonText}>
              {weekOffset === 0 ? 'This Week' : 'Go to Today'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Week calendar with swipe navigation */}
        <View style={styles.weekCalendarContainer}>
          
          {/* Week days display with enhanced swipe gesture */}
          <PanGestureHandler
            onGestureEvent={({ nativeEvent }) => {
              // Real-time tracking of swipe for visual feedback
              if (!isAnimating && nativeEvent.state === State.ACTIVE) {
                slideAnim.setValue(nativeEvent.translationX / 3); // Divide by 3 to reduce the movement
              }
            }}
            onHandlerStateChange={({ nativeEvent }) => {
              // When swipe gesture ends
              if (nativeEvent.state === State.END) {
                if (isAnimating) return;
                
                // Minimum swipe distance to trigger week change
                const SWIPE_THRESHOLD = 50;
                
                if (nativeEvent.translationX > SWIPE_THRESHOLD && Math.abs(nativeEvent.velocityX) > 80) {
                  // Swiped right with enough force - go to previous week
                  goToPreviousWeek();
                } 
                else if (nativeEvent.translationX < -SWIPE_THRESHOLD && Math.abs(nativeEvent.velocityX) > 80) {
                  // Swiped left with enough force - go to next week
                  goToNextWeek();
                }
                else {
                  // Reset position if swipe wasn't strong enough
                  Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    friction: 5,
                  }).start();
                }
              }
            }}
          >
            <Animated.View 
              style={[
                styles.weekCalendar,
                { transform: [{ translateX: slideAnim }] }
              ]}>
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
            </Animated.View>
          </PanGestureHandler>
        </View>

        {/* Section header for tasks */}
        <View style={styles.taskSectionHeader}>
          <Text style={styles.taskSectionHeaderText}>
            {(() => {
              // Check if selected day is today
              const today = new Date();
              const isSelectedDayToday = weekDays[selectedDay]?.fullDate.toDateString() === today.toDateString();
              const selectedDate = `${weekDays[selectedDay]?.date} ${new Date(weekDays[selectedDay]?.fullDate).toLocaleDateString('en-US', {month: 'long'})}`;
              
              if (filteredTasks.length > 0) {
                return `${filteredTasks.length} Task${filteredTasks.length !== 1 ? 's' : ''} ${isSelectedDayToday ? 'for Today' : `for ${selectedDate}`}`;
              } else {
                return isSelectedDayToday ? "Today's Tasks" : `Tasks for ${selectedDate}`;
              }
            })()}
          </Text>
          <Text style={styles.taskSectionSubText}>
            {filteredTasks.filter(t => t.completed).length}/{filteredTasks.length} Completed
          </Text>
        </View>

        {/* Task List */}
        <ScrollView style={styles.taskList}>
          {filteredTasks.map(task => (
            <Animated.View
              key={task.id}
              style={[
                styles.taskContainer,
                {
                  // Dynamic z-index based on animation state and completion state
                  // For unchecking: high z-index so it slides in front
                  // For checking: low z-index so it slides behind
                  zIndex: animatingTaskId === task.id 
                    ? (task.completed ? -1 : 50)  
                    : (task.completed ? 0 : 10),
                  
                  // For Android, use elevation with the same logic as z-index
                  elevation: animatingTaskId === task.id 
                    ? (task.completed ? 0 : 10)
                    : (task.completed ? 0 : 3),
                  
                  // Apply transforms for all tasks
                  transform: [{ 
                    translateY: getTaskAnimatedValue(task.id).translateY
                  }],
                  
                  // Adjust opacity based on completion status but maintain full opacity during animation
                  opacity: animatingTaskId === task.id ? 1 : (task.completed ? 0.85 : 1),
                  
                  // Add subtle shadow for better visibility during animation
                  shadowColor: animatingTaskId === task.id && !task.completed ? "#000" : "transparent",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: animatingTaskId === task.id && !task.completed ? 0.3 : 0,
                  shadowRadius: 4,
                }
              ]}
            >
              <Swipeable
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
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedTask(task);
                    setTaskDetailVisible(true);
                  }}
                >
                  <View style={[
                    styles.taskCard, 
                    animatingTaskId === task.id && !task.completed && {
                      backgroundColor: '#FFF0DB', // Slightly lighter background during unchecking
                      borderWidth: 1,
                      borderColor: '#FFD699', // Subtle border
                    }
                  ]}>
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
                      onPress={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent's onPress
                        toggleTaskCompletion(task.id);
                      }}
                    >
                      {task.completed && (
                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Swipeable>
            </Animated.View>
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
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <TouchableOpacity 
              activeOpacity={1}
              style={styles.modalContent} 
              onPress={(e) => e.stopPropagation()}
            >
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
                autoFocus={true}
                returnKeyType="done"
                onSubmitEditing={() => {
                  // Add the new task and close the modal only if validation passes
                  if (newTaskTitle.trim() === '') {
                    alert('Please enter a task name');
                  } else {
                    addNewTask();
                    setModalVisible(false);
                  }
                }}
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
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Task Detail Modal - Similar to the screenshot */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={taskDetailVisible}
          onRequestClose={() => setTaskDetailVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setTaskDetailVisible(false)}
          >
            <TouchableOpacity 
              activeOpacity={1}
              style={styles.taskDetailModalContent} 
              onPress={(e) => e.stopPropagation()}
            >
              {selectedTask && (
                <>
                  <TouchableOpacity 
                    style={{ position: 'absolute', right: 15, top: 15 }}
                    onPress={() => setTaskDetailVisible(false)}
                  >
                    <Ionicons name="close-outline" size={28} color="#000" />
                  </TouchableOpacity>
                
                  <View style={styles.taskDetailHeader}>
                    <View style={styles.taskDetailIconContainer} backgroundColor={selectedTask.iconColor}>
                      <Ionicons name={selectedTask.icon} size={28} color="#FFF" />
                    </View>
                    
                    <View style={styles.taskDetailInfo}>
                      <Text style={styles.taskDetailTitle}>{selectedTask.title}</Text>
                    </View>
                    
                    <TouchableOpacity 
                      style={[
                        styles.taskDetailCheckCircle,
                        selectedTask.completed && { backgroundColor: '#4CAF50', borderColor: '#4CAF50' }
                      ]}
                      onPress={() => {
                        // Create a new updated task with toggled completion status
                        const updatedTask = { ...selectedTask, completed: !selectedTask.completed };
                        
                        // Update the selectedTask state to reflect changes immediately in the modal
                        setSelectedTask(updatedTask);
                        
                        // Close the detail modal immediately if completing a task
                        // This ensures user can see the full sliding animation
                        if (!selectedTask.completed) {
                          setTaskDetailVisible(false);
                        }
                        
                        // Update the main tasks array
                        toggleTaskCompletion(selectedTask.id);
                      }}
                      activeOpacity={0.7}
                    >
                      {selectedTask.completed && (
                        <Ionicons name="checkmark" size={22} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.editTaskButton}
                    onPress={() => {
                      // Set up for task editing
                      setEditingTask(selectedTask);
                      setEditedTaskTitle(selectedTask.title);
                      setTaskDetailVisible(false);
                      setTaskEditVisible(true);
                    }}
                  >
                    <Text style={styles.editTaskButtonText}>Edit Task</Text>
                  </TouchableOpacity>
                </>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Task Edit Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={taskEditVisible}
          onRequestClose={() => setTaskEditVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setTaskEditVisible(false)}
          >
            <TouchableOpacity 
              activeOpacity={1}
              style={styles.modalContent} 
              onPress={(e) => e.stopPropagation()}
            >
              {editingTask && (
                <>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setTaskEditVisible(false)}
                  >
                    <Ionicons name="close-outline" size={32} color="#000" />
                  </TouchableOpacity>
                
                  <Text style={styles.modalTitle}>Edit Task</Text>
                  
                  <TextInput
                    style={styles.taskNameInput}
                    value={editedTaskTitle}
                    onChangeText={setEditedTaskTitle}
                    placeholder="Task name"
                    placeholderTextColor="#aaa"
                    autoFocus={true}
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      if (editedTaskTitle.trim() !== '') {
                        updateTask(editingTask.id, { title: editedTaskTitle.trim() });
                        setTaskEditVisible(false);
                      }
                    }}
                  />
                  
                  <TouchableOpacity 
                    style={styles.continueButton}
                    onPress={() => {
                      if (editedTaskTitle.trim() === '') {
                        alert('Please enter a task name');
                        return;
                      }
                      
                      // Update the task with new title
                      updateTask(editingTask.id, { title: editedTaskTitle.trim() });
                      
                      // Close the edit modal
                      setTaskEditVisible(false);
                    }}
                  >
                    <Text style={styles.continueButtonText}>Update Task</Text>
                  </TouchableOpacity>
                </>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
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
    paddingTop: 0, // Remove top padding to bring content closer to the top
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20, // Reduced padding to move content up
    marginTop: 0, // Removed margin to reduce gap
    paddingRight: 5, // Add a little padding on the right for the menu button
  },
  todayText: {
    fontSize: 28, // Increased to match the design
    fontWeight: 'bold',
    color: '#000',
  },
  dateSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: -5,
  },
  menuButton: {
    padding: 5,
  },
  weekCalendarContainer: {
    marginBottom: 20,
  },
  weekCalendar: {
    marginBottom: 5,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  weekNavigationButton: {
    padding: 5,
  },
  todayButton: {
    backgroundColor: 'rgba(148, 108, 237, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 16, // Increased horizontal padding
    marginRight: 10, // Slightly increased spacing
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButtonText: {
    color: '#6A3EA1',
    fontWeight: '600',
    fontSize: 14, // Increased for better readability
  },
  menuButton: {
    padding: 5,
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
    backgroundColor: 'rgba(148, 108, 237, 0.2)', // Light purple background for the entire day container
    borderRadius: 24, // Increased border radius
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
    width: 40,
    height: 40, 
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  todayCircle: {
    backgroundColor: '#6A3EA1', // Purple for today, matching the selected style in screenshot
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
  taskContainer: {
    position: 'relative',
    marginBottom: 16, // Same as taskCard marginBottom
    backfaceVisibility: 'hidden', // Prevent any rendering artifacts
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#FFE8CC', // Light orange background
    borderRadius: 16,
    padding: 16,
    marginBottom: 0, // Moved margin to taskContainer
    alignItems: 'center',
    minHeight: 80, // Ensure consistent height
    position: 'relative', // Important for z-index to work properly
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
    fontSize: 14,
    color: '#666',
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
  taskSectionHeader: {
    backgroundColor: '#E9E3F5',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 16,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskSectionHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6A3EA1',
  },
  taskSectionSubText: {
    fontSize: 14,
    color: '#6A3EA1',
    opacity: 0.7,
  },
  taskDetailButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  // Task Detail Modal Styles
  taskDetailModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    minHeight: '40%', // Not as tall as the add task modal
    position: 'relative',
    paddingBottom: 40, // Added more bottom padding for better spacing
  },
  taskDetailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Changed from 'center' to align at the top
    marginBottom: 30,
    marginTop: 40, // Increased top margin to move everything further down
  },
  taskDetailIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 12, // Increased to move icon down more
  },
  taskDetailInfo: {
    flex: 1,
    paddingTop: 20, // Increased padding to move the title down more
  },
  taskDetailTime: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  taskDetailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  taskDetailCheckCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: 20, // Increased margin to move it down further
  },
  taskDetailDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
    lineHeight: 22,
  },
  editTaskButton: {
    backgroundColor: '#6A3EA1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto', // This will push the button to the bottom
    marginBottom: 10, // Add some bottom margin
  },
  editTaskButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Removed redundant styles as we're now using the same components as the Add Task modal
});
