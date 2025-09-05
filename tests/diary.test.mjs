if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
import 'fake-indexeddb/auto'
import { createDiary, readDiary, updateDiary, deleteDiaryEntry, listDiaries } from '../scripts/diary.js';

describe('diary.js CRUD', () => {
  let diaryId = '';
  const diaryData = {
    title: 'CRUD Test',
    content: '<p>Diary Content</p>',
    date: '2025-09-05',
    tags: ['crud'],
    categories: ['test'],
    isBookmarked: false,
    isEncrypted: false,
    mood: '',
    weather: ''
  };

  test('createDiary should create a diary', async () => {
    const diary = await createDiary(diaryData);
    diaryId = diary.id;
    expect(diary.title).toBe('CRUD Test');
    expect(diary.id).toBeDefined();
  });

  test('readDiary should get the diary', async () => {
    const diary = await readDiary(diaryId);
    expect(diary).toBeDefined();
    expect(diary.title).toBe('CRUD Test');
  });

  test('updateDiary should update the diary', async () => {
    const updated = await updateDiary(diaryId, { title: 'Updated Title' });
    expect(updated.title).toBe('Updated Title');
    expect(updated.updatedAt).not.toBe(updated.createdAt);
  });

  test('listDiaries should include the diary', async () => {
    const diaries = await listDiaries();
    expect(diaries.find(d => d.id === diaryId)).toBeDefined();
  });

  test('deleteDiaryEntry should remove the diary', async () => {
    await expect(deleteDiaryEntry(diaryId)).resolves.toBe(true);
    const diary = await readDiary(diaryId);
    expect(diary).toBeUndefined();
  });
});