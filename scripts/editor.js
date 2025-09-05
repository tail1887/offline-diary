let editorInstance = null;

export function initEditor(containerId, initialValue = '') {
  if (!window.toastui || !window.toastui.Editor) {
    throw new Error('Toast UI Editor library not loaded');
  }
  editorInstance = new window.toastui.Editor({
    el: document.getElementById(containerId),
    height: '400px',
    initialEditType: 'markdown',
    previewStyle: 'vertical',
    initialValue: initialValue,
    hooks: {},
  });
  return editorInstance;
}

export function getEditorContent() {
  if (!editorInstance) throw new Error('Editor not initialized');
  return editorInstance.getMarkdown();
}

export function setEditorContent(content) {
  if (!editorInstance) throw new Error('Editor not initialized');
  editorInstance.setMarkdown(content);
}

export function destroyEditor() {
  if (editorInstance) {
    editorInstance.destroy();
    editorInstance = null;
  }
}