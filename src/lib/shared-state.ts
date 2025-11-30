import { Mutex } from "@/lib/mutex";
import { SharedMessageQueue } from "@/lib/queue";

type SharedResources = {
  queue: SharedMessageQueue;
  mutex: Mutex;
  buffers: {
    control: SharedArrayBuffer;
    data: SharedArrayBuffer;
    mutex: SharedArrayBuffer;
    capacity: number;
    slotSize: number;
  };
};

const globalState = globalThis as typeof globalThis & {
  __crosschat_state?: SharedResources;
};

const createState = (): SharedResources => {
  const queue = new SharedMessageQueue({
    capacity: 256,
    slotSize: 4096,
  });

  const mutex = new Mutex();

  return {
    queue,
    mutex,
    buffers: {
      control: queue.buffers.control,
      data: queue.buffers.data,
      mutex: mutex.sharedBuffer,
      capacity: queue.capacity,
      slotSize: queue.slotSize,
    },
  };
};

export const getSharedState = (): SharedResources => {
  if (!globalState.__crosschat_state) {
    globalState.__crosschat_state = createState();
  }
  return globalState.__crosschat_state;
};

