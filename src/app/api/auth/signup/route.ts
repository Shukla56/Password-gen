import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { generateKey, encrypt } from "@/lib/crypto";
import { User } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new NextResponse("Missing email or password", { status: 400 });
    }

    const client = await clientPromise;
    const usersCollection = client.db().collection<User>('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    // Generate encryption key for user's vault items
    const encryptionKey = generateKey();
    
    // Hash password and encrypt the encryption key with user's password
    const hashedPassword = await bcrypt.hash(password, 12);
    const encryptedKey = encrypt(encryptionKey, password);

    const user: User = {
      email,
      password: hashedPassword,
      encryptionKey: encryptedKey,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await usersCollection.insertOne(user);

    return new NextResponse(JSON.stringify({
      message: "User created successfully"
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("SIGNUP_ERROR", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}