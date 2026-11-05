import { whyIncotax } from "@/content/pages";
import { detectImageType } from "@/lib/admin/photo";
import { readMedia } from "@/lib/media-store";

export const dynamic = "force-dynamic";

const known = (name: string) => {
  const match = name.match(/^founder-(\d+)$/);
  return match !== null && whyIncotax.founders[Number(match[1])] !== undefined;
};

const notFound = () => new Response("Not found", { status: 404 });

// Serves uploaded images to visitors. An address with a version never changes what it shows, because
// a replaced image gets a new version, so browsers may keep that copy for good.
export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!known(name)) return notFound();

  try {
    const bytes = await readMedia(name);
    const type = bytes && detectImageType(bytes);
    if (!bytes || !type) return notFound();
    const versioned = new URL(request.url).searchParams.has("v");
    return new Response(bytes as BodyInit, {
      headers: {
        "Content-Type": type,
        "Cache-Control": versioned ? "public, max-age=31536000, immutable" : "no-cache",
      },
    });
  } catch (error) {
    console.error(`Could not read ${name}`, error);
    return notFound();
  }
}
