import { createDiary, updateDiary, deleteDiaryEntry, listDiaries, readDiary } from './diary.js';
import { initEditor, getEditorContent, setEditorContent, destroyEditor } from './editor.js';
import { searchDiaries, filterByCategory, sortDiaries } from './filter.js';

export function setupUI() {
  // 에디터 초기화
  initEditor('editor-container');

  // 일기 저장 버튼 이벤트
  document.getElementById('save-btn').addEventListener('click', async () => {
    const content = getEditorContent();
    const title = document.getElementById('title-input').value;
    const diaryData = {
      title,
      content,
      date: new Date().toISOString().slice(0, 10),
      tags: [],
      categories: [],
      isBookmarked: false,
      isEncrypted: false,
      mood: '',
      weather: ''
    };
    await createDiary(diaryData);
    renderDiaryList();
  });

  // 검색 이벤트
  document.getElementById('search-input').addEventListener('input', () => {
    renderDiaryList();
  });

  // 카테고리 필터 이벤트
  document.getElementById('category-select').addEventListener('change', () => {
    renderDiaryList();
  });

  // 정렬 이벤트
  document.getElementById('sort-select').addEventListener('change', () => {
    renderDiaryList();
  });

  // 초기 목록 렌더링
  renderDiaryList();
}

export async function renderDiaryList() {
  const diaries = await listDiaries();
  const keywordEl = document.getElementById('search-input');
  const categoryEl = document.getElementById('category-select');
  const sortEl = document.getElementById('sort-select');
  const listEl = document.getElementById('diary-list');

  const keyword = keywordEl ? keywordEl.value : '';
  const category = categoryEl ? categoryEl.value : '';
  const sortBy = sortEl ? sortEl.value : 'latest';

  let filtered = searchDiaries(diaries, keyword);
  filtered = filterByCategory(filtered, category);
  filtered = sortDiaries(filtered, sortBy);

  if (!listEl) return;
  listEl.innerHTML = '';
  filtered.forEach(diary => {
    const item = document.createElement('div');
    item.className = 'diary-item';
    item.textContent = `${diary.title} (${diary.date})`;
    item.onclick = async () => {
      const detail = await readDiary(diary.id);
      setEditorContent(detail.content);
      const titleInput = document.getElementById('title-input');
      if (titleInput) titleInput.value = detail.title;
    };
    listEl.appendChild(item);
  });
}