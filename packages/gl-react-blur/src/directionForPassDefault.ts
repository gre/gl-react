const NORM = Math.sqrt(2) / 2;

export type DirectionForPass = (
  pass: number,
  factor: number,
  total: number
) => [number, number];

// Cycles through horizontal, vertical and the 2 diagonals with increasing radius
const directionForPassDefault: DirectionForPass = (p, factor, total) => {
  const f = (factor * 2 * Math.ceil(p / 2)) / total;
  switch ((p - 1) % 4) {
    case 0:
      return [f, 0];
    case 1:
      return [0, f];
    case 2:
      return [f * NORM, f * NORM];
    default:
      return [f * NORM, -f * NORM];
  }
};

export default directionForPassDefault;
