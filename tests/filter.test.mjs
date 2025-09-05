if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

import 'fake-indexeddb/auto'

import { searchDiaries, filterByCategory, filterByTag, sortDiaries } from '../scripts/filter.js';

const diaries = [
  {
    id: '1',
    title: 'First Diary',
    content: 'Hello world',
    date: '2025-09-01',
    tags: ['life', 'hello'],
    categories: ['personal'],
  },
  {
    id: '2',
    title: 'Second Diary',
    content: 'Coding is fun',
    date: '2025-09-03',
    tags: ['coding'],
    categories: ['work'],
  },
  {
    id: '3',
    title: 'Third Diary',
    content: 'Travel log',
    date: '2025-08-30',
    tags: ['travel'],
    categories: ['personal'],
  }
];

describe('filter.js', () => {
  test('searchDiaries finds by title/content/tag', () => {
    expect(searchDiaries(diaries, 'coding').length).toBe(1);
    expect(searchDiaries(diaries, 'hello').length).toBe(1);
    expect(searchDiaries(diaries, 'Diary').length).toBe(3);
    expect(searchDiaries(diaries, '').length).toBe(3);
  });

  test('filterByCategory filters diaries', () => {
    expect(filterByCategory(diaries, 'personal').length).toBe(2);
    expect(filterByCategory(diaries, 'work').length).toBe(1);
    expect(filterByCategory(diaries, '').length).toBe(3);
  });

  test('filterByTag filters diaries', () => {
    expect(filterByTag(diaries, 'coding').length).toBe(1);
    expect(filterByTag(diaries, 'travel').length).toBe(1);
    expect(filterByTag(diaries, '').length).toBe(3);
  });

  test('sortDiaries sorts by latest, oldest, title', () => {
    const latest = sortDiaries(diaries, 'latest');
    expect(latest[0].id).toBe('2');
    const oldest = sortDiaries(diaries, 'oldest');
    expect(oldest[0].id).toBe('3');
    const byTitle = sortDiaries(diaries, 'title');
    expect(byTitle[0].id).toBe('1');
  });
});