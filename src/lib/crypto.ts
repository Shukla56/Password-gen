import CryptoJS from 'crypto-js';

export const encrypt = (text: string, key: string): string => {
  return CryptoJS.AES.encrypt(text, key).toString();
};

export const decrypt = (ciphertext: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const generateKey = (length: number = 32): string => {
  return CryptoJS.lib.WordArray.random(length).toString();
};

export const generatePassword = (
  length: number = 16,
  options: {
    includeNumbers?: boolean;
    includeSymbols?: boolean;
    excludeLookAlikes?: boolean;
  } = {}
): string => {
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const lookAlikes = 'Il1O0';
  
  let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  if (options.includeNumbers) chars += numbers;
  if (options.includeSymbols) chars += symbols;
  if (options.excludeLookAlikes) {
    chars = chars.split('').filter(char => !lookAlikes.includes(char)).join('');
  }

  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
};