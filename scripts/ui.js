import { createDiary, updateDiary, deleteDiaryEntry, listDiaries, readDiary } from './diary.js';
import { initEditor, getEditorContent, setEditorContent, destroyEditor } from './editor.js';
import { searchDiaries, filterByCategory, sortDiaries } from './filter.js';
import { createAccount, login, logout, getLoggedInUser } from './user.js';

let selectedDiaryId = null;

// 공통 토스트 메시지
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
  }
}

// 폼별 메시지 표시
function showLoginMessage(msg) {
  const msgEl = document.getElementById('login-message');
  if (msgEl) msgEl.textContent = msg;
}
function showSignupMessage(msg) {
  const msgEl = document.getElementById('signup-message');
  if (msgEl) msgEl.textContent = msg;
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

// UI 전체 초기화 및 이벤트 등록
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

// 로그인/회원가입 폼 전환 및 이벤트 연결
document.addEventListener('DOMContentLoaded', () => {
  // 폼 전환 버튼
  const showSignupBtn = document.getElementById('show-signup-btn');
  if (showSignupBtn) {
    showSignupBtn.onclick = () => {
      document.getElementById('login-container').style.display = 'none';
      document.getElementById('signup-container').style.display = '';
    };
  }
  const showLoginBtn = document.getElementById('show-login-btn');
  if (showLoginBtn) {
    showLoginBtn.onclick = () => {
      document.getElementById('signup-container').style.display = 'none';
      document.getElementById('login-container').style.display = '';
    };
  }
  // 회원가입 이벤트
  const signupBtn = document.getElementById('signup-btn');
  if (signupBtn) {
    signupBtn.onclick = async () => {
      const username = document.getElementById('signup-username').value;
      const password = document.getElementById('signup-password').value;
      try {
        await createAccount(username, password);
        showSignupMessage('회원가입 성공! 로그인하세요.');
        setTimeout(() => {
          document.getElementById('signup-container').style.display = 'none';
          document.getElementById('login-container').style.display = '';
        }, 1200);
      } catch (e) {
        showSignupMessage(e.message);
      }
    };
  }

  // 로그인 이벤트
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.onclick = async () => {
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;
      try {
        await login(username, password);
        showLoginMessage('로그인 성공!');
        document.getElementById('login-container').style.display = 'none';
        document.querySelector('main').style.display = '';
        setupUI();
      } catch (e) {
        showLoginMessage(e.message);
      }
    };
  }

  // 로그아웃 이벤트
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      logout();
      showToast('로그아웃 되었습니다.');
      document.querySelector('main').style.display = 'none';
      document.getElementById('login-container').style.display = '';
    };
  }

  // 페이지 로드 시 로그인 상태 체크
  if (!getLoggedInUser()) {
    document.querySelector('main').style.display = 'none';
    document.getElementById('login-container').style.display = '';
    document.getElementById('signup-container').style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  } else {
    document.querySelector('main').style.display = '';
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('signup-container').style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = '';
    setupUI();
  }
});