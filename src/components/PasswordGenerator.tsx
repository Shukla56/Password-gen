import React, { useState } from 'react';
import { generatePassword } from '@/lib/crypto';

interface PasswordGeneratorProps {
  onGenerate?: (password: string) => void;
}

export default function PasswordGenerator({ onGenerate }: PasswordGeneratorProps) {
  const [length, setLength] = useState(16);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeLookAlikes, setExcludeLookAlikes] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const newPassword = generatePassword(length, {
      includeNumbers,
      includeSymbols,
      excludeLookAlikes,
    });
    setPassword(newPassword);
    if (onGenerate) {
      onGenerate(newPassword);
    }
  };

  const handleCopy = async () => {
    if (password) {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow dark:bg-gray-800">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Password Generator
      </h2>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700 dark:text-gray-300">
            Length: {length}
          </label>
          <input
            type="range"
            min="8"
            max="32"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-2/3"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="rounded text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Include Numbers
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="rounded text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Include Symbols
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={excludeLookAlikes}
              onChange={(e) => setExcludeLookAlikes(e.target.checked)}
              className="rounded text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Exclude Look-alikes
            </span>
          </label>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={handleGenerate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Generate
        </button>
      </div>

      {password && (
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={password}
              readOnly
              className="flex-1 p-2 border rounded bg-gray-50 dark:bg-gray-700"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Password will be cleared from clipboard after 20 seconds
          </p>
        </div>
      )}
    </div>
  );
}