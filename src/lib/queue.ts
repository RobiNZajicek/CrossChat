import type { ChatMessage } from "@/types/chat";

const HEADER_BYTES = 4;

export type QueueConfig = {
  capacity?: number;
  slotSize?: number;
  controlBuffer?: SharedArrayBuffer;
  dataBuffer?: SharedArrayBuffer;
};

export class SharedMessageQueue {
  readonly capacity: number;
  readonly slotSize: number;

  private readonly controlBuffer: SharedArrayBuffer;
  private readonly dataBuffer: SharedArrayBuffer;
  private readonly controlView: Int32Array;
  private readonly dataView: DataView;
  private readonly dataSlice: Uint8Array;
  private readonly encoder = new TextEncoder();
  private readonly decoder = new TextDecoder();

  constructor(config: QueueConfig = {}) {
    this.capacity = config.capacity ?? 256;
    this.slotSize = config.slotSize ?? 2048;

    this.controlBuffer =
      config.controlBuffer ??
      new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 3);
    this.dataBuffer =
      config.dataBuffer ?? new SharedArrayBuffer(this.capacity * this.slotSize);

    this.controlView = new Int32Array(this.controlBuffer);
    this.dataView = new DataView(this.dataBuffer);
    this.dataSlice = new Uint8Array(this.dataBuffer);
  }

  get buffers() {
    return {
      control: this.controlBuffer,
      data: this.dataBuffer,
    };
  }

  enqueue(message: ChatMessage): boolean {
    const length = this.controlView[2];
    if (length >= this.capacity) {
      return false;
    }

    const payload = this.encoder.encode(JSON.stringify(message));
    if (payload.length + HEADER_BYTES > this.slotSize) {
      throw new Error("Message payload exceeds slot size");
    }

    const tail = this.controlView[1];
    const offset = tail * this.slotSize;

    this.dataView.setUint32(offset, payload.length, true);
    this.dataSlice.set(payload, offset + HEADER_BYTES);

    this.controlView[1] = (tail + 1) % this.capacity;
    this.controlView[2] = length + 1;
    return true;
  }

  dequeue(): ChatMessage | null {
    if (this.controlView[2] === 0) {
      return null;
    }

    const head = this.controlView[0];
    const offset = head * this.slotSize;
    const length = this.dataView.getUint32(offset, true);
    const payload = this.dataSlice.slice(
      offset + HEADER_BYTES,
      offset + HEADER_BYTES + length,
    );

    this.controlView[0] = (head + 1) % this.capacity;
    this.controlView[2] -= 1;

    const json = this.decoder.decode(payload);
    return JSON.parse(json) as ChatMessage;
  }

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

