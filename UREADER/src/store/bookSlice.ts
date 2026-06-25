import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Book, Bookmark, Highlight, Note, Collection } from '../types';

interface BookState {
  books: Book[];
  bookmarks: Record<string, Bookmark[]>;
  highlights: Record<string, Highlight[]>;
  notes: Record<string, Note[]>;
  collections: Collection[];
  currentBookId: string | null;
  isLoading: boolean;
  searchQuery: string;
}

const initialState: BookState = {
  books: [],
  bookmarks: {},
  highlights: {},
  notes: {},
  collections: [],
  currentBookId: null,
  isLoading: false,
  searchQuery: '',
};

const bookSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setBooks(state, action: PayloadAction<Book[]>) {
      state.books = action.payload;
    },
    addBook(state, action: PayloadAction<Book>) {
      state.books.unshift(action.payload);
    },
    updateBook(state, action: PayloadAction<Partial<Book> & { id: string }>) {
      const index = state.books.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.books[index] = { ...state.books[index], ...action.payload };
      }
    },
    removeBook(state, action: PayloadAction<string>) {
      state.books = state.books.filter(b => b.id !== action.payload);
      delete state.bookmarks[action.payload];
      delete state.highlights[action.payload];
      delete state.notes[action.payload];
    },
    setCurrentBook(state, action: PayloadAction<string | null>) {
      state.currentBookId = action.payload;
    },
    updateReadingProgress(state, action: PayloadAction<{
      bookId: string;
      currentPage: number;
      progress: number;
      cfi?: string;
    }>) {
      const book = state.books.find(b => b.id === action.payload.bookId);
      if (book) {
        book.currentPage = action.payload.currentPage;
        book.progress = action.payload.progress;
        book.lastReadAt = Date.now();
        if (action.payload.cfi) book.currentCfi = action.payload.cfi;
        if (action.payload.progress >= 100) book.isFinished = true;
      }
    },

    // Bookmarks
    setBookmarks(state, action: PayloadAction<Record<string, Bookmark[]>>) {
      state.bookmarks = action.payload;
    },
    addBookmark(state, action: PayloadAction<Bookmark>) {
      const bookId = action.payload.bookId;
      if (!state.bookmarks[bookId]) state.bookmarks[bookId] = [];
      state.bookmarks[bookId].push(action.payload);
    },
    removeBookmark(state, action: PayloadAction<{ bookId: string; bookmarkId: string }>) {
      const { bookId, bookmarkId } = action.payload;
      if (state.bookmarks[bookId]) {
        state.bookmarks[bookId] = state.bookmarks[bookId].filter(b => b.id !== bookmarkId);
      }
    },
    updateBookmark(state, action: PayloadAction<Bookmark>) {
      const bookId = action.payload.bookId;
      if (state.bookmarks[bookId]) {
        const index = state.bookmarks[bookId].findIndex(b => b.id === action.payload.id);
        if (index !== -1) state.bookmarks[bookId][index] = action.payload;
      }
    },

    // Highlights
    setHighlights(state, action: PayloadAction<Record<string, Highlight[]>>) {
      state.highlights = action.payload;
    },
    addHighlight(state, action: PayloadAction<Highlight>) {
      const bookId = action.payload.bookId;
      if (!state.highlights[bookId]) state.highlights[bookId] = [];
      state.highlights[bookId].push(action.payload);
    },
    removeHighlight(state, action: PayloadAction<{ bookId: string; highlightId: string }>) {
      const { bookId, highlightId } = action.payload;
      if (state.highlights[bookId]) {
        state.highlights[bookId] = state.highlights[bookId].filter(h => h.id !== highlightId);
      }
    },

    // Notes
    setNotes(state, action: PayloadAction<Record<string, Note[]>>) {
      state.notes = action.payload;
    },
    addNote(state, action: PayloadAction<Note>) {
      const bookId = action.payload.bookId;
      if (!state.notes[bookId]) state.notes[bookId] = [];
      state.notes[bookId].push(action.payload);
    },
    updateNote(state, action: PayloadAction<Note>) {
      const bookId = action.payload.bookId;
      if (state.notes[bookId]) {
        const index = state.notes[bookId].findIndex(n => n.id === action.payload.id);
        if (index !== -1) state.notes[bookId][index] = action.payload;
      }
    },
    removeNote(state, action: PayloadAction<{ bookId: string; noteId: string }>) {
      const { bookId, noteId } = action.payload;
      if (state.notes[bookId]) {
        state.notes[bookId] = state.notes[bookId].filter(n => n.id !== noteId);
      }
    },

    // Collections
    setCollections(state, action: PayloadAction<Collection[]>) {
      state.collections = action.payload;
    },
    addCollection(state, action: PayloadAction<Collection>) {
      state.collections.push(action.payload);
    },
    updateCollection(state, action: PayloadAction<Partial<Collection> & { id: string }>) {
      const index = state.collections.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.collections[index] = { ...state.collections[index], ...action.payload };
      }
    },
    removeCollection(state, action: PayloadAction<string>) {
      state.collections = state.collections.filter(c => c.id !== action.payload);
    },
    addBookToCollection(state, action: PayloadAction<{ collectionId: string; bookId: string }>) {
      const collection = state.collections.find(c => c.id === action.payload.collectionId);
      if (collection && !collection.bookIds.includes(action.payload.bookId)) {
        collection.bookIds.push(action.payload.bookId);
      }
      const book = state.books.find(b => b.id === action.payload.bookId);
      if (book && !book.collectionIds.includes(action.payload.collectionId)) {
        book.collectionIds.push(action.payload.collectionId);
      }
    },
    removeBookFromCollection(state, action: PayloadAction<{ collectionId: string; bookId: string }>) {
      const collection = state.collections.find(c => c.id === action.payload.collectionId);
      if (collection) {
        collection.bookIds = collection.bookIds.filter(id => id !== action.payload.bookId);
      }
      const book = state.books.find(b => b.id === action.payload.bookId);
      if (book) {
        book.collectionIds = book.collectionIds.filter(id => id !== action.payload.collectionId);
      }
    },

    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setBookRating(state, action: PayloadAction<{ bookId: string; rating: number }>) {
      const book = state.books.find(b => b.id === action.payload.bookId);
      if (book) book.rating = action.payload.rating;
    },
  },
});

export const {
  setBooks, addBook, updateBook, removeBook, setCurrentBook,
  updateReadingProgress,
  setBookmarks, addBookmark, removeBookmark, updateBookmark,
  setHighlights, addHighlight, removeHighlight,
  setNotes, addNote, updateNote, removeNote,
  setCollections, addCollection, updateCollection, removeCollection,
  addBookToCollection, removeBookFromCollection,
  setSearchQuery, setLoading, setBookRating,
} = bookSlice.actions;

export default bookSlice.reducer;
