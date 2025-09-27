import { JSEncrypt } from 'jsencrypt';
import { fetchPublicKey } from '@/api/user';

let cachedPublicKey = '';

async function getPublicKey() {
  if (!cachedPublicKey) {
    const res = await fetchPublicKey();
    cachedPublicKey = res ? res.key : '';
  }
  return cachedPublicKey;
}

export async function encrypt(content: string, key?: string) {
  const publicKey = key || (await getPublicKey());
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey);
  return encryptor.encrypt(content);
}
