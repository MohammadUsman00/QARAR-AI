/** Fixed atmospheric layers: gradient, grain, vignette. */
export function RoyalAmbient() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 qarar-gradient-bg" aria-hidden />
      <div className="pointer-events-none fixed inset-0 royal-grain" aria-hidden />
      <div className="pointer-events-none fixed inset-0 royal-vignette" aria-hidden />
    </>
  );
}
