if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

import 'fake-indexeddb/auto'

import {
  saveDiary,
  getDiary,
  deleteDiary,
  getAllDiaries
} from '../scripts/storage.js';

describe('storage.js IndexedDB', () => {
  const testDiary = {
    id: 'test-id',
    title: 'Test Diary',
    content: '<p>Hello</p>',
    date: '2025-09-05',
    createdAt: '2025-09-05T12:00:00Z',
    updatedAt: '2025-09-05T12:00:00Z',
    tags: ['test'],
    categories: ['default'],
    isBookmarked: false,
    isEncrypted: false,
    mood: '',
    weather: ''
  };

  beforeAll(async () => {
    // 혹시 남아있을 이전 데이터 삭제
    await deleteDiary(testDiary.id);
  });

  test('saveDiary stores a diary', async () => {
    await expect(saveDiary(testDiary)).resolves.toBe(true);
  });

  test('getDiary retrieves a diary', async () => {
    const diary = await getDiary(testDiary.id);
    expect(diary).toBeDefined();
    expect(diary.title).toBe('Test Diary');
  });

  test('getAllDiaries returns array including the diary', async () => {
    const diaries = await getAllDiaries();
    expect(Array.isArray(diaries)).toBe(true);
    expect(diaries.some(d => d.id === testDiary.id)).toBe(true);
  });

  test('deleteDiary removes a diary', async () => {
    await expect(deleteDiary(testDiary.id)).resolves.toBe(true);
    const diary = await getDiary(testDiary.id);
    expect(diary).toBeUndefined();
  });
});