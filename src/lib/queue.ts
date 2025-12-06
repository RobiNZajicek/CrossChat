// =============================================================================
// SHARED MESSAGE QUEUE - Sdilena fronta zprav mezi vlakny
// Pouziva SharedArrayBuffer pro zero-copy komunikaci
// Implementace kruhovaho bufferu (ring buffer)
// =============================================================================

import type { ChatMessage } from "@/types/chat";

// Kazdy slot ma 4-byte header pro delku payloadu
const HEADER_BYTES = 4;

export type QueueConfig = {
  capacity?: number;      // Kolik zprav se vejde (default 256)
  slotSize?: number;      // Max velikost jedne zpravy v bytech (default 2048)
  controlBuffer?: SharedArrayBuffer;  // Ridici buffer (head, tail, length)
  dataBuffer?: SharedArrayBuffer;     // Datovy buffer pro zpravy
};

export class SharedMessageQueue {
  readonly capacity: number;
  readonly slotSize: number;

  private readonly controlBuffer: SharedArrayBuffer;
  private readonly dataBuffer: SharedArrayBuffer;
  private readonly controlView: Int32Array;  // [0]=head, [1]=tail, [2]=length
  private readonly dataView: DataView;
  private readonly dataSlice: Uint8Array;
  private readonly encoder = new TextEncoder();
  private readonly decoder = new TextDecoder();

  // Vytvori frontu - bud s novymi buffery nebo s predanymi (pro sdileni)
  constructor(config: QueueConfig = {}) {
    this.capacity = config.capacity ?? 256;
    this.slotSize = config.slotSize ?? 2048;

    // Control buffer: 3x Int32 = head index, tail index, current length
    this.controlBuffer =
      config.controlBuffer ??
      new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 3);
    
    // Data buffer: capacity * slotSize bytes
    this.dataBuffer =
      config.dataBuffer ?? new SharedArrayBuffer(this.capacity * this.slotSize);

    this.controlView = new Int32Array(this.controlBuffer);
    this.dataView = new DataView(this.dataBuffer);
    this.dataSlice = new Uint8Array(this.dataBuffer);
  }

  // Getter pro ziskani obou bufferu - predava se do worker threadu
  get buffers() {
    return {
      control: this.controlBuffer,
      data: this.dataBuffer,
    };
  }

  // Prida zpravu na konec fronty (tail)
  // Vraci true pokud se povedlo, false kdyz je fronta plna
  enqueue(message: ChatMessage): boolean {
    const length = this.controlView[2];
    
    // Fronta je plna
    if (length >= this.capacity) {
      return false;
    }

    // Serializuje zpravu do JSON a pak do bytu
    const payload = this.encoder.encode(JSON.stringify(message));
    
    // Kontrola ze se zprava vejde do slotu
    if (payload.length + HEADER_BYTES > this.slotSize) {
      throw new Error("Message payload exceeds slot size");
    }

    // Vypocet pozice v bufferu (kruhova logika)
    const tail = this.controlView[1];
    const offset = tail * this.slotSize;

    // Zapis: 4 byte delka + samotna data
    this.dataView.setUint32(offset, payload.length, true);
    this.dataSlice.set(payload, offset + HEADER_BYTES);

    // Posun tail indexu (modulo = kruhovy buffer)
    this.controlView[1] = (tail + 1) % this.capacity;
    this.controlView[2] = length + 1;
    return true;
  }

  // Vybere zpravu ze zacatku fronty (head)
  // Vraci zpravu nebo null kdyz je fronta prazdna
  dequeue(): ChatMessage | null {
    // Fronta je prazdna
    if (this.controlView[2] === 0) {
      return null;
    }

    // Cteni z head pozice
    const head = this.controlView[0];
    const offset = head * this.slotSize;
    const length = this.dataView.getUint32(offset, true);
    const payload = this.dataSlice.slice(
      offset + HEADER_BYTES,
      offset + HEADER_BYTES + length,
    );

    // Posun head indexu
    this.controlView[0] = (head + 1) % this.capacity;
    this.controlView[2] -= 1;

    // Deserializace zpet na objekt
    const json = this.decoder.decode(payload);
    return JSON.parse(json) as ChatMessage;
  }

  // Vrati vsechny zpravy bez jejich odstraneni (jen pro cteni)
  snapshot(): ChatMessage[] {
    const messages: ChatMessage[] = [];
    const head = this.controlView[0];
    const size = this.controlView[2];

    for (let i = 0; i < size; i += 1) {
      const index = (head + i) % this.capacity;
      const offset = index * this.slotSize;
      const payloadLength = this.dataView.getUint32(offset, true);
      const payload = this.dataSlice.slice(
        offset + HEADER_BYTES,
        offset + HEADER_BYTES + payloadLength,
      );
      messages.push(JSON.parse(this.decoder.decode(payload)) as ChatMessage);
    }

    return messages;
  }
}
