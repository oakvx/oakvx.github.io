// middleManPS4: "evidence or it didn't happen". Un punto è illuminato se sta nel cono della lampada.
export function illuminato(punto, { pos, dir, angolo, portata }) {
  const v = [punto[0] - pos[0], punto[1] - pos[1], punto[2] - pos[2]];
  const d = Math.hypot(...v);
  if (d === 0) return true;
  if (d > portata) return false;
  const n = Math.hypot(...dir);
  const cos = (v[0] * dir[0] + v[1] * dir[1] + v[2] * dir[2]) / (d * n);
  return cos >= Math.cos(angolo);
}
