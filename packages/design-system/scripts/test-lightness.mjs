/**
 * Generates a strictly monotonic array of 12 Lightness values.
 * @param {number} l1 - Step 1 lightness (e.g. 0.985)
 * @param {number} l9 - Step 9 lightness (e.g. 0.55)
 * @param {number} l12 - Step 12 lightness (e.g. 0.20)
 * @param {'light'|'dark'} mode - Mode
 * @returns {number[]} Array of 12 lightness values.
 */
function generateMonotonicLightness(l1, l9, l12, mode) {
  const result = new Array(12);
  result[0] = l1;
  result[8] = l9;
  result[11] = l12;
  
  // Easing function for smooth ramp (ease-in-out approximation)
  // We want the steps 1-9 to curve smoothly. 
  // For light mode, lightness goes down. 
  
  // 1 to 9 (indices 0 to 8)
  for (let i = 1; i < 8; i++) {
    const t = i / 8; 
    // slight ease-in to keep 1-4 very light
    const ease = Math.pow(t, 1.5);
    result[i] = l1 + (l9 - l1) * ease;
  }
  
  // 9 to 12 (indices 8 to 11)
  for (let i = 9; i < 11; i++) {
    const t = (i - 8) / 3;
    const ease = t; // linear drop off for text
    result[i] = l9 + (l12 - l9) * ease;
  }
  
  // Format to 3 decimal places
  return result.map(v => Number(v.toFixed(3)));
}

console.log("Blue Light:", generateMonotonicLightness(0.985, 0.52, 0.20, 'light'));
console.log("Blue Dark: ", generateMonotonicLightness(0.12, 0.52, 0.94, 'dark'));
console.log("Yellow Light:", generateMonotonicLightness(0.99, 0.82, 0.35, 'light'));
console.log("Yellow Dark: ", generateMonotonicLightness(0.08, 0.82, 0.98, 'dark'));
