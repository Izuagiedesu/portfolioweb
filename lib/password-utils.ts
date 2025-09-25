// Simple password verification utility
// In production, you would use bcrypt or similar for proper hashing

export function verifyPassword(plainPassword: string, username: string): boolean {
  // Map of usernames to their correct passwords
  const passwordMap: { [key: string]: string } = {
    admin: "admin123",
    dss: "dss2024",
    complaints: "complaints",
    university: "university",
    bowen: "bowen123",
  }

  return passwordMap[username] === plainPassword
}

export function hashPassword(password: string): string {
  // In production, use proper bcrypt hashing
  // For now, return a placeholder hash
  return "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"
}
