/**
 * @copyright 2025 Zelkanor
 * @license Apache-2.0
 */

/**
 * Node Modules
 */
import crypto from 'crypto';


/**
 * Custom Modules
 */
import { ml_kem1024 } from '@noble/post-quantum/ml-kem';
import { ml_dsa87 } from '@noble/post-quantum/ml-dsa';
import { randomBytes } from '@noble/post-quantum/utils';
import config from '@/config';
/**
 * 
 * Type
 *
 */
import { QuantumKeyPair, QunatumEncryptedMessage } from '@/models/quantum_crypt';

export class QuantumCryptoService {
    private static instance: QuantumCryptoService;

    public static getInstance(): QuantumCryptoService {
        if(!QuantumCryptoService.instance) {
            QuantumCryptoService.instance = new QuantumCryptoService();
        }
        return QuantumCryptoService.instance;
    }

     /**
   * Generate a quantum-safe key pair using CRYSTALS-Kyber (ML-KEM-1024)
   */
  public generateQuantumKeyPair(): QuantumKeyPair {
    const seed = randomBytes(64);
    const { publicKey, secretKey } = ml_kem1024.keygen(seed);
    return {
      publicKey,
      secretKey
    }
  }

   /**
   * Generate a CRYSTALS-Dilithium signature key pair (ML-DSA-87)
   */
  public generateDsaKeyPair(): QuantumKeyPair {
    const seed = randomBytes(32);
    const { publicKey, secretKey } = ml_dsa87.keygen(seed);
    return { publicKey, secretKey };
  }

  /**
   * Encrypt a message using quantum-safe encryption
   */
  public async encryptMessage(message: string, publicKey: Uint8Array,senderId:string): Promise<QunatumEncryptedMessage> {
    
     // 1. Kyber encapsulation → ciphertext + sharedSecret
    const { cipherText, sharedSecret } = ml_kem1024.encapsulate(publicKey);

    // 2. Derive per-message AES-GCM key via HKDF
    const aesKey = crypto.hkdfSync(
      'sha512',
      sharedSecret,
      Buffer.from(config.HMAC_SALT, 'hex'),
      Buffer.from(senderId, 'utf8'),
      32
    );

    // 3. AES-256-GCM encryption
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm',Buffer.from(aesKey),iv);
    const encryptedBody = Buffer.concat([
      cipher.update(message, 'utf8'),
      cipher.final()
    ]);
    const authTag = cipher.getAuthTag();

    // 4. Compute plaintext hash for integrity metadata
    const messageHash = await this.computeMessageHash(message);

    return {
      kyberCiphertext: cipherText,
      encryptedData: encryptedBody,
      messageHash,
      authTag,
      iv
    }
  }

  /**
   * Decrypt a quantum-encrypted message
   */
  public async decryptMessage(encryptedMessage: QunatumEncryptedMessage, secretKey: Uint8Array): Promise<string> {
     // 1. Kyber decapsulation → sharedSecret
    const sharedSecret = ml_kem1024.decapsulate(
      encryptedMessage.kyberCiphertext,
      secretKey
    );

    // 2. Derive AES-GCM key via HKDF
    const aesKey = crypto.hkdfSync(
      'sha512',
      sharedSecret,
      Buffer.from(config.HMAC_SALT, 'hex'),
      Buffer.alloc(0),
      32
    );

    // 3. AES-256-GCM decryption
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(aesKey),
      encryptedMessage.iv
    );
    decipher.setAuthTag(encryptedMessage.authTag);
    const decrypted = Buffer.concat([
      decipher.update(encryptedMessage.encryptedData),
      decipher.final()
    ]);
    return decrypted.toString('utf8');
  }
  

   /**
   * Generate Dilithium signature for message authentication (ML-DSA-87)
   */
   public async signMessage(message: string, privateKey: Uint8Array): Promise<Uint8Array> {
      const msgBytes = Buffer.from(message, 'utf8');
      const signature  = ml_dsa87.sign(privateKey, msgBytes);
      return signature;
   }

   /**
   * Verify a Dilithium signature
   */
    public async verifySignature(
    message: string,
    signature: Uint8Array,
    publicKey: Uint8Array
  ): Promise<boolean> {
    const msgBytes = Buffer.from(message, 'utf8');
    return ml_dsa87.verify(publicKey, msgBytes, signature);
  }

  /**
   * Compute SHA-256 hash of message for integrity verification
   */
  private async computeMessageHash(message: string): Promise<string> {
    return crypto.createHash('sha512').update(message).digest('hex');
  }

}

export const quantumCrypto = QuantumCryptoService.getInstance();