/**
 * Function to check equality between two arrays of string
 * Two arrays are equal when they have the same entries, in the same order
 */
export function areStringArraysEqual(arrayA: string[], arrayB: string[]) {
  return arrayA.length === arrayB.length && arrayA.every((entry, index) => entry === arrayB[index]);
}
