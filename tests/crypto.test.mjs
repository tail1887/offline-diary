if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
import 'fake-indexeddb/auto'
import { encryptData, decryptData } from '../scripts/crypto.js';

describe('crypto.js Web Crypto API', () => {
  const password = 'test-password';
  const plainText = '암호화 테스트 데이터';

  test('encryptData should encrypt plain text', async () => {
    const encrypted = await encryptData(plainText, password);
    expect(encrypted).toHaveProperty('iv');
    expect(encrypted).toHaveProperty('data');
    expect(typeof encrypted.data).toBe('string');
    expect(Array.isArray(encrypted.iv)).toBe(true);
  });

  test('decryptData should recover original text', async () => {
    const encrypted = await encryptData(plainText, password);
    const decrypted = await decryptData(encrypted, password);
    expect(decrypted).toBe(plainText);
  });

  test('decryptData with wrong password should fail', async () => {
    const encrypted = await encryptData(plainText, password);
    await expect(decryptData(encrypted, 'wrong-password')).rejects.toThrow();
  });
});