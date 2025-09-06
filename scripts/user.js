const USER_DB = 'offlineDiaryUser';
const USER_STORE = 'users';

function openUserDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(USER_DB, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(USER_STORE)) {
        db.createObjectStore(USER_STORE, { keyPath: 'username' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function createAccount(username, password) {
  const passwordHash = await hashPassword(password); // 먼저 해시 처리
  const db = await openUserDB();
  const tx = db.transaction(USER_STORE, 'readwrite');
  const store = tx.objectStore(USER_STORE);

  const existing = await new Promise((resolve) => {
    const req = store.get(username);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
  if (existing) throw new Error('Username already exists');

  const user = { username, passwordHash, createdAt: new Date().toISOString() };
  store.put(user);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(user);
    tx.onerror = () => reject(tx.error);
  });
}

export async function login(username, password) {
  const db = await openUserDB();
  const tx = db.transaction(USER_STORE, 'readonly');
  const store = tx.objectStore(USER_STORE);
  const user = await new Promise((resolve) => {
    const req = store.get(username);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
  if (!user) throw new Error('User not found');
  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) throw new Error('Incorrect password');
  sessionStorage.setItem('loggedInUser', username);
  return user;
}

export function logout() {
  sessionStorage.removeItem('loggedInUser');
}

export function getLoggedInUser() {
  return sessionStorage.getItem('loggedInUser');
}