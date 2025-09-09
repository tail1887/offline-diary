/**
 * @jest-environment jsdom
 */

if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (!global.crypto) global.crypto = {};
if (!global.crypto.subtle) {
  global.crypto.subtle = {
    async digest(alg, data) {
      // 간단한 mock: 실제 해시 대신 더미 값 반환
      return new Uint8Array([1,2,3,4]).buffer;
    }
  };
}

import 'fake-indexeddb/auto';
import { setupUI } from '../scripts/ui.js';

describe('ui.js 회원가입/로그인/비밀번호 토글', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="login-container" class="auth-box">
        <input id="login-username" />
        <input id="login-password" type="password" />
        <button id="login-btn"></button>
        <button id="show-signup-btn"></button>
        <div id="login-message"></div>
      </div>
      <div id="signup-container" class="auth-box" style="display:none;">
        <input id="signup-username" />
        <input id="signup-password" type="password" />
        <input id="signup-password-confirm" type="password" />
        <button id="signup-btn"></button>
        <button id="show-login-btn"></button>
        <button id="toggle-signup-password"></button>
        <button id="toggle-signup-password-confirm"></button>
        <div id="signup-message"></div>
      </div>
      <main style="display:none;">
        <input id="title-input" />
        <input id="search-input" />
        <select id="category-select"><option value="">All</option></select>
        <select id="sort-select"><option value="latest">Latest</option></select>
        <button id="save-btn"></button>
        <button id="cancel-btn"></button>
        <button id="delete-btn"></button>
        <div id="editor-container"></div>
        <div id="diary-list"></div>
      </main>
      <div id="toast"></div>
    `;
    window.toastui = {
      Editor: class {
        constructor({ el }) { this.el = el; this.value = ''; }
        getMarkdown() { return this.value; }
        setMarkdown(val) { this.value = val; }
        destroy() {}
      }
    };
    // DOMContentLoaded 이벤트 강제 트리거 (ui.js 이벤트 연결 보장)
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  afterEach(() => {
    delete window.toastui;
    document.body.innerHTML = '';
  });

  test('회원가입 폼: 비밀번호 불일치 시 에러 메시지', async () => {
    const signupBtn = document.getElementById('signup-btn');
    document.getElementById('signup-username').value = 'testuser';
    document.getElementById('signup-password').value = 'pw1234';
    document.getElementById('signup-password-confirm').value = 'pw5678';
    signupBtn.click();
    await new Promise(r => setTimeout(r, 50));
    expect(document.getElementById('signup-message').textContent).toMatch(/일치하지 않습니다/);
  });

  test('회원가입 폼: 비밀번호 일치 시 성공 메시지', async () => {
    const signupBtn = document.getElementById('signup-btn');
    document.getElementById('signup-username').value = 'testuser';
    document.getElementById('signup-password').value = 'pw1234';
    document.getElementById('signup-password-confirm').value = 'pw1234';
    signupBtn.click();
    await new Promise(r => setTimeout(r, 150));
    expect(document.getElementById('signup-message').textContent).toMatch(/성공|로그인/);
  });

  test('비밀번호 토글 버튼 동작', () => {
    const pwInput = document.getElementById('signup-password');
    const pwToggleBtn = document.getElementById('toggle-signup-password');
    pwInput.value = 'pw1234';
    expect(pwInput.type).toBe('password');
    pwToggleBtn.click();
    expect(pwInput.type).toBe('text');
    pwToggleBtn.click();
    expect(pwInput.type).toBe('password');
  });

  test('로그인 폼: 입력값 없으면 에러 메시지', async () => {
    const loginBtn = document.getElementById('login-btn');
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    loginBtn.click();
    await new Promise(r => setTimeout(r, 50));
    expect(document.getElementById('login-message').textContent).toMatch(/아이디를 입력|비밀번호를 입력/);
  });

  test('폼 전환 버튼 동작', () => {
    const showSignupBtn = document.getElementById('show-signup-btn');
    const showLoginBtn = document.getElementById('show-login-btn');
    // 회원가입 폼으로 전환
    showSignupBtn.click();
    expect(document.getElementById('login-container').style.display).toBe('none');
    expect(document.getElementById('signup-container').style.display).toBe('');
    // 다시 로그인 폼으로 전환
    showLoginBtn.click();
    expect(document.getElementById('signup-container').style.display).toBe('none');
    expect(document.getElementById('login-container').style.display).toBe('');
  });
});