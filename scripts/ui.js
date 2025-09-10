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
  const tagsInput = document.getElementById('tags-input');
  if (tagsInput) tagsInput.value = '';
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
    item.dataset.id = diary.id;
    // 태그 표시 추가
    const tagsText = diary.tags && diary.tags.length ? ` [${diary.tags.join(', ')}]` : '';
    item.textContent = `${diary.title} (${diary.date})${tagsText}`;
    item.onclick = async () => {
      // 미리보기 영역에 표시
      const previewSection = document.getElementById('preview-section');
      const previewTitle = document.getElementById('preview-title');
      const previewTags = document.getElementById('preview-tags');
      const previewContent = document.getElementById('preview-content');
      if (previewSection && previewTitle && previewTags && previewContent) {
        previewTitle.textContent = diary.title;
        previewTags.textContent = diary.tags ? diary.tags.join(', ') : '';
        previewContent.textContent = diary.content;
        previewSection.style.display = '';
        document.getElementById('edit-btn').dataset.id = diary.id;
      }
      // 목록에서 선택 표시
      document.querySelectorAll('.diary-item').forEach(el => el.classList.remove('selected'));
      item.classList.add('selected');
    };
    listEl.appendChild(item);
  });

  // 미리보기 영역 숨기기(목록이 비어있을 때)
  const previewSection = document.getElementById('preview-section');
  if (previewSection && filtered.length === 0) {
    previewSection.style.display = 'none';
  }
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
  const editBtn = document.getElementById('edit-btn');

  if (saveBtn) {
    saveBtn.onclick = async () => {
      const titleInput = document.getElementById('title-input');
      const title = titleInput ? titleInput.value.trim() : '';
      const tagsInput = document.getElementById('tags-input');
      const tags = tagsInput ? tagsInput.value.split(',').map(t => t.trim()).filter(Boolean) : [];
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
        await updateDiary(selectedDiaryId, { title, content, tags });
        showToast('일기가 수정되었습니다.');
      } else {
        await createDiary({ title, content, date: new Date().toISOString().slice(0, 10), categories: [], tags });
        showToast('일기가 저장되었습니다.');
      }
      resetEditor();
      renderDiaryList();
      // 저장 후 목록 화면으로 이동
      document.getElementById('editor-section').style.display = 'none';
      document.getElementById('list-section').style.display = '';
    };
  }

  if (cancelBtn) {
    cancelBtn.onclick = () => {
      resetEditor();
      document.getElementById('editor-section').style.display = 'none';
      document.getElementById('list-section').style.display = '';
    };
  }

  if (deleteBtn) {
    deleteBtn.onclick = async () => {
      if (selectedDiaryId) {
        await deleteDiaryEntry(selectedDiaryId);
        showToast('일기가 삭제되었습니다.');
        resetEditor();
        renderDiaryList();
        document.getElementById('editor-section').style.display = 'none';
        document.getElementById('list-section').style.display = '';
      }
    };
  }

  if (searchInput) searchInput.oninput = renderDiaryList;
  if (categorySelect) categorySelect.onchange = renderDiaryList;
  if (sortSelect) sortSelect.onchange = renderDiaryList;

  // "수정하기" 버튼 이벤트
  if (editBtn) {
    editBtn.onclick = async () => {
      const diaryId = editBtn.dataset.id;
      if (!diaryId) return;
      const diary = await readDiary(diaryId);
      document.getElementById('editor-section').style.display = '';
      document.getElementById('list-section').style.display = 'none';
      document.getElementById('title-input').value = diary.title;
      document.getElementById('tags-input').value = diary.tags ? diary.tags.join(', ') : '';
      setEditorContent(diary.content);
      selectedDiaryId = diary.id;
      saveBtn.textContent = '수정';
      cancelBtn.style.display = '';
      deleteBtn.style.display = '';
    };
  }

  renderDiaryList();
}

// 로그인/회원가입 폼 전환 및 이벤트 연결 + 메뉴바 버튼 이벤트 등록
document.addEventListener('DOMContentLoaded', () => {
  // 메뉴바 버튼 이벤트
  const navWriteBtn = document.getElementById('nav-write');
  const navListBtn = document.getElementById('nav-list');
  const logoutBtn = document.getElementById('logout-btn');
  if (navWriteBtn) {
    navWriteBtn.onclick = () => {
      document.querySelector('main').style.display = '';
      document.getElementById('editor-section').style.display = '';
      document.getElementById('list-section').style.display = 'none';
      resetEditor();
    };
  }
  if (navListBtn) {
    navListBtn.onclick = () => {
      document.querySelector('main').style.display = '';
      document.getElementById('editor-section').style.display = 'none';
      document.getElementById('list-section').style.display = '';
      renderDiaryList();
      // 미리보기 영역 숨김
      const previewSection = document.getElementById('preview-section');
      if (previewSection) previewSection.style.display = 'none';
    };
  }
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      logout();
      showToast('로그아웃 되었습니다.');
      document.querySelector('main').style.display = 'none';
      document.getElementById('main-navbar').style.display = 'none';
      document.getElementById('login-container').style.display = '';
      document.getElementById('signup-container').style.display = 'none';
    };
  }

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
      const username = document.getElementById('signup-username').value.trim();
      const password = document.getElementById('signup-password').value.trim();
      const passwordConfirm = document.getElementById('signup-password-confirm').value.trim();

      if (!username) {
        showSignupMessage('아이디를 입력하세요!');
        return;
      }
      if (!password) {
        showSignupMessage('비밀번호를 입력하세요!');
        return;
      }
      if (password !== passwordConfirm) {
        showSignupMessage('비밀번호가 일치하지 않습니다!');
        return;
      }
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
  // 비밀번호 보기/숨기기 토글 이벤트
  const pwInput = document.getElementById('signup-password');
  const pwToggleBtn = document.getElementById('toggle-signup-password');
  if (pwInput && pwToggleBtn) {
    pwToggleBtn.onclick = () => {
      pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
      pwToggleBtn.textContent = pwInput.type === 'password' ? '👁️' : '🙈';
    };
  }

  const pwConfirmInput = document.getElementById('signup-password-confirm');
  const pwConfirmToggleBtn = document.getElementById('toggle-signup-password-confirm');
  if (pwConfirmInput && pwConfirmToggleBtn) {
    pwConfirmToggleBtn.onclick = () => {
      pwConfirmInput.type = pwConfirmInput.type === 'password' ? 'text' : 'password';
      pwConfirmToggleBtn.textContent = pwConfirmInput.type === 'password' ? '👁️' : '🙈';
    };
  }
  // 로그인 이벤트
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.onclick = async () => {
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value.trim();
      if (!username) {
        showLoginMessage('아이디를 입력하세요!');
        return;
      }
      if (!password) {
        showLoginMessage('비밀번호를 입력하세요!');
        return;
      }
      try {
        await login(username, password);
        showLoginMessage('로그인 성공!');
        document.getElementById('login-container').style.display = 'none';
        document.querySelector('main').style.display = '';
        document.getElementById('main-navbar').style.display = '';
        document.getElementById('editor-section').style.display = 'none';
        document.getElementById('list-section').style.display = '';
        setupUI();
      } catch (e) {
        showLoginMessage(e.message);
      }
    };
  }

  // 페이지 로드 시 로그인 상태 체크
  if (!getLoggedInUser()) {
    document.querySelector('main').style.display = 'none';
    document.getElementById('login-container').style.display = '';
    document.getElementById('signup-container').style.display = 'none';
    document.getElementById('main-navbar').style.display = 'none'; // 메뉴바 숨김
  } else {
    document.querySelector('main').style.display = '';
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('signup-container').style.display = 'none';
    setupUI();
  }
});