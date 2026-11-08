/** One shared requestAnimationFrame loop for every live preview on the page. */
type Sub = (now: number) => void;
const subs = new Set<Sub>();
let raf = 0;

function loop(now: number) {
  subs.forEach((fn) => fn(now));
  raf = subs.size ? requestAnimationFrame(loop) : 0;
}

export function onFrame(fn: Sub): () => void {
  subs.add(fn);
  if (!raf) raf = requestAnimationFrame(loop);
  return () => {
    subs.delete(fn);
  };
}
