import { getItem, setItem } from '../storage';
import type { Note } from './types';

const NOTES_STORAGE_KEY = 'notes';

export function getNotes(): Array<Note> {
  try {
    const notes = getItem<Array<Note>>(NOTES_STORAGE_KEY);
    if (!notes || !Array.isArray(notes)) {
      return [];
    }
    return notes.filter((note) => !note.deletedAt);
  } catch (error) {
    console.error('Error getting notes from storage', error);
    return [];
  }
}

export function getNoteById(id: string): Note | null {
  try {
    const notes = getNotes();
    return notes.find((note) => note.id === id) ?? null;
  } catch (error) {
    console.error('Error getting note by id:', error);
    return null;
  }
}

function getAllNotesIncludingDeleted(): Array<Note> {
  try {
    const notes = getItem<Array<Note>>(NOTES_STORAGE_KEY);
    return notes ?? [];
  } catch (error) {
    console.error('Error getting all notes', error);
    return [];
  }
}

export async function saveNotes(notes: Array<Note>): Promise<void> {
  try {
    await setItem(NOTES_STORAGE_KEY, notes);
  } catch (error) {
    console.error('Error saving notes to storage:', error);
    throw new Error('Failed to save Todos');
  }
}

export async function addNotes(note: Note): Promise<Note> {
  try {
    const notes = getAllNotesIncludingDeleted();
    const newNotes = [...notes, note];
    await saveNotes(newNotes);
    return note;
  } catch (error) {
    console.error('Error adding notes to storage:', error);
    throw new Error('Failed to add Notes');
  }
}
