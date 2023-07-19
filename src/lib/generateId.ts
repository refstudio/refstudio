/**
 * Returns a random ID of "size" characteres in uppercase.
 * Example: X4A41VN3A
 *
 * @param size size of the random ID (max of 10)
 */
export function generateId(size = 9) {
  return Math.random().toString(36).substring(2, size).toUpperCase();
}
