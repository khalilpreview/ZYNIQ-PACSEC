// Cryptographically secure random number generation

export const generateSecurePassword = (length: number, options: { symbols: boolean, numbers: boolean, uppercase: boolean }): string => {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

  let charset = lowercase;
  if (options.uppercase) charset += uppercase;
  if (options.numbers) charset += numbers;
  if (options.symbols) charset += symbols;

  let retVal = "";
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);

  for (let i = 0; i < length; i++) {
    retVal += charset[values[i] % charset.length];
  }
  return retVal;
};

export const generateSecureHex = (bits: number): string => {
  const bytes = bits / 8;
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const generateSecureBase64 = (bits: number): string => {
  const bytes = bits / 8;
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  let binary = '';
  const len = array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return window.btoa(binary);
};

export const generateUUID = (): string => {
  return crypto.randomUUID();
};

// --- RSA UTILS ---

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

const formatPEM = (base64: string, type: 'PUBLIC' | 'PRIVATE'): string => {
    const chunked = base64.match(/.{1,64}/g)?.join('\n');
    return `-----BEGIN ${type} KEY-----\n${chunked}\n-----END ${type} KEY-----`;
};

export const generateRSAKeyPair = async (modulusLength: number = 2048): Promise<{ publicKey: string, privateKey: string }> => {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: modulusLength,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );

    const exportedPublic = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const exportedPrivate = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    return {
        publicKey: formatPEM(arrayBufferToBase64(exportedPublic), 'PUBLIC'),
        privateKey: formatPEM(arrayBufferToBase64(exportedPrivate), 'PRIVATE')
    };
};

// --- HASH UTILS ---

export const generateHash = async (text: string, algorithm: 'SHA-256' | 'SHA-512'): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm, msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const generateSHA1 = async (text: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
};

// --- AES UTILS ---

const getAesKeyMaterial = (password: string): Promise<CryptoKey> => {
    const enc = new TextEncoder();
    return window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );
};

const getAesKey = (keyMaterial: CryptoKey, salt: Uint8Array): Promise<CryptoKey> => {
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
};

export const encryptAES = async (text: string, password: string): Promise<string> => {
    const enc = new TextEncoder();
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const keyMaterial = await getAesKeyMaterial(password);
    const key = await getAesKey(keyMaterial, salt);

    const encoded = enc.encode(text);
    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        encoded
    );

    const buffer = new Uint8Array(salt.byteLength + iv.byteLength + ciphertext.byteLength);
    buffer.set(salt, 0);
    buffer.set(iv, salt.byteLength);
    buffer.set(new Uint8Array(ciphertext), salt.byteLength + iv.byteLength);

    let binary = '';
    const len = buffer.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(buffer[i]);
    }
    return window.btoa(binary);
};

export const decryptAES = async (encryptedBase64: string, password: string): Promise<string> => {
    const binary = window.atob(encryptedBase64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    if (len < 28) throw new Error("Invalid data");

    const salt = bytes.slice(0, 16);
    const iv = bytes.slice(16, 28);
    const ciphertext = bytes.slice(28);

    const keyMaterial = await getAesKeyMaterial(password);
    const key = await getAesKey(keyMaterial, salt);

    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
};