
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// sessionStorage mock 추가
global.sessionStorage = {
  _data: {},
  setItem(key, value) { this._data[key] = value; },
  getItem(key) { return this._data[key] || null; },
  removeItem(key) { delete this._data[key]; },
  clear() { this._data = {}; }
};

import 'fake-indexeddb/auto';
import { createAccount, login, logout, getLoggedInUser } from '../scripts/user.js';

describe('user.js 계정 생성 및 로그인', () => {
  const username = 'testuser';
  const password = 'testpass';

  beforeAll(async () => {
    logout();
    // 계정이 이미 있으면 삭제 (테스트 환경에서는 생략)
  });

  test('createAccount 생성', async () => {
    const user = await createAccount(username, password);
    expect(user.username).toBe(username);
    expect(user.passwordHash).toBeDefined();
  });

  test('login 성공', async () => {
    const user = await login(username, password);
    expect(user.username).toBe(username);
    expect(getLoggedInUser()).toBe(username);
  });

  test('login 실패 - 잘못된 비밀번호', async () => {
    await expect(login(username, 'wrongpass')).rejects.toThrow('Incorrect password');
  });

  test('logout 로그아웃', () => {
    logout();
    expect(getLoggedInUser()).toBeNull();
  });

  test('createAccount 실패 - 중복 아이디', async () => {
    await expect(createAccount(username, password)).rejects.toThrow('Username already exists');
  });
});