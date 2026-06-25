import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  addBookmark, removeBookmark, updateBookmark,
  addHighlight, removeHighlight,
  addNote, updateNote, removeNote,
} from '../store/bookSlice';
import { bookService } from '../services/bookService';
import { storageService } from '../services/storageService';
import { Bookmark, Highlight, HighlightColor, Note } from '../types';

export const useBookmarks = (bookId: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const bookmarks = useSelector((state: RootState) => state.books.bookmarks[bookId] || []);
  const highlights = useSelector((state: RootState) => state.books.highlights[bookId] || []);
  const notes = useSelector((state: RootState) => state.books.notes[bookId] || []);

  const addNewBookmark = useCallback((page: number, title: string, cfi?: string) => {
    const bookmark = bookService.createBookmark(bookId, page, title, cfi);
    dispatch(addBookmark(bookmark));
    return bookmark;
  }, [bookId, dispatch]);

  const deleteBookmark = useCallback((bookmarkId: string) => {
    dispatch(removeBookmark({ bookId, bookmarkId }));
  }, [bookId, dispatch]);

  const editBookmark = useCallback((bookmark: Bookmark) => {
    dispatch(updateBookmark(bookmark));
  }, [dispatch]);

  const isPageBookmarked = useCallback((page: number) => {
    return bookmarks.some(b => b.page === page);
  }, [bookmarks]);

  const togglePageBookmark = useCallback((page: number, title: string, cfi?: string) => {
    const existing = bookmarks.find(b => b.page === page);
    if (existing) {
      dispatch(removeBookmark({ bookId, bookmarkId: existing.id }));
    } else {
      addNewBookmark(page, title, cfi);
    }
  }, [bookmarks, bookId, dispatch, addNewBookmark]);

  const addNewHighlight = useCallback((
    page: number, text: string, color: HighlightColor = 'yellow', cfi?: string
  ) => {
    const highlight = bookService.createHighlight(bookId, page, text, color, cfi);
    dispatch(addHighlight(highlight));
    return highlight;
  }, [bookId, dispatch]);

  const deleteHighlight = useCallback((highlightId: string) => {
    dispatch(removeHighlight({ bookId, highlightId }));
  }, [bookId, dispatch]);

  const addNewNote = useCallback((page: number, content: string, cfi?: string) => {
    const note = bookService.createNote(bookId, page, content, cfi);
    dispatch(addNote(note));
    return note;
  }, [bookId, dispatch]);

  const editNote = useCallback((note: Note) => {
    dispatch(updateNote({ ...note, updatedAt: Date.now() }));
  }, [dispatch]);

  const deleteNote = useCallback((noteId: string) => {
    dispatch(removeNote({ bookId, noteId }));
  }, [bookId, dispatch]);

  return {
    bookmarks,
    highlights,
    notes,
    addNewBookmark,
    deleteBookmark,
    editBookmark,
    isPageBookmarked,
    togglePageBookmark,
    addNewHighlight,
    deleteHighlight,
    addNewNote,
    editNote,
    deleteNote,
  };
};
