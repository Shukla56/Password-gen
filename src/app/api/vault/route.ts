import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { VaultItem, User } from "@/lib/types";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { encrypt, decrypt } from "@/lib/crypto";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const client = await clientPromise;
    const usersCollection = client.db().collection<User>('users');
    const vaultCollection = client.db().collection<VaultItem>('vault');

    // Get user's encryption key
    const user = await usersCollection.findOne({ email: session.user.email });
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Get all vault items for the user
    const items = await vaultCollection
      .find({ userId: user._id })
      .sort({ updatedAt: -1 })
      .toArray();

    // Decrypt the sensitive data
    const decryptedItems = items.map(item => ({
      ...item,
      password: decrypt(item.password, user.encryptionKey),
      notes: item.notes ? decrypt(item.notes, user.encryptionKey) : undefined,
      _id: item._id.toString() // Convert ObjectId to string for JSON serialization
    }));

    return new NextResponse(JSON.stringify(decryptedItems), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("GET_VAULT_ITEMS_ERROR", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, username, password, url, notes } = await request.json();

    const client = await clientPromise;
    const usersCollection = client.db().collection<User>('users');
    const vaultCollection = client.db().collection<VaultItem>('vault');

    // Get user's encryption key
    const user = await usersCollection.findOne({ email: session.user.email });
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Encrypt sensitive data
    const encryptedPassword = encrypt(password, user.encryptionKey);
    const encryptedNotes = notes ? encrypt(notes, user.encryptionKey) : undefined;

    const vaultItem: VaultItem = {
      userId: user._id!,
      title,
      username,
      password: encryptedPassword,
      url,
      notes: encryptedNotes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await vaultCollection.insertOne(vaultItem);

    return new NextResponse(JSON.stringify({
      message: "Vault item created successfully"
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("CREATE_VAULT_ITEM_ERROR", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}