import { useState, useEffect } from 'react';
import { dbManager } from '../utils/indexedDB';

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize IndexedDB
    const initDB = async () => {
      try {
        await dbManager.init();
        setIsInitialized(true);
        console.log('IndexedDB initialized successfully');
      } catch (error) {
        console.error('Failed to initialize IndexedDB:', error);
      }
    };

    initDB();

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Chat methods
  const saveChatMessage = async (message: {
    content: string;
    role: 'user' | 'assistant';
    sessionId: string;
  }) => {
    if (!isInitialized) return;
    
    try {
      const id = await dbManager.saveChatMessage(message);
      console.log('Chat message saved offline:', id);
      return id;
    } catch (error) {
      console.error('Failed to save chat message:', error);
    }
  };

  const getChatMessages = async (sessionId: string) => {
    if (!isInitialized) return [];
    
    try {
      return await dbManager.getChatMessages(sessionId);
    } catch (error) {
      console.error('Failed to get chat messages:', error);
      return [];
    }
  };

  // Profile methods
  const saveProfile = async (profile: {
    userId: string;
    name: string;
    email: string;
    preferences: any;
  }) => {
    if (!isInitialized) return;
    
    try {
      await dbManager.saveProfile(profile);
      console.log('Profile saved offline');
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const getProfile = async (userId: string) => {
    if (!isInitialized) return null;
    
    try {
      return await dbManager.getProfile(userId);
    } catch (error) {
      console.error('Failed to get profile:', error);
      return null;
    }
  };

  // Interview methods
  const saveInterview = async (interview: {
    id: string;
    title: string;
    questions: any[];
    responses: any[];
  }) => {
    if (!isInitialized) return;
    
    try {
      await dbManager.saveInterview(interview);
      console.log('Interview saved offline');
    } catch (error) {
      console.error('Failed to save interview:', error);
    }
  };

  const getInterviews = async () => {
    if (!isInitialized) return [];
    
    try {
      return await dbManager.getInterviews();
    } catch (error) {
      console.error('Failed to get interviews:', error);
      return [];
    }
  };

  // Voice clone methods
  const saveVoiceClone = async (voice: {
    id: string;
    name: string;
    audioData: string;
    settings: any;
  }) => {
    if (!isInitialized) return;
    
    try {
      await dbManager.saveVoiceClone(voice);
      console.log('Voice clone saved offline');
    } catch (error) {
      console.error('Failed to save voice clone:', error);
    }
  };

  const getVoiceClones = async () => {
    if (!isInitialized) return [];
    
    try {
      return await dbManager.getVoiceClones();
    } catch (error) {
      console.error('Failed to get voice clones:', error);
      return [];
    }
  };

  // Memory node methods
  const saveMemoryNode = async (node: {
    id: string;
    type: string;
    content: any;
    connections: string[];
  }) => {
    if (!isInitialized) return;
    
    try {
      await dbManager.saveMemoryNode(node);
      console.log('Memory node saved offline');
    } catch (error) {
      console.error('Failed to save memory node:', error);
    }
  };

  const getMemoryNodes = async () => {
    if (!isInitialized) return [];
    
    try {
      return await dbManager.getMemoryNodes();
    } catch (error) {
      console.error('Failed to get memory nodes:', error);
      return [];
    }
  };

  // Sync methods
  const getUnsyncedData = async () => {
    if (!isInitialized) return null;
    
    try {
      return await dbManager.getUnsyncedData();
    } catch (error) {
      console.error('Failed to get unsynced data:', error);
      return null;
    }
  };

  const markAsSynced = async (storeName: string, id: any) => {
    if (!isInitialized) return;
    
    try {
      await dbManager.markAsSynced(storeName, id);
      console.log('Data marked as synced');
    } catch (error) {
      console.error('Failed to mark as synced:', error);
    }
  };

  const clearAllData = async () => {
    if (!isInitialized) return;
    
    try {
      await dbManager.clearAll();
      console.log('All offline data cleared');
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  };

  return {
    isOnline,
    isInitialized,
    // Chat
    saveChatMessage,
    getChatMessages,
    // Profile
    saveProfile,
    getProfile,
    // Interviews
    saveInterview,
    getInterviews,
    // Voice clones
    saveVoiceClone,
    getVoiceClones,
    // Memory nodes
    saveMemoryNode,
    getMemoryNodes,
    // Sync
    getUnsyncedData,
    markAsSynced,
    clearAllData
  };
};

