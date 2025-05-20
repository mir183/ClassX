// This is a temporary file with the fixed animation code
// Copy this improved animation code into your project

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
        // First make sure it has a lower z-index to go behind other tasks
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
