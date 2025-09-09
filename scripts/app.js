import { getLoggedInUser } from './user.js';

document.addEventListener('DOMContentLoaded', () => {
  if (!getLoggedInUser()) {
    // 로그인 폼만 표시
    document.getElementById('auth-container').style.display = '';
    document.getElementById('main-app-container').style.display = 'none';
  } else {
    // 일기 앱 UI 표시
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('main-app-container').style.display = '';
  }
});