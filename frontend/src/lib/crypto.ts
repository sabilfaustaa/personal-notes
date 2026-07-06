"use client";

import type { EncryptedPayload } from "@/features/db";

// Enkripsi sisi-klien untuk catatan terkunci.
// AES-GCM 256-bit, kunci diturunkan dari passcode via PBKDF2 (SHA-256, 150k iterasi).
// Passcode TIDAK pernah disimpan — kalau lupa, konten tak bisa dipulihkan.

const enc = new TextEncoder();
const dec = new TextDecoder();

function toB64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function fromB64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function deriveKey(passcode: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey("raw", enc.encode(passcode), "PBKDF2", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: 150_000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptJson(
  passcode: string,
  obj: Record<string, unknown>,
): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passcode, salt);
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    enc.encode(JSON.stringify(obj)),
  );
  return { iv: toB64(iv.buffer), salt: toB64(salt.buffer), data: toB64(cipher) };
}

/** Mengembalikan objek terdekripsi, atau melempar error bila passcode salah. */
export async function decryptJson(
  passcode: string,
  payload: EncryptedPayload,
): Promise<Record<string, unknown>> {
  const salt = fromB64(payload.salt);
  const iv = fromB64(payload.iv);
  const key = await deriveKey(passcode, salt);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    fromB64(payload.data) as BufferSource,
  );
  return JSON.parse(dec.decode(plain)) as Record<string, unknown>;
}
