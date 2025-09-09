import { Buffer } from 'buffer';

if (typeof globalThis.crypto === 'undefined' || typeof globalThis.crypto.subtle === 'undefined') {
  throw new Error('Web Crypto API (crypto.subtle) is not available in this environment. Node.js 20+ required.');
}

let TextEncoderClass, TextDecoderClass;

if (typeof window !== 'undefined' && window.TextEncoder) {
  TextEncoderClass = window.TextEncoder;
  TextDecoderClass = window.TextDecoder;
} else if (typeof globalThis.TextEncoder !== 'undefined') {
  TextEncoderClass = globalThis.TextEncoder;
  TextDecoderClass = globalThis.TextDecoder;
} else if (typeof require === 'function') {
  // Node.js 환경에서만 require 사용
  const util = require('util');
  TextEncoderClass = util.TextEncoder;
  TextDecoderClass = util.TextDecoder;
} else {
  throw new Error('TextEncoder/TextDecoder not available');
}

const encoder = new TextEncoderClass();
const decoder = new TextDecoderClass();

export async function generateKey(password) {
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return globalThis.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('offline-diary-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(plainText, password) {
  const key = await generateKey(password);
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await globalThis.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plainText)
  );
  return {
    iv: Array.from(iv),
    data: Buffer.from(encrypted).toString('base64')
  };
}

export async function decryptData(encryptedObj, password) {
  const key = await generateKey(password);
  const iv = new Uint8Array(encryptedObj.iv);
  const encryptedBytes = Buffer.from(encryptedObj.data, 'base64');
  const decrypted = await globalThis.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedBytes
  );
  return decoder.decode(decrypted);
}