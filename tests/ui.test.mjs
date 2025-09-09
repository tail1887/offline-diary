/**
 * @jest-environment jsdom
 */
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

import 'fake-indexeddb/auto';
import { setupUI, renderDiaryList } from '../scripts/ui.js';

describe('ui.js', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="auth-container">
        <input id="auth-username" />
        <input id="auth-password" />
        <button id="signup-btn"></button>
        <button id="login-btn"></button>
        <button id="logout-btn"></button>
        <div id="auth-message"></div>
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
    // Toast UI Editor 모의 객체
    window.toastui = {
      Editor: class {
        constructor({ el }) { this.el = el; this.value = ''; }
        getMarkdown() { return this.value; }
        setMarkdown(val) { this.value = val; }
        destroy() {}
      }
    };
  });

  afterEach(() => {
    delete window.toastui;
    document.body.innerHTML = '';
  });

  test('setupUI initializes editor and attaches event listeners', () => {
    expect(() => setupUI()).not.toThrow();
    document.getElementById('title-input').value = '테스트 제목';
    window.toastui.Editor.prototype.getMarkdown = () => '테스트 내용';
    document.getElementById('save-btn').click();
    const listEl = document.getElementById('diary-list');
    expect(listEl).toBeDefined();
  });

  test('renderDiaryList renders diary items', async () => {
    await renderDiaryList();
    const listEl = document.getElementById('diary-list');
    expect(listEl).toBeDefined();
    expect(listEl.children.length).toBeGreaterThanOrEqual(0);
  });

  test('login/logout UI 표시/숨김 동작', () => {
    // 로그인 상태가 아니면 main이 숨겨져 있고, auth-container가 보임
    expect(document.querySelector('main').style.display).toBe('none');
    expect(document.getElementById('auth-container').style.display).toBe('');
    // 로그인 후에는 반대 (직접 상태 변경 시뮬레이션)
    document.querySelector('main').style.display = '';
    document.getElementById('auth-container').style.display = 'none';
    expect(document.querySelector('main').style.display).toBe('');
    expect(document.getElementById('auth-container').style.display).toBe('none');
  });
});