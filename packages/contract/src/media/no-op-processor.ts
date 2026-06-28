import type { MediaProcessor } from "../types/media";

export const noOpMediaProcessor: MediaProcessor = {
  async process(buffer, mimeType, metadata) {
    return { buffer, mimeType, metadata };
  },
};
