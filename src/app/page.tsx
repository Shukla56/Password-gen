'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { VaultItem } from '@/lib/types';
import VaultList from '@/components/VaultList';
import VaultItemForm from '@/components/VaultItemForm';
import PasswordGenerator from '@/components/PasswordGenerator';
import { toast } from 'react-hot-toast';

export default function Home() {
  const { data: session } = useSession();
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isPasswordGeneratorVisible, setIsPasswordGeneratorVisible] = useState(false);

  const fetchVaultItems = async () => {
    try {
      const response = await fetch('/api/vault');
      if (!response.ok) throw new Error('Failed to fetch vault items');
      const data = await response.json();
      setVaultItems(data);
    } catch (error: unknown) {
      console.error('Failed to load vault items:', error);
      toast.error('Failed to load vault items');
    }
  };

  useEffect(() => {
    if (session) {
      fetchVaultItems();
    }
  }, [session]);

  const handleCreateItem = async (data: Partial<VaultItem>) => {
    try {
      const response = await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create vault item');

      toast.success('Item created successfully');
      setIsFormVisible(false);
      fetchVaultItems();
    } catch (error: unknown) {
      console.error('Failed to create item:', error);
      toast.error('Failed to create item');
    }
  };

  const handleUpdateItem = async (data: Partial<VaultItem>) => {
    if (!editingItem?._id) return;

    try {
      const response = await fetch(`/api/vault/${editingItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update vault item');

      toast.success('Item updated successfully');
      setEditingItem(null);
      fetchVaultItems();
    } catch (error: unknown) {
      console.error('Failed to update item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/vault/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete vault item');

      toast.success('Item deleted successfully');
      fetchVaultItems();
    } catch (error: unknown) {
      console.error('Failed to delete item:', error);
      toast.error('Failed to delete item');
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Password Vault</h1>
          <p className="text-lg text-gray-600">
            Please <a href="/auth/signin" className="text-blue-600 hover:underline">sign in</a> to access your vault.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Password Vault
        </h1>
        <div className="space-x-4">
          <button
            onClick={() => setIsPasswordGeneratorVisible(!isPasswordGeneratorVisible)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Password Generator
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsFormVisible(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Add New Item
          </button>
        </div>
      </div>

      {isPasswordGeneratorVisible && (
        <div className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Generate Password
              </h2>
              <button
                onClick={() => setIsPasswordGeneratorVisible(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <PasswordGenerator />
          </div>
        </div>
      )}

      {(isFormVisible || editingItem) && (
        <div className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsFormVisible(false);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <VaultItemForm
              mode={editingItem ? 'edit' : 'create'}
              initialData={editingItem || undefined}
              onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
            />
          </div>
        </div>
      )}

      <VaultList
        items={vaultItems}
        onEdit={(item) => {
          setIsFormVisible(false);
          setEditingItem(item);
        }}
        onDelete={handleDeleteItem}
      />
    </main>
  );
}
