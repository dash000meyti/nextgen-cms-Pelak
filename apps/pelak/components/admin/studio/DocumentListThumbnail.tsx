type DocumentListThumbnailProps = {
  src?: string | null;
  alt: string;
};

export function DocumentListThumbnail({
  src,
  alt,
}: DocumentListThumbnailProps) {
  return (
    <div className="relative size-12 overflow-hidden bg-surface-2">
      {src ? (
        // biome-ignore lint/performance/noImgElement: admin thumbnails use authenticated upload URLs
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : null}
    </div>
  );
}
