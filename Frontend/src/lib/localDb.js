const DB_NAME = "LiveChatLocalDB";
const DB_VERSION = 1;
const STORE_NAME = "messages";

export function initLocalDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "_id" });
        // Index queries by conversation partner
        store.createIndex("chatPartnerId", "chatPartnerId", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Persists a message record locally
export async function saveMessageLocal(message, chatPartnerId) {
  const db = await initLocalDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    // Normalize user ID to string format
    const partnerIdStr = chatPartnerId ? chatPartnerId.toString() : "";
    const record = { ...message, chatPartnerId: partnerIdStr };
    
    store.put(record);
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// Retrieves cached messages for a specific conversation
export async function getLocalMessages(chatPartnerId) {
  const db = await initLocalDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("chatPartnerId");
    
    const partnerIdStr = chatPartnerId ? chatPartnerId.toString() : "";
    const request = index.getAll(IDBKeyRange.only(partnerIdStr));
    
    request.onsuccess = () => {
      // Sort messages ascending by creation time
      const sorted = request.result.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      resolve(sorted);
    };
    request.onerror = () => reject(request.error);
  });
}

// Returns the timestamp of the latest cached message in a thread
export async function getLatestTimestamp(chatPartnerId) {
  const messages = await getLocalMessages(chatPartnerId);
  if (messages.length === 0) return null;
  return messages[messages.length - 1].createdAt;
}
