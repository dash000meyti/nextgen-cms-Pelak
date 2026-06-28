import { noOpMediaProcessor } from "@nextgen-cms/contract/media/no-op-processor";
import type { MediaProcessor } from "@nextgen-cms/contract/types/media";

let processor: MediaProcessor = noOpMediaProcessor;

export function getMediaProcessor(): MediaProcessor {
  return processor;
}

export function setMediaProcessor(next: MediaProcessor): void {
  processor = next;
}
