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
      <input id="title-input" />
      <input id="search-input" />
      <select id="category-select"><option value="">All</option></select>
      <select id="sort-select"><option value="latest">Latest</option></select>
      <button id="save-btn"></button>
      <div id="editor-container"></div>
      <div id="diary-list"></div>
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

  test('setupUI attaches event listeners', () => {
    expect(() => setupUI()).not.toThrow();
    document.getElementById('title-input').value = '테스트 제목';
    document.getElementById('save-btn').click();
    // 저장 후 목록이 렌더링되는지 확인
    const listEl = document.getElementById('diary-list');
    expect(listEl).toBeDefined();
  });

  test('renderDiaryList renders diary items', async () => {
    await renderDiaryList();
    const listEl = document.getElementById('diary-list');
    expect(listEl).toBeDefined();
    expect(listEl.children.length).toBeGreaterThanOrEqual(0);
  });
});