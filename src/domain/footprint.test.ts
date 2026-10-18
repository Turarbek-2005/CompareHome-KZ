import { footprintShape, footprintSize } from './footprint';

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

describe('footprint', () => {
  it('сохраняет площадь прямоугольника', () => {
    const { widthM, depthM } = footprintSize(68);
    expect(widthM * depthM).toBeCloseTo(68);
    expect(widthM).toBeGreaterThan(depthM);
  });

  it('ячейки покрывают всю площадь без зазоров', () => {
    for (const rooms of [1, 2, 3, 4, 5]) {
      const shape = footprintShape(120, rooms, null);
      expect(sum(shape.cells.map((c) => c.width * c.depth))).toBeCloseTo(120);
      expect(shape.cells.filter((c) => c.kind === 'room')).toHaveLength(rooms);
    }
  });

  it('две комнаты — в один ряд, пять — в два ряда (3 + 2)', () => {
    const two = footprintShape(60, 2, null).cells.filter((c) => c.kind === 'room');
    expect(new Set(two.map((c) => c.y)).size).toBe(1);
    const five = footprintShape(180, 5, null).cells.filter((c) => c.kind === 'room');
    const top = five.filter((c) => c.y === 0);
    expect(top).toHaveLength(3);
  });

  it('кухня во всю глубину слева', () => {
    const shape = footprintShape(80, 3, 12);
    const kitchen = shape.cells[0]!;
    expect(kitchen).toMatchObject({ x: 0, y: 0, kind: 'kitchen' });
    expect(kitchen.depth).toBeCloseTo(shape.depthM);
  });

  it('у студии одна ячейка', () => {
    expect(footprintShape(30, 0, null).cells).toHaveLength(1);
  });
});
