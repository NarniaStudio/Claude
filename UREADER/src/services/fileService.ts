import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Book } from '../types';
import { generateId } from '../utils/formatters';

const BOOKS_DIR = `${FileSystem.documentDirectory}books/`;

class FileService {
  async ensureBooksDir(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(BOOKS_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(BOOKS_DIR, { intermediates: true });
    }
  }

  async pickDocument(): Promise<DocumentPicker.DocumentPickerResult> {
    return DocumentPicker.getDocumentAsync({
      type: ['application/epub+zip', 'application/pdf'],
      copyToCacheDirectory: true,
      multiple: true,
    });
  }

  async importBook(uri: string, name: string, mimeType: string): Promise<Book> {
    await this.ensureBooksDir();

    const id = generateId();
    const fileType = mimeType.includes('pdf') ? 'pdf' : 'epub';
    const extension = fileType;
    const destUri = `${BOOKS_DIR}${id}.${extension}`;

    await FileSystem.copyAsync({ from: uri, to: destUri });

    const fileInfo = await FileSystem.getInfoAsync(destUri);
    const fileSize = fileInfo.exists ? (fileInfo as any).size || 0 : 0;

    const title = name.replace(/\.(epub|pdf)$/i, '');

    const book: Book = {
      id,
      title,
      author: 'Unknown',
      coverUri: null,
      fileUri: destUri,
      fileType,
      fileSize,
      totalPages: 0,
      currentPage: 0,
      progress: 0,
      addedAt: Date.now(),
      lastReadAt: Date.now(),
      isFinished: false,
      language: 'he',
      collectionIds: [],
      rating: 0,
      tags: [],
    };

    return book;
  }

  async deleteBookFile(fileUri: string): Promise<void> {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri);
    }
  }

  async getBookFileUri(bookId: string, fileType: string): Promise<string> {
    return `${BOOKS_DIR}${bookId}.${fileType}`;
  }

  async fileExists(uri: string): Promise<boolean> {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists;
  }

  async getFileSize(uri: string): Promise<number> {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists ? (info as any).size || 0 : 0;
  }

  async exportBook(fileUri: string): Promise<string> {
    return fileUri;
  }

  async getCoverDir(): Promise<string> {
    const coverDir = `${FileSystem.documentDirectory}covers/`;
    const dirInfo = await FileSystem.getInfoAsync(coverDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(coverDir, { intermediates: true });
    }
    return coverDir;
  }

  async saveCover(bookId: string, coverData: string): Promise<string> {
    const coverDir = await this.getCoverDir();
    const coverUri = `${coverDir}${bookId}.jpg`;
    await FileSystem.writeAsStringAsync(coverUri, coverData, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return coverUri;
  }

  async listBookFiles(): Promise<string[]> {
    await this.ensureBooksDir();
    return FileSystem.readDirectoryAsync(BOOKS_DIR);
  }
}

export const fileService = new FileService();
