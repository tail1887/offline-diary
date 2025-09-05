/**
 * @jest-environment jsdom
 */
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
import 'fake-indexeddb/auto'

import { initEditor, getEditorContent, setEditorContent, destroyEditor } from '../scripts/editor.js';

describe('editor.js Toast UI Editor', () => {
  beforeAll(() => {
    // DOM 환경 준비
    document.body.innerHTML = '<div id="editor-container"></div>';
    // Toast UI Editor 모의 객체 생성
    window.toastui = {
      Editor: class {
        constructor({ el, initialValue }) {
          this.el = el;
          this.value = initialValue || '';
        }
        getMarkdown() { return this.value; }
        setMarkdown(val) { this.value = val; }
        destroy() { /* no-op */ }
      }
    };
  });

  afterAll(() => {
    destroyEditor();
    delete window.toastui;
  });

  test('initEditor should initialize editor', () => {
    const editor = initEditor('editor-container', 'Hello');
    expect(editor).toBeDefined();
    expect(getEditorContent()).toBe('Hello');
  });

  test('setEditorContent should update content', () => {
    setEditorContent('Updated');
    expect(getEditorContent()).toBe('Updated');
  });

  test('destroyEditor should clean up', () => {
    destroyEditor();
    expect(() => getEditorContent()).toThrow();
  });
});