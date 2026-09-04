type Props = { onBegin: () => void };

export default function TitleScreen({ onBegin }: Props) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-[#14100c] px-6 text-center">
      <h1 className="text-4xl tracking-wide">A Night at Netherfield</h1>
      <p className="max-w-md text-white/70">
        Netherfield Park, the night of the ball. You are Elizabeth Bennet.
      </p>
      <button
        type="button"
        onClick={onBegin}
        className="rounded border border-white/30 px-6 py-3 text-sm uppercase tracking-widest hover:bg-white/10"
      >
        Begin the evening
      </button>
    </div>
  );
}
