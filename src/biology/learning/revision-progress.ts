type Rating = 'again' | 'known';
export type RevisionRatings = Record<string, Rating>;

const storageKey = 'litlab:biology:revision:v1';
let unsavedRatings: RevisionRatings = {};

export function readRevisionRatings(): RevisionRatings {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return unsavedRatings;
    const ratings = Object.fromEntries(Object.entries(saved).filter(([id, rating]) =>
      /^[A-D][1-4]\.\d+\.\d+$/.test(id) && (rating === 'again' || rating === 'known')
    ));
    return {...ratings, ...unsavedRatings};
  } catch {
    return unsavedRatings;
  }
}

export function saveRevisionRating(id: string, rating: Rating): RevisionRatings {
  const next = {...readRevisionRatings(), [id]: rating};
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
    unsavedRatings = {};
  } catch {
    unsavedRatings = next;
  }
  return next;
}
