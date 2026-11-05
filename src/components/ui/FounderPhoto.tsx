import Image from "next/image";

// A founder's portrait, or the marked placeholder until one is uploaded. `preview` is for a photo
// not on the server yet, which the image optimiser can't reach.
export function FounderPhoto({
  src,
  name,
  preview = false,
  children,
}: {
  src: string | null;
  name: string;
  preview?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[20px] bg-placeholder text-sm text-text-muted">
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          unoptimized={preview}
          sizes="(min-width: 480px) 420px, 100vw"
          className="object-cover"
        />
      ) : (
        "[Professional photo]"
      )}
      {children}
    </div>
  );
}
