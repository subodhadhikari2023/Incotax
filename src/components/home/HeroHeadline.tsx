// Home hero headline with one gold italic phrase (CLAUDE.md §4.2). Renders plain text while the
// phrase is pending or if it doesn't appear in the headline.
export function HeroHeadline({ text, goldPhrase }: { text: string; goldPhrase: string | null }) {
  const at = goldPhrase ? text.indexOf(goldPhrase) : -1;

  return (
    <h1 className="mt-6 max-w-5xl text-[42px]/[48px] text-white md:text-[60px]/[66px] lg:text-[84px]/[90px]">
      {at < 0 || !goldPhrase ? (
        text
      ) : (
        <>
          {text.slice(0, at)}
          <em className="text-gold italic">{goldPhrase}</em>
          {text.slice(at + goldPhrase.length)}
        </>
      )}
    </h1>
  );
}
