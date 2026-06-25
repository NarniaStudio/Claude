import { Book, Bookmark, Highlight, Note, Collection, BookSyncData } from '../types';
import { storageService } from './storageService';
import { fileService } from './fileService';
import { syncService } from './syncService';
import { generateId } from '../utils/formatters';

class BookService {
  async importBooks(): Promise<Book[]> {
    const result = await fileService.pickDocument();
    if (result.canceled || !result.assets) return [];

    const books: Book[] = [];
    for (const asset of result.assets) {
      const book = await fileService.importBook(
        asset.uri,
        asset.name,
        asset.mimeType || ''
      );
      books.push(book);
    }
    return books;
  }

  async deleteBook(book: Book): Promise<void> {
    await fileService.deleteBookFile(book.fileUri);
    if (book.coverUri) {
      await fileService.deleteBookFile(book.coverUri);
    }
  }

  createBookmark(bookId: string, page: number, title: string, cfi?: string): Bookmark {
    return {
      id: generateId(),
      bookId,
      page,
      cfi,
      title,
      note: '',
      createdAt: Date.now(),
      color: '#4361ee',
    };
  }

  createHighlight(
    bookId: string,
    page: number,
    text: string,
    color: Highlight['color'] = 'yellow',
    cfi?: string
  ): Highlight {
    return {
      id: generateId(),
      bookId,
      page,
      cfi,
      text,
      note: '',
      color,
      createdAt: Date.now(),
    };
  }

  createNote(bookId: string, page: number, content: string, cfi?: string): Note {
    return {
      id: generateId(),
      bookId,
      page,
      cfi,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  createCollection(name: string, description: string = ''): Collection {
    return {
      id: generateId(),
      name,
      description,
      coverUri: null,
      bookIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  sortBooks(books: Book[], sortBy: string, sortOrder: 'asc' | 'desc'): Book[] {
    const sorted = [...books].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'lastRead':
          return b.lastReadAt - a.lastReadAt;
        case 'added':
          return b.addedAt - a.addedAt;
        case 'progress':
          return b.progress - a.progress;
        default:
          return 0;
      }
    });
    return sortOrder === 'desc' ? sorted : sorted.reverse();
  }

  filterBooks(books: Book[], query: string): Book[] {
    if (!query.trim()) return books;
    const lower = query.toLowerCase();
    return books.filter(
      b =>
        b.title.toLowerCase().includes(lower) ||
        b.author.toLowerCase().includes(lower) ||
        b.tags.some(t => t.toLowerCase().includes(lower))
    );
  }

  getRecentBooks(books: Book[], limit: number = 10): Book[] {
    return [...books]
      .filter(b => b.lastReadAt > 0)
      .sort((a, b) => b.lastReadAt - a.lastReadAt)
      .slice(0, limit);
  }

  getReadingBooks(books: Book[]): Book[] {
    return books.filter(b => b.progress > 0 && !b.isFinished);
  }

  getFinishedBooks(books: Book[]): Book[] {
    return books.filter(b => b.isFinished);
  }

  getUnreadBooks(books: Book[]): Book[] {
    return books.filter(b => b.progress === 0);
  }

  prepareBookSyncData(
    book: Book,
    bookmarks: Bookmark[],
    highlights: Highlight[],
    notes: Note[]
  ): BookSyncData {
    return {
      bookId: book.id,
      currentPage: book.currentPage,
      currentCfi: book.currentCfi,
      progress: book.progress,
      bookmarks,
      highlights,
      notes,
      lastReadAt: book.lastReadAt,
      isFinished: book.isFinished,
      rating: book.rating,
    };
  }

  async performSync(
    userId: string,
    books: Book[],
    bookmarks: Record<string, Bookmark[]>,
    highlights: Record<string, Highlight[]>,
    notes: Record<string, Note[]>
  ): Promise<BookSyncData[]> {
    const localData = books.map(book =>
      this.prepareBookSyncData(
        book,
        bookmarks[book.id] || [],
        highlights[book.id] || [],
        notes[book.id] || []
      )
    );

    const remoteData = await syncService.getSyncData(userId);
    const remoteBooks = remoteData?.books || [];

    const merged = syncService.mergeBookData(localData, remoteBooks);

    await syncService.syncBookData(userId, merged);

    return merged;
  }
}

export const bookService = new BookService();
