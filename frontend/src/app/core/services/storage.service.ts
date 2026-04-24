import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private memoryStorage: { [key: string]: string } = {};
  private warned = false;

  private logWarning(e: any) {
    if (!this.warned) {
      console.warn('LocalStorage access denied. Using fallback storage (sessionStorage or memory).', e);
      this.warned = true;
    }
  }

  /**
   * Safely set an item. Tries localStorage, then sessionStorage, then memory.
   */
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      this.logWarning(e);
      try {
        sessionStorage.setItem(key, value);
      } catch (se) {
        this.memoryStorage[key] = value;
      }
    }
  }

  /**
   * Safely get an item.
   */
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      this.logWarning(e);
      try {
        return sessionStorage.getItem(key);
      } catch (se) {
        return this.memoryStorage[key] || null;
      }
    }
  }

  /**
   * Safely remove an item.
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      this.logWarning(e);
      try {
        sessionStorage.removeItem(key);
      } catch (se) {
        delete this.memoryStorage[key];
      }
    }
  }

  /**
   * Safely clear storage.
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      this.logWarning(e);
      try {
        sessionStorage.clear();
      } catch (se) {
        this.memoryStorage = {};
      }
    }
  }
}
