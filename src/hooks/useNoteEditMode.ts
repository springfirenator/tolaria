import { useCallback, useSyncExternalStore } from 'react'

/**
 * Notes open in view mode (read-only). A note becomes editable for the rest of the
 * session when the user switches it to edit mode, or when the app asks the editor to
 * take focus on it (a newly created note, a title rename that moves the note's path).
 */
const editablePaths = new Set<string>()
const listeners = new Set<() => void>()

function emitChange(): void {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function isNoteEditable(path: string): boolean {
  return editablePaths.has(path)
}

export function setNoteEditable(path: string, editable: boolean): void {
  if (editablePaths.has(path) === editable) return
  if (editable) editablePaths.add(path)
  else editablePaths.delete(path)
  emitChange()
}

export function resetNoteEditModesForTests(): void {
  editablePaths.clear()
  emitChange()
}

export function useNoteEditMode(path: string | null): { editing: boolean; toggleEditing: () => void } {
  const editing = useSyncExternalStore(
    subscribe,
    () => (path ? editablePaths.has(path) : false),
  )
  const toggleEditing = useCallback(() => {
    if (path) setNoteEditable(path, !editablePaths.has(path))
  }, [path])
  return { editing, toggleEditing }
}
