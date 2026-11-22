const noteKey = (exerciseId: string) => 'litlab:biology:drawing-note:v1:' + exerciseId;

export function readDrawingNote(exerciseId: string): string {
  try {
    return localStorage.getItem(noteKey(exerciseId)) ?? '';
  } catch {
    return '';
  }
}

export function saveDrawingNote(exerciseId: string, note: string): boolean {
  try {
    if (note) localStorage.setItem(noteKey(exerciseId), note);
    else localStorage.removeItem(noteKey(exerciseId));
    return true;
  } catch {
    return false;
  }
}
