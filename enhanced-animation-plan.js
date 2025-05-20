// This is a visual of what we're attempting:
// Before animation:
// [A] - Being completed, will move down behind B, C, D
// [B] - Will slide up to take A's spot
// [C] - Will slide up to take B's spot
// [D] - Will slide up to take C's spot
// 
// After animation:
// [B]
// [C]
// [D]
// [A] - Now completed and at the bottom

// We need to:
// 1. Create animated values for all tasks (not just the completed one)
// 2. Animate the completed task sliding down
// 3. Simultaneously animate the other tasks sliding up
// 4. Update the data structure after all animations complete
