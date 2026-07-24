export function AmbientBackground() {
  return (
    <div aria-hidden className="ambient-fade pointer-events-none absolute inset-0 overflow-hidden">
      <div className="glow-orb absolute -left-24 top-0 h-72 w-72 bg-orange-600/30" />
      <div className="glow-orb absolute -right-24 top-24 h-72 w-72 bg-amber-500/20 [animation-delay:-4s]" />
      <div className="absolute inset-0 bg-grid" />
    </div>
  );
}
