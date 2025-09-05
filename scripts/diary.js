import { saveDiary, getDiary, deleteDiary, getAllDiaries } from './storage.js';

export async function createDiary(diaryData) {
  const diary = {
    ...diaryData,
    id: diaryData.id || crypto.randomUUID(),
    createdAt: diaryData.createdAt || new Date().toISOString(),
    updatedAt: diaryData.updatedAt || new Date().toISOString(),
  };
  await saveDiary(diary);
  return diary;
}

export async function readDiary(id) {
  return await getDiary(id);
}

export async function updateDiary(id, updates) {
  const diary = await getDiary(id);
  if (!diary) throw new Error('Diary not found');
  const updatedDiary = {
    ...diary,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await saveDiary(updatedDiary);
  return updatedDiary;
}

export async function deleteDiaryEntry(id) {
  await deleteDiary(id);
  return true;
}

export async function listDiaries() {
  return await getAllDiaries();
}