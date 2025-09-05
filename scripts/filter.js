export function searchDiaries(diaries, keyword) {
  if (!keyword) return diaries;
  const lower = keyword.toLowerCase();
  return diaries.filter(diary =>
    diary.title.toLowerCase().includes(lower) ||
    diary.content.toLowerCase().includes(lower) ||
    (diary.tags && diary.tags.some(tag => tag.toLowerCase().includes(lower)))
  );
}

export function filterByCategory(diaries, category) {
  if (!category) return diaries;
  return diaries.filter(diary =>
    diary.categories && diary.categories.includes(category)
  );
}

export function filterByTag(diaries, tag) {
  if (!tag) return diaries;
  return diaries.filter(diary =>
    diary.tags && diary.tags.includes(tag)
  );
}

export function sortDiaries(diaries, sortBy = 'latest') {
  const sorted = [...diaries];
  switch (sortBy) {
    case 'latest':
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case 'oldest':
      sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case 'title':
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      break;
  }
  return sorted;
}