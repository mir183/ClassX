# Task Animation Improvements

To fix the bouncing effect at the end of the animation and ensure tasks slide behind other tasks properly, make the following changes to your RoutineScreen.js file:

## 1. Improve the `toggleTaskCompletion` Function

Replace your current implementation with this improved version:

```javascript
// Toggle task completion status with animation
const toggleTaskCompletion = (taskId) => {
  const taskToUpdate = tasks.find(task => task.id === taskId);
  const newCompletedValue = !taskToUpdate.completed;
  
  // Get the animated values for this task
  const animatedValues = getTaskAnimatedValue(taskId);
  
  if (newCompletedValue) {
    // Task is being completed - animate it
    setAnimatingTaskId(taskId);
    
    // Calculate how far we need to move to reach the bottom of the list
    // Get number of incomplete tasks to move behind (as it will become the last task)
    const incompleteTasksCount = filteredTasks
      .filter(t => !t.completed && t.id !== taskId).length;
    
    // Each task is approximately 96px tall (80px + 16px margin)
    // We need to move exactly the height needed to get to the bottom of incomplete tasks
    const moveDistance = incompleteTasksCount * 96;
    
    // Set up animation sequence
    Animated.sequence([
      // First make sure it has a lower opacity to see it going behind
      Animated.timing(animatedValues.opacity, {
        toValue: 0.8, // Slightly transparent to better see it going behind
        duration: 100,
        useNativeDriver: true
      }),
      
      // Then animate it moving down
      Animated.timing(animatedValues.translateY, {
        toValue: moveDistance,
        duration: 1200, // Slow enough to see but not too slow
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease) // Smooth transition without bouncing
      })
    ]).start(() => {
      // Update the actual data structures behind the scenes
      const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, completed: newCompletedValue };
        }
        return task;
      });
      
      // Reset animation values
      animatedValues.translateY.setValue(0);
      animatedValues.opacity.setValue(1);
      
      // Update state after animation completes
      setTasks(updatedTasks);
      setAnimatingTaskId(null);
    });
    
    return; // We'll update the tasks after animation completes
  } 
  
  // For toggling from completed to incomplete - no animation needed
  const updatedTasks = tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, completed: newCompletedValue };
    }
    return task;
  });
  setTasks(updatedTasks);
};
```

## 2. Update the Task Rendering in the ScrollView

Enhance the Animated.View wrapper for tasks with a cleaner style implementation:

```javascript
{/* Task List */}
<ScrollView style={styles.taskList}>
  {filteredTasks.map(task => (
    <Animated.View
      key={task.id}
      style={[
        styles.taskContainer,
        {
          // Apply very low z-index during animation to ensure it goes behind other tasks
          zIndex: animatingTaskId === task.id ? -1 : (task.completed ? 0 : 10),
          
          // For Android, use elevation
          elevation: animatingTaskId === task.id ? 0 : (task.completed ? 0 : 3),
          
          // The transform and opacity animations  
          transform: [{ 
            translateY: animatingTaskId === task.id 
              ? getTaskAnimatedValue(task.id).translateY 
              : 0 
          }],
          opacity: animatingTaskId === task.id 
            ? getTaskAnimatedValue(task.id).opacity 
            : 1
        }
      ]}
    >
      {/* Keep your existing Swipeable component */}
      <Swipeable
        // ...existing Swipeable code
      >
        {/* Keep your existing TouchableOpacity */}
        <TouchableOpacity 
          // ...existing TouchableOpacity code
        >
          <View style={styles.taskCard}>
            {/* ...existing task card content */}
          </View>
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  ))}
  {/* Keep your empty state code */}
</ScrollView>
```

## 3. Add a New Style for Task Container

Add this new style to your StyleSheet:

```javascript
taskContainer: {
  position: 'relative',
  marginBottom: 16, // Same as taskCard marginBottom
},
```

## 4. Update taskCard Style (Optional)

If you still see any z-index issues, make sure your taskCard style includes:

```javascript
taskCard: {
  // ...existing styles
  position: 'relative',
  // Remove any marginBottom from here since it's now in taskContainer
},
```

## Key Improvements

1. **Eliminated Bouncing Effect**: Using `Easing.inOut(Easing.ease)` instead of `Easing.out(Easing.cubic)` for a smoother animation without bounce.

2. **Better Z-Index Handling**: Using consistent z-index values between Android and iOS.

3. **Cleaner Animation Sequence**: Using `Animated.sequence` to first change opacity then move the task.

4. **Improved Animation Duration**: Slightly shorter animation (1200ms vs 1500ms) for better user experience.

5. **Proper Task Height Calculation**: Removed the extra 10px that was causing the animation to go too far.
