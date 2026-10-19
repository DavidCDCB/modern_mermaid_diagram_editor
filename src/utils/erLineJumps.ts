interface Point {
  x: number;
  y: number;
}

interface Segment {
  a: Point;
  b: Point;
}

interface Crossing {
  edgeId: string;
  segmentIndex: number;
  t: number;
  point: Point;
}

interface RelationshipPath {
  id: string;
  element: Element;
  points: Point[];
}

interface SegmentJump {
  t: number;
  distance: number;
  radius: number;
  point: Point;
}

const EPSILON = 1e-6;
const CORNER_RADIUS = 5;
const JUMP_RADIUS = 5;

const segmentsFor = (points: Point[]): Segment[] =>
  points.slice(0, -1).map((point, index) => ({ a: point, b: points[index + 1] }));

const decodePoints = (encodedPoints: string | null): Point[] | null => {
  if (!encodedPoints) return null;

  try {
    const points: unknown = JSON.parse(atob(encodedPoints));
    if (!Array.isArray(points)) return null;

    const validPoints = points.filter((point): point is Point =>
      typeof point?.x === 'number' && Number.isFinite(point.x) &&
      typeof point?.y === 'number' && Number.isFinite(point.y),
    );

    return validPoints.length >= 2 ? validPoints : null;
  } catch {
    return null;
  }
};

const findSegmentIntersection = (first: Segment, second: Segment) => {
  const deltaAX = first.b.x - first.a.x;
  const deltaAY = first.b.y - first.a.y;
  const deltaBX = second.b.x - second.a.x;
  const deltaBY = second.b.y - second.a.y;
  const denominator = deltaAX * deltaBY - deltaAY * deltaBX;

  if (Math.abs(denominator) < EPSILON) return null;

  const deltaX = second.a.x - first.a.x;
  const deltaY = second.a.y - first.a.y;
  const firstT = (deltaX * deltaBY - deltaY * deltaBX) / denominator;
  const secondT = (deltaX * deltaAY - deltaY * deltaAX) / denominator;

  if (
    firstT <= EPSILON || firstT >= 1 - EPSILON ||
    secondT <= EPSILON || secondT >= 1 - EPSILON
  ) return null;

  return {
    firstT,
    secondT,
    point: { x: first.a.x + firstT * deltaAX, y: first.a.y + firstT * deltaAY },
  };
};

const isHorizontal = (segment: Segment): boolean =>
  Math.abs(segment.b.x - segment.a.x) >= Math.abs(segment.b.y - segment.a.y);

const findCrossings = (edges: RelationshipPath[]): Crossing[] => {
  const crossings: Crossing[] = [];

  for (let firstIndex = 0; firstIndex < edges.length; firstIndex++) {
    const firstEdge = edges[firstIndex];
    const firstSegments = segmentsFor(firstEdge.points);

    for (let secondIndex = firstIndex + 1; secondIndex < edges.length; secondIndex++) {
      const secondEdge = edges[secondIndex];
      const secondSegments = segmentsFor(secondEdge.points);

      firstSegments.forEach((firstSegment, firstSegmentIndex) => {
        secondSegments.forEach((secondSegment, secondSegmentIndex) => {
          const intersection = findSegmentIntersection(firstSegment, secondSegment);
          if (!intersection) return;

          const firstIsHorizontal = isHorizontal(firstSegment);
          const secondIsHorizontal = isHorizontal(secondSegment);
          const firstJumps = firstIsHorizontal !== secondIsHorizontal ? firstIsHorizontal : false;

          crossings.push(firstJumps ? {
            edgeId: firstEdge.id,
            segmentIndex: firstSegmentIndex,
            t: intersection.firstT,
            point: intersection.point,
          } : {
            edgeId: secondEdge.id,
            segmentIndex: secondSegmentIndex,
            t: intersection.secondT,
            point: intersection.point,
          });
        });
      });
    }
  }

  return crossings;
};

const computeRoundedCorner = (previous: Point, current: Point, next: Point, radius: number) => {
  const firstDX = current.x - previous.x;
  const firstDY = current.y - previous.y;
  const secondDX = next.x - current.x;
  const secondDY = next.y - current.y;
  const firstLength = Math.hypot(firstDX, firstDY);
  const secondLength = Math.hypot(secondDX, secondDY);

  if (firstLength < EPSILON || secondLength < EPSILON) return null;

  const firstX = firstDX / firstLength;
  const firstY = firstDY / firstLength;
  const secondX = secondDX / secondLength;
  const secondY = secondDY / secondLength;
  const angle = Math.acos(Math.max(-1, Math.min(1, firstX * secondX + firstY * secondY)));

  if (angle < EPSILON || Math.abs(Math.PI - angle) < EPSILON) return null;

  const cutLength = Math.min(radius / Math.sin(angle / 2), firstLength / 2, secondLength / 2);
  return {
    start: { x: current.x - firstX * cutLength, y: current.y - firstY * cutLength },
    end: { x: current.x + secondX * cutLength, y: current.y + secondY * cutLength },
    cutLength,
  };
};

const formatNumber = (value: number): string => {
  const rounded = Math.round(value * 1000) / 1000;
  return String(rounded);
};

const formatPoint = (point: Point): string => `${formatNumber(point.x)},${formatNumber(point.y)}`;

const rewritePathWithJumps = (points: Point[], crossings: Crossing[]): string => {
  const segments = segmentsFor(points);
  const jumpsBySegment = new Map<number, SegmentJump[]>();

  for (const crossing of crossings) {
    const segment = segments[crossing.segmentIndex];
    if (!segment) continue;

    const length = Math.hypot(segment.b.x - segment.a.x, segment.b.y - segment.a.y);
    const jumps = jumpsBySegment.get(crossing.segmentIndex) ?? [];
    jumps.push({ t: crossing.t, distance: crossing.t * length, radius: JUMP_RADIUS, point: crossing.point });
    jumpsBySegment.set(crossing.segmentIndex, jumps);
  }

  const pathParts = [`M${formatPoint(points[0])}`];

  segments.forEach((segment, segmentIndex) => {
    const length = Math.hypot(segment.b.x - segment.a.x, segment.b.y - segment.a.y);
    const directionX = length === 0 ? 0 : (segment.b.x - segment.a.x) / length;
    const directionY = length === 0 ? 0 : (segment.b.y - segment.a.y) / length;
    const roundedStart = segmentIndex > 0
      ? computeRoundedCorner(points[segmentIndex - 1], points[segmentIndex], points[segmentIndex + 1], CORNER_RADIUS)
      : null;
    const roundedEnd = segmentIndex < segments.length - 1
      ? computeRoundedCorner(points[segmentIndex], points[segmentIndex + 1], points[segmentIndex + 2], CORNER_RADIUS)
      : null;
    const usableStart = roundedStart?.cutLength ?? 0;
    const usableEnd = length - (roundedEnd?.cutLength ?? 0);
    const jumps = (jumpsBySegment.get(segmentIndex) ?? []).sort((first, second) => first.t - second.t);

    jumps.forEach((jump) => {
      jump.radius = Math.min(jump.radius, jump.distance - usableStart, usableEnd - jump.distance);
    });

    for (let index = 0; index < jumps.length - 1; index++) {
      const availableSpace = jumps[index + 1].distance - jumps[index].distance;
      if (jumps[index].radius + jumps[index + 1].radius > availableSpace) {
        jumps[index].radius = Math.min(jumps[index].radius, availableSpace / 2);
        jumps[index + 1].radius = Math.min(jumps[index + 1].radius, availableSpace / 2);
      }
    }

    for (const jump of jumps) {
      if (jump.radius < EPSILON) continue;
      const before = {
        x: jump.point.x - directionX * jump.radius,
        y: jump.point.y - directionY * jump.radius,
      };
      const after = {
        x: jump.point.x + directionX * jump.radius,
        y: jump.point.y + directionY * jump.radius,
      };
      const sweep = Math.abs(segment.b.x - segment.a.x) >= Math.abs(segment.b.y - segment.a.y)
        ? Number(segment.b.x >= segment.a.x)
        : Number(segment.b.y >= segment.a.y);

      pathParts.push(`L${formatPoint(before)}`);
      pathParts.push(`A${formatNumber(jump.radius)},${formatNumber(jump.radius)} 0 0 ${sweep} ${formatPoint(after)}`);
    }

    if (roundedEnd) {
      pathParts.push(`L${formatPoint(roundedEnd.start)}`);
      pathParts.push(`Q${formatPoint(points[segmentIndex + 1])} ${formatPoint(roundedEnd.end)}`);
    } else {
      pathParts.push(`L${formatPoint(segment.b)}`);
    }
  });

  return pathParts.join(' ');
};

export const addErRelationshipLineJumps = (svg: string): string => {
  const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const paths = Array.from(document.querySelectorAll('path.relationshipLine'));
  const edges: RelationshipPath[] = paths.flatMap((element) => {
    const id = element.getAttribute('data-id');
    const points = decodePoints(element.getAttribute('data-points'));
    return id && points ? [{ id, element, points }] : [];
  });
  const crossings = findCrossings(edges);

  if (crossings.length === 0) return svg;

  const crossingsByEdge = new Map<string, Crossing[]>();
  crossings.forEach((crossing) => {
    const edgeCrossings = crossingsByEdge.get(crossing.edgeId) ?? [];
    edgeCrossings.push(crossing);
    crossingsByEdge.set(crossing.edgeId, edgeCrossings);
  });

  edges.forEach((edge) => {
    const edgeCrossings = crossingsByEdge.get(edge.id);
    if (!edgeCrossings?.length) return;
    edge.element.setAttribute('d', rewritePathWithJumps(edge.points, edgeCrossings));
  });

  return new XMLSerializer().serializeToString(document.documentElement);
};