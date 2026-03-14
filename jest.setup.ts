import "@testing-library/jest-dom";

import { webcrypto } from "crypto";
import { TextDecoder, TextEncoder } from "util";

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

if (!globalThis.crypto) {
  (globalThis as any).crypto = webcrypto;
}

expect.extend({});
