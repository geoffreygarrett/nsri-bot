import * as turf from '@turf/turf'

export const lineIntersect = require('@turf/line-intersect').default;
export const polygonSmooth = require('@turf/polygon-smooth').default;
export const booleanPointInPolygon = require('@turf/boolean-point-in-polygon').default;
// const
const helpers = require('@turf/helpers');

// const mercator = turf.proj4("EPSG:4326", "EPSG:3857");
//
// function mercatorLineIntersect(line1, line2) {
//     // Convert the lines to Mercator coordinates
//     const line1Mercator = line1.geometry.coordinates.map((coord) =>
//         mercator.forward(coord)
//     );
//     const line2Mercator = line2.geometry.coordinates.map((coord) =>
//         mercator.forward(coord)
//     );
//
//     // Define the lines in the form y = mx + b
//     const m1 =
//         (line1Mercator[1][1] - line1Mercator[0][1]) /
//         (line1Mercator[1][0] - line1Mercator[0][0]);
//     const b1 = line1Mercator[0][1] - m1 * line1Mercator[0][0];
//
//     const m2 =
//         (line2Mercator[1][1] - line2Mercator[0][1]) /
//         (line2Mercator[1][0] - line2Mercator[0][0]);
//     const b2 = line2Mercator[0][1] - m2 * line2Mercator[0][0];
//
//     // Find the intersection point
//     const x = (b2 - b1) / (m1 - m2);
//     const y = m1 * x + b1;
//
//     // Convert the intersection point back to geographic coordinates
//     const intersection = mercator.inverse([x, y]);
//
//     return point(intersection);
// }
