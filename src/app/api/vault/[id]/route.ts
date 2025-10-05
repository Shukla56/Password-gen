import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { VaultItem, User } from "@/lib/types";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { encrypt, decrypt } from "@/lib/crypto";

// GET: Fetch single vault item
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const client = await clientPromise;
    const usersCollection = client.db().collection<User>('users');
    const vaultCollection = client.db().collection<VaultItem>('vault');

    const user = await usersCollection.findOne({ email: session.user.email });
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const item = await vaultCollection.findOne({
      _id: new ObjectId(params.id),
      userId: user._id
    });

    if (!item) {
      return new NextResponse("Item not found", { status: 404 });
    }

    // Decrypt sensitive data
    const decryptedItem = {
      ...item,
      password: decrypt(item.password, user.encryptionKey),
      notes: item.notes ? decrypt(item.notes, user.encryptionKey) : undefined
    };

    return new NextResponse(JSON.stringify(decryptedItem), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("GET_VAULT_ITEM_ERROR", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PUT: Update vault item
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, username, password, url, notes } = await request.json();

    const client = await clientPromise;
    const usersCollection = client.db().collection<User>('users');
    const vaultCollection = client.db().collection<VaultItem>('vault');

    const user = await usersCollection.findOne({ email: session.user.email });
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const existingItem = await vaultCollection.findOne({
      _id: new ObjectId(params.id),
      userId: user._id
    });

    if (!existingItem) {
      return new NextResponse("Item not found", { status: 404 });
    }

    const encryptedPassword = encrypt(password, user.encryptionKey);
    const encryptedNotes = notes ? encrypt(notes, user.encryptionKey) : undefined;

    await vaultCollection.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          title,
          username,
          password: encryptedPassword,
          url,
          notes: encryptedNotes,
          updatedAt: new Date()
        }
      }
    );

    return new NextResponse(JSON.stringify({
      message: "Vault item updated successfully"
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("UPDATE_VAULT_ITEM_ERROR", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE: Remove vault item
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const client = await clientPromise;
    const usersCollection = client.db().collection<User>('users');
    const vaultCollection = client.db().collection<VaultItem>('vault');

    const user = await usersCollection.findOne({ email: session.user.email });
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const result = await vaultCollection.deleteOne({
      _id: new ObjectId(params.id),
      userId: user._id
    });

    if (result.deletedCount === 0) {
      return new NextResponse("Item not found", { status: 404 });
    }

    return new NextResponse(JSON.stringify({
      message: "Vault item deleted successfully"
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("DELETE_VAULT_ITEM_ERROR", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}