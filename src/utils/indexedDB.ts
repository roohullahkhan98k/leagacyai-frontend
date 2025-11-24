// IndexedDB utility for offline storage

export class IndexedDBManager {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(dbName: string = 'LegacyAI', version: number = 1) {
    this.dbName = dbName;
    this.version = version;
  }

  // Initialize the database
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('chat')) {
          const chatStore = db.createObjectStore('chat', { keyPath: 'id', autoIncrement: true });
          chatStore.createIndex('timestamp', 'timestamp', { unique: false });
          chatStore.createIndex('sessionId', 'sessionId', { unique: false });
        }

        if (!db.objectStoreNames.contains('profile')) {
          const profileStore = db.createObjectStore('profile', { keyPath: 'id' });
          profileStore.createIndex('userId', 'userId', { unique: true });
        }

        if (!db.objectStoreNames.contains('interviews')) {
          const interviewStore = db.createObjectStore('interviews', { keyPath: 'id' });
          interviewStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('voiceClones')) {
          const voiceStore = db.createObjectStore('voiceClones', { keyPath: 'id' });
          voiceStore.createIndex('name', 'name', { unique: false });
        }

        if (!db.objectStoreNames.contains('memoryNodes')) {
          const memoryStore = db.createObjectStore('memoryNodes', { keyPath: 'id' });
          memoryStore.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  // Generic method to add data
  async add(storeName: string, data: any): Promise<IDBValidKey> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to get data
  async get(storeName: string, key: IDBValidKey): Promise<any> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to get all data
  async getAll(storeName: string): Promise<any[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to update data
  async update(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to delete data
  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Chat-specific methods
  async saveChatMessage(message: {
    content: string;
    role: 'user' | 'assistant';
    sessionId: string;
    timestamp?: number;
  }): Promise<IDBValidKey> {
    const chatData = {
      ...message,
      timestamp: message.timestamp || Date.now(),
      synced: false
    };
    return this.add('chat', chatData);
  }

  async getChatMessages(sessionId: string): Promise<any[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chat'], 'readonly');
      const store = transaction.objectStore('chat');
      const index = store.index('sessionId');
      const request = index.getAll(sessionId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Profile-specific methods
  async saveProfile(profile: {
    userId: string;
    name: string;
    email: string;
    preferences: any;
  }): Promise<void> {
    const profileData = {
      id: profile.userId,
      ...profile,
      lastUpdated: Date.now(),
      synced: false
    };
    return this.update('profile', profileData);
  }

  async getProfile(userId: string): Promise<any> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['profile'], 'readonly');
      const store = transaction.objectStore('profile');
      const index = store.index('userId');
      const request = index.get(userId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Interview-specific methods
  async saveInterview(interview: {
    id: string;
    title: string;
    questions: any[];
    responses: any[];
    timestamp?: number;
  }): Promise<void> {
    const interviewData = {
      ...interview,
      timestamp: interview.timestamp || Date.now(),
      synced: false
    };
    return this.update('interviews', interviewData);
  }

  async getInterviews(): Promise<any[]> {
    return this.getAll('interviews');
  }

  // Voice clone methods
  async saveVoiceClone(voice: {
    id: string;
    name: string;
    audioData: string;
    settings: any;
  }): Promise<void> {
    const voiceData = {
      ...voice,
      lastUpdated: Date.now(),
      synced: false
    };
    return this.update('voiceClones', voiceData);
  }

  async getVoiceClones(): Promise<any[]> {
    return this.getAll('voiceClones');
  }

  // Memory node methods
  async saveMemoryNode(node: {
    id: string;
    type: string;
    content: any;
    connections: string[];
  }): Promise<void> {
    const nodeData = {
      ...node,
      lastUpdated: Date.now(),
      synced: false
    };
    return this.update('memoryNodes', nodeData);
  }

  async getMemoryNodes(): Promise<any[]> {
    return this.getAll('memoryNodes');
  }

  // Sync methods for when online
  async getUnsyncedData(): Promise<{
    chat: any[];
    profile: any[];
    interviews: any[];
    voiceClones: any[];
    memoryNodes: any[];
  }> {
    const [chat, profile, interviews, voiceClones, memoryNodes] = await Promise.all([
      this.getAll('chat'),
      this.getAll('profile'),
      this.getAll('interviews'),
      this.getAll('voiceClones'),
      this.getAll('memoryNodes')
    ]);

    return {
      chat: chat.filter(item => !item.synced),
      profile: profile.filter(item => !item.synced),
      interviews: interviews.filter(item => !item.synced),
      voiceClones: voiceClones.filter(item => !item.synced),
      memoryNodes: memoryNodes.filter(item => !item.synced)
    };
  }

  // Mark data as synced
  async markAsSynced(storeName: string, id: IDBValidKey): Promise<void> {
    const data = await this.get(storeName, id);
    if (data) {
      data.synced = true;
      await this.update(storeName, data);
    }
  }

  // Clear all data
  async clearAll(): Promise<void> {
    if (!this.db) await this.init();
    
    const storeNames = ['chat', 'profile', 'interviews', 'voiceClones', 'memoryNodes'];
    const promises = storeNames.map(storeName => {
      return new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    await Promise.all(promises);
  }
}

// Export singleton instance
export const dbManager = new IndexedDBManager();

