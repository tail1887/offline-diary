import { createDiary, updateDiary, deleteDiaryEntry, listDiaries, readDiary } from './diary.js';
import { initEditor, getEditorContent, setEditorContent, destroyEditor } from './editor.js';
import { searchDiaries, filterByCategory, sortDiaries } from './filter.js';
import { createAccount, login, logout, getLoggedInUser } from './user.js';

let selectedDiaryId = null;

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

function resetEditor() {
  setEditorContent('');
  const titleInput = document.getElementById('title-input');
  if (titleInput) titleInput.value = '';
  selectedDiaryId = null;
  const cancelBtn = document.getElementById('cancel-btn');
  const deleteBtn = document.getElementById('delete-btn');
  const saveBtn = document.getElementById('save-btn');
  if (cancelBtn) cancelBtn.style.display = 'none';
  if (deleteBtn) deleteBtn.style.display = 'none';
  if (saveBtn) saveBtn.textContent = '저장';
  document.querySelectorAll('.diary-item').forEach(el => el.classList.remove('selected'));
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
    item.className = 'diary-item' + (diary.id === selectedDiaryId ? ' selected' : '');
    item.textContent = `${diary.title} (${diary.date})`;
    item.onclick = async () => {
      selectedDiaryId = diary.id;
      setEditorContent(diary.content);
      const titleInput = document.getElementById('title-input');
      if (titleInput) titleInput.value = diary.title;
      const cancelBtn = document.getElementById('cancel-btn');
      const deleteBtn = document.getElementById('delete-btn');
      const saveBtn = document.getElementById('save-btn');
      if (cancelBtn) cancelBtn.style.display = '';
      if (deleteBtn) deleteBtn.style.display = '';
      if (saveBtn) saveBtn.textContent = '수정';
      document.querySelectorAll('.diary-item').forEach(el => el.classList.remove('selected'));
      item.classList.add('selected');
    };
    listEl.appendChild(item);
  });
}

function showMessage(msg) {
  const msgEl = document.getElementById('auth-message');
  if (msgEl) msgEl.textContent = msg;
}

// 로그인/회원가입/로그아웃 버튼 이벤트 연결
document.addEventListener('DOMContentLoaded', () => {
  const signupBtn = document.getElementById('signup-btn');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');

  if (signupBtn) {
    signupBtn.addEventListener('click', async () => {
      const username = document.getElementById('auth-username').value;
      const password = document.getElementById('auth-password').value;
      try {
        await createAccount(username, password);
        showMessage('회원가입 성공! 로그인하세요.');
      } catch (e) {
        showMessage(e.message);
      }
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const username = document.getElementById('auth-username').value;
      const password = document.getElementById('auth-password').value;
      try {
        await login(username, password);
        showMessage('로그인 성공!');
        document.getElementById('auth-container').style.display = 'none';
        document.querySelector('main').style.display = '';
        if (logoutBtn) logoutBtn.style.display = '';
        setupUI(); // 로그인 성공 시에만 호출
      } catch (e) {
        showMessage(e.message);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logout();
      showMessage('로그아웃 되었습니다.');
      document.getElementById('auth-container').style.display = '';
      document.querySelector('main').style.display = 'none';
      logoutBtn.style.display = 'none';
    });
  }

  // 페이지 로드 시 로그인 상태 체크
  if (!getLoggedInUser()) {
    document.getElementById('auth-container').style.display = '';
    document.querySelector('main').style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  } else {
    document.getElementById('auth-container').style.display = 'none';
    document.querySelector('main').style.display = '';
    if (logoutBtn) logoutBtn.style.display = '';
    setupUI(); // 로그인 상태면 바로 UI 초기화
  }
});

export function setupUI() {
  initEditor('editor-container');
  resetEditor();

  const saveBtn = document.getElementById('save-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const deleteBtn = document.getElementById('delete-btn');
  const searchInput = document.getElementById('search-input');
  const categorySelect = document.getElementById('category-select');
  const sortSelect = document.getElementById('sort-select');

  if (saveBtn) {
    saveBtn.onclick = async () => {
      const titleInput = document.getElementById('title-input');
      const title = titleInput ? titleInput.value.trim() : '';
      const content = getEditorContent();
      if (!title) {
        showToast('제목을 입력하세요!');
        return;
      }
      if (!content) {
        showToast('내용을 입력하세요!');
        return;
      }
      if (selectedDiaryId) {
        await updateDiary(selectedDiaryId, { title, content });
        showToast('일기가 수정되었습니다.');
      } else {
        await createDiary({ title, content, date: new Date().toISOString().slice(0, 10), categories: [], tags: [] });
        showToast('일기가 저장되었습니다.');
      }
      resetEditor();
      renderDiaryList();
    };
  }

  if (cancelBtn) {
    cancelBtn.onclick = () => {
      resetEditor();
    };
  }

  if (deleteBtn) {
    deleteBtn.onclick = async () => {
      if (selectedDiaryId) {
        await deleteDiaryEntry(selectedDiaryId);
        showToast('일기가 삭제되었습니다.');
        resetEditor();
        renderDiaryList();
      }
    };
  }

  if (searchInput) searchInput.oninput = renderDiaryList;
  if (categorySelect) categorySelect.onchange = renderDiaryList;
  if (sortSelect) sortSelect.onchange = renderDiaryList;

  renderDiaryList();
}