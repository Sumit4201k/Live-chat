// Derives a unique symmetric key deterministically from sorted user IDs
export async function deriveChatKey(userId1, userId2) {
  const sortedIds = [userId1.toString(), userId2.toString()].sort().join("-");
  const pepper = import.meta.env.VITE_CRYPTO_PEPPER || "default-app-pepper-salt";
  
  const encoder = new TextEncoder();
  const rawKeyData = encoder.encode(sortedIds + pepper);
  
  // Hash the inputs to get a fixed 256-bit entropy source
  const entropy = await crypto.subtle.digest("SHA-256", rawKeyData);
  
  // Import raw entropy into an AES key
  return await crypto.subtle.importKey(
    "raw",
    entropy,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypts text using AES-GCM and outputs a single Base64 string containing [IV + Ciphertext]
export async function encryptMessage(plainText, key) {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit initialization vector
  const rawData = encoder.encode(plainText);
  
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    rawData
  );
  
  // Combine IV and Ciphertext into one binary array
  const combined = new Uint8Array(iv.length + ciphertextBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertextBuffer), iv.length);
  
  // Return base64 encoded string
  return btoa(String.fromCharCode(...combined));
}

// Decrypts ciphertext Base64 string back into plain text
export async function decryptMessage(encryptedBase64, key) {
  try {
    const binaryStr = atob(encryptedBase64);
    const combined = new Uint8Array(binaryStr.length).map((_, i) => binaryStr.charCodeAt(i));
    
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ciphertext
    );
    
    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed:", error);
    return "⚠️ Encrypted Message (Decryption failed)";
  }
}
