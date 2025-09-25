// Script to generate bcrypt hashes for admin passwords
// Run this to get properly hashed passwords for your admin users

import bcrypt from "bcryptjs"

const passwords = [
  { email: "admin@university.edu", password: "admin123" },
  { email: "complaints@university.edu", password: "complaints2024" },
]

async function hashPasswords() {
  console.log("[v0] Generating password hashes...\n")

  for (const user of passwords) {
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(user.password, saltRounds)

    console.log(`Email: ${user.email}`)
    console.log(`Password: ${user.password}`)
    console.log(`Hash: ${hashedPassword}\n`)

    console.log(`SQL Insert:`)
    console.log(
      `INSERT INTO admins (name, email, password_hash, created_at) VALUES ('Admin User', '${user.email}', '${hashedPassword}', NOW());\n`,
    )
    console.log("---\n")
  }
}

hashPasswords().catch(console.error)
