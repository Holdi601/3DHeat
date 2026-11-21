/**
 * This browser's key for sessions: an Ed25519 key pair made once and kept
 * in IndexedDB, its private half not extractable (script on the page can
 * sign with it while it is open, never copy it out). Joining, the browser
 * signs the server's challenge with it, so the session knows it is the same
 * browser: its own marks stay its own, a resume token works only from it,
 * and a ban or an invite holds to it.
 *
 * Without Ed25519 in WebCrypto or without IndexedDB (a private window in
 * some browsers) there is no proven key: the browser then names a random
 * one (`u:...`, kept in localStorage), which the server keeps apart.
 */

const DB = 'heat3d-identity';
const STORE = 'keys';
const ID = 'session';

/** What the browser signs to join: this, then the server's nonce. */
export const JOIN_CONTEXT = new TextEncoder().encode('heat3d.session.v1.join\0');

export interface Identity {
  /** The public key, 32 bytes. */
  pub: Uint8Array;
  /** The public key as 64 hex digits: the browser's key in the session. */
  hex: string;
  sign(data: Uint8Array): Promise<Uint8Array>;
}

let loading: Promise<Identity | null> | null = null;
let loadedHex: string | null = null;

const hexOf = (b: Uint8Array) => [...b].map((x) => x.toString(16).padStart(2, '0')).join('');

function idb<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(STORE);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    };
  });
}

async function load(): Promise<Identity | null> {
  try {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle || typeof indexedDB === 'undefined') return null;
    let pair = (await idb<CryptoKeyPair | undefined>('readonly', (s) => s.get(ID))) ?? null;
    if (!pair?.privateKey || !pair.publicKey) {
      pair = (await subtle.generateKey({ name: 'Ed25519' }, false, ['sign', 'verify'])) as CryptoKeyPair;
      await idb('readwrite', (s) => s.put(pair, ID));
    }
    const pub = new Uint8Array(await subtle.exportKey('raw', pair.publicKey));
    if (pub.length !== 32) return null;
    const priv = pair.privateKey;
    const id: Identity = {
      pub,
      hex: hexOf(pub),
      sign: async (data) => new Uint8Array(await subtle.sign({ name: 'Ed25519' }, priv, data as BufferSource)),
    };
    loadedHex = id.hex;
    return id;
  } catch {
    return null;
  }
}

/** The browser's key pair, made the first time (null where there can be none). */
export function identity(): Promise<Identity | null> {
  loading ??= load();
  return loading;
}

/** The proven key's hex, once `identity()` has loaded it. */
export function identityHex(): string | null {
  return loadedHex;
}

/** A signed answer to the server's challenge: the public key and the signature, or empty ones. */
export async function signChallenge(nonce: Uint8Array): Promise<{ keyPub: Uint8Array; keySig: Uint8Array }> {
  const id = await identity();
  if (!id) return { keyPub: new Uint8Array(), keySig: new Uint8Array() };
  const msg = new Uint8Array(JOIN_CONTEXT.length + nonce.length);
  msg.set(JOIN_CONTEXT);
  msg.set(nonce, JOIN_CONTEXT.length);
  try {
    return { keyPub: id.pub, keySig: await id.sign(msg) };
  } catch {
    return { keyPub: new Uint8Array(), keySig: new Uint8Array() };
  }
}
