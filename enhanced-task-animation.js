// Enhanced Task Animation
// This code provides a more realistic animation with tasks sliding up and down simultaneously

// Get or create animated value for a task
const getTaskAnimatedValue = (taskId) => {
  if (!taskAnimatedValues.has(taskId)) {
    taskAnimatedValues.set(taskId, {
      opacity: new Animated.Value(1),
      translateY: new Animated.Value(0),
      zIndex: new Animated.Value(10)
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
    
    // Calculate how far we need to move to reach the bottom of the list
    const incompleteTasksCount = filteredTasks
      .filter(t => !t.completed && t.id !== taskId).length;
    
    // Each task is approximately 96px tall (80px + 16px margin)
    const taskHeight = 96;
    const moveDistance = incompleteTasksCount * taskHeight;
    
    // Prepare animations for all tasks
    const animations = [];
    
    // Animation for the completed task (moving down)
    animations.push(
      Animated.sequence([
        // First make it slightly transparent
        Animated.timing(animatedValues.opacity, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true
        }),
        
        // Then animate it moving down
        Animated.timing(animatedValues.translateY, {
          toValue: moveDistance,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease)
        })
      ])
    );
    
    // For each task that needs to move up (tasks after the completed one that aren't completed)
    filteredTasks.forEach((task, index) => {
      // Only animate incomplete tasks that are below the completed task
      if (index > currentTaskIndex && !task.completed) {
        const taskAnimValues = getTaskAnimatedValue(task.id);
        
        // This task should move up by one position
        animations.push(
          Animated.timing(taskAnimValues.translateY, {
            toValue: -taskHeight, // Move up by one task height
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
          })
        );
      }
    });
    
    // Run all animations in parallel
    Animated.parallel(animations).start(() => {
      // Update the actual data structures behind the scenes
      const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, completed: newCompletedValue };
        }
        return task;
      });
      
      // Reset all animation values
      animatedValues.translateY.setValue(0);
      animatedValues.opacity.setValue(1);
      
      // Reset translate values for all other tasks
      filteredTasks.forEach(task => {
        if (task.id !== taskId) {
          getTaskAnimatedValue(task.id).translateY.setValue(0);
        }
      });
      
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

// Make sure to update the Animated.View in your task rendering:
// <Animated.View
//   key={task.id}
//   style={[
//     styles.taskContainer,
//     {
//       // Lower z-index for the task being completed so it slides behind others
//       zIndex: animatingTaskId === task.id ? -1 : (task.completed ? 0 : 10),
//       
//       // For Android, use elevation
//       elevation: animatingTaskId === task.id ? 0 : (task.completed ? 0 : 3),
//       
//       // Apply animations for both moving up and down
//       transform: [{ 
//         translateY: getTaskAnimatedValue(task.id).translateY
//       }],
//       
//       // Fade the task being completed
//       opacity: animatingTaskId === task.id 
//         ? getTaskAnimatedValue(task.id).opacity 
//         : 1
//     }
//   ]}
// >
//   {/* ... your existing task content ... */}
// </Animated.View>
