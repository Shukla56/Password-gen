import React, { useState } from 'react';
import { VaultItem } from '@/lib/types';
import PasswordGenerator from './PasswordGenerator';

interface VaultItemFormProps {
  onSubmit: (data: Partial<VaultItem>) => Promise<void>;
  initialData?: Partial<VaultItem>;
  mode: 'create' | 'edit';
}

export default function VaultItemForm({
  onSubmit,
  initialData,
  mode
}: VaultItemFormProps) {
  const [formData, setFormData] = useState<Partial<VaultItem>>({
    title: initialData?.title || '',
    username: initialData?.username || '',
    password: initialData?.password || '',
    url: initialData?.url || '',
    notes: initialData?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGeneratedPassword = (password: string) => {
    setFormData((prev) => ({ ...prev, password }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          value={formData.title}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          required
          value={formData.username}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Password
        </label>
        <div className="mt-1 space-y-4">
          <input
            type="text"
            id="password"
            name="password"
            required
            value={formData.password}
            onChange={handleInputChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <PasswordGenerator onGenerate={handleGeneratedPassword} />
        </div>
      </div>

      <div>
        <label
          htmlFor="url"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          URL (optional)
        </label>
        <input
          type="url"
          id="url"
          name="url"
          value={formData.url}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          value={formData.notes}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {mode === 'create' ? 'Create' : 'Update'}
        </button>
      </div>
    </form>
  );
}