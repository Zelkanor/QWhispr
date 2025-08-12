/**
 * @copyright 2025 Zelkanor
 * @license Apache-2.0
 */

export interface QuantumKeyPair {
    publicKey: Uint8Array;
    secretKey: Uint8Array;
}

export interface QunatumEncryptedMessage {
  /**
   * AES-GCM encrypted message body
   */
  encryptedData: Uint8Array;

  /**
   * Kyber KEM ciphertext (used by recipient to derive shared key)
   */
  kyberCiphertext: Uint8Array;

  /**
   * SHA-512 hash of the plaintext (hex encoded string)
   */
  messageHash: string;

  /**
   * AES-GCM authentication tag for integrity check
   */
  authTag: Uint8Array;

  /**
   * AES-GCM initialization vector (nonce)
   */
  iv: Uint8Array;
}