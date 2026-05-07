export const SEG: Record<string, number[][]> = {
  0: [[1, 1, 1], [1, 0, 1], [1, 0, 1], [1, 0, 1], [1, 1, 1]],
  1: [[0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]],
  2: [[1, 1, 1], [0, 0, 1], [1, 1, 1], [1, 0, 0], [1, 1, 1]],
  3: [[1, 1, 1], [0, 0, 1], [1, 1, 1], [0, 0, 1], [1, 1, 1]],
  4: [[1, 0, 1], [1, 0, 1], [1, 1, 1], [0, 0, 1], [0, 0, 1]],
  5: [[1, 1, 1], [1, 0, 0], [1, 1, 1], [0, 0, 1], [1, 1, 1]],
  6: [[1, 1, 1], [1, 0, 0], [1, 1, 1], [1, 0, 1], [1, 1, 1]],
  7: [[1, 1, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]],
  8: [[1, 1, 1], [1, 0, 1], [1, 1, 1], [1, 0, 1], [1, 1, 1]],
  9: [[1, 1, 1], [1, 0, 1], [1, 1, 1], [0, 0, 1], [1, 1, 1]],
  C: [[1, 1, 1], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 1, 1]],
  H: [[1, 0, 1], [1, 0, 1], [1, 1, 1], [1, 0, 1], [1, 0, 1]],
  I: [[1, 1, 1], [0, 1, 0], [0, 1, 0], [0, 1, 0], [1, 1, 1]],
  L: [[1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 1, 1]],
  D: [[1, 1, 0], [1, 0, 1], [1, 0, 1], [1, 0, 1], [1, 1, 0]],
  A: [[0, 1, 0], [1, 0, 1], [1, 1, 1], [1, 0, 1], [1, 0, 1]],
  R: [[1, 1, 0], [1, 0, 1], [1, 1, 0], [1, 0, 1], [1, 0, 1]],
  K: [[1, 0, 1], [1, 0, 1], [1, 1, 0], [1, 0, 1], [1, 0, 1]],
  G: [[1, 1, 1], [1, 0, 0], [1, 0, 1], [1, 0, 1], [1, 1, 1]],
  T: [[1, 1, 1], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]],
  E: [[1, 1, 1], [1, 0, 0], [1, 1, 1], [1, 0, 0], [1, 1, 1]],
  N: [[1, 0, 1], [1, 1, 1], [1, 1, 1], [1, 0, 1], [1, 0, 1]],
};

export const drawMatrixText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  xPos: number,
  yPos: number,
  dotSize: number,
  gap: number,
  activeColor: string = '#ffffff',
) => {
  let currentX = xPos;
  const chars = text.toUpperCase().split('');

  chars.forEach((char) => {
    if (char === ' ') {
      currentX += (dotSize + gap) * 2;
      return;
    }

    const grid = SEG[char];
    if (!grid) {
      currentX += (dotSize + gap) * 3 + 4;
      return;
    }

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        ctx.fillStyle = grid[row][col] ? activeColor : 'rgba(255, 255, 255, 0.03)';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(currentX + col * (dotSize + gap), yPos + row * (dotSize + gap), dotSize, dotSize, 1);
        } else {
          ctx.rect(currentX + col * (dotSize + gap), yPos + row * (dotSize + gap), dotSize, dotSize);
        }
        ctx.fill();
      }
    }
    currentX += 3 * (dotSize + gap) + gap * 2;
  });

  return currentX;
};
