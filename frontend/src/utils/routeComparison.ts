import { ParsedRoute, RouteAlternative, RouteBadge } from '../types/navigation';
import { calculateDistanceMeters } from './geoUtils';

const ROUTE_COLOR_PALETTES = [
  { color: '#10b981', outlineColor: '#064e3b' }, // Emerald (primary)
  { color: '#6366f1', outlineColor: '#1e1b4b' }, // Indigo / Blue
  { color: '#f59e0b', outlineColor: '#451a03' }, // Amber / Orange
  { color: '#06b6d4', outlineColor: '#083344' }, // Cyan
];

/**
 * RouteComparisonEngine
 * Compares, filters duplicates, sorts, and attaches comparison metrics to alternative routes
 */
export class RouteComparisonEngine {
  /**
   * Filter out duplicate or nearly identical routes
   * Compares geometry lengths and point overlap
   */
  public static filterDuplicateRoutes(routes: ParsedRoute[]): ParsedRoute[] {
    if (!routes || routes.length <= 1) return routes || [];

    const validRoutes = routes.filter(
      (r) => r && r.coordinates && r.coordinates.length > 1 && r.totalDistanceMeters > 50
    );

    const uniqueRoutes: ParsedRoute[] = [];

    for (const candidate of validRoutes) {
      let isDuplicate = false;

      for (const existing of uniqueRoutes) {
        // 1. Check distance difference
        const distDiff = Math.abs(candidate.totalDistanceMeters - existing.totalDistanceMeters);
        const distRatio = distDiff / Math.max(candidate.totalDistanceMeters, existing.totalDistanceMeters);

        // If distance differs by less than 1.5%, inspect coordinate sample similarity
        if (distRatio < 0.015) {
          const sampleCount = Math.min(10, candidate.coordinates.length, existing.coordinates.length);
          let closePoints = 0;

          for (let i = 0; i < sampleCount; i++) {
            const idxCand = Math.floor((i / (sampleCount - 1 || 1)) * (candidate.coordinates.length - 1));
            const idxExist = Math.floor((i / (sampleCount - 1 || 1)) * (existing.coordinates.length - 1));

            const dist = calculateDistanceMeters(
              candidate.coordinates[idxCand],
              existing.coordinates[idxExist]
            );

            // Points within 40m of each other are considered virtually identical roads
            if (dist < 40) {
              closePoints++;
            }
          }

          if (closePoints / sampleCount >= 0.8) {
            isDuplicate = true;
            break;
          }
        }
      }

      if (!isDuplicate) {
        uniqueRoutes.push(candidate);
      }
    }

    return uniqueRoutes.slice(0, 3); // Max 3 alternatives as requested
  }

  /**
   * Count significant maneuvers (Left, Right, U-Turn)
   */
  public static countSignificantTurns(route: ParsedRoute): number {
    if (!route || !route.steps) return 0;
    return route.steps.filter((s) => s.direction === 'LEFT' || s.direction === 'RIGHT' || s.direction === 'U-TURN').length;
  }

  /**
   * Transform raw ParsedRoute[] into enriched RouteAlternative[] with comparison metrics
   */
  public static buildRouteAlternatives(routes: ParsedRoute[]): RouteAlternative[] {
    const filtered = this.filterDuplicateRoutes(routes);
    if (filtered.length === 0) return [];

    // Find global minimums for comparative delta calculations
    const minDistance = Math.min(...filtered.map((r) => r.totalDistanceMeters));
    const minDuration = Math.min(...filtered.map((r) => r.totalDurationSeconds));

    let shortestAssigned = false;
    let fastestAssigned = false;

    return filtered.map((route, idx) => {
      const distanceKm = Math.round((route.totalDistanceMeters / 1000) * 10) / 10;
      const durationMin = Math.round(route.totalDurationSeconds / 60);

      const distanceDiffKm = Math.round(((route.totalDistanceMeters - minDistance) / 1000) * 10) / 10;
      const durationDiffMin = Math.round((route.totalDurationSeconds - minDuration) / 60);

      const turnCount = this.countSignificantTurns(route);

      // Determine badge
      let badge: RouteBadge = 'ALTERNATIVE';
      if (!shortestAssigned && Math.abs(route.totalDistanceMeters - minDistance) < 10) {
        badge = 'SHORTEST';
        shortestAssigned = true;
      } else if (!fastestAssigned && Math.abs(route.totalDurationSeconds - minDuration) < 15) {
        badge = 'FASTEST';
        fastestAssigned = true;
      }

      const palette = ROUTE_COLOR_PALETTES[idx % ROUTE_COLOR_PALETTES.length];

      return {
        id: route.id || `alt-route-${idx}`,
        index: idx,
        label: `Route ${idx + 1}`,
        badge,
        distanceMeters: route.totalDistanceMeters,
        durationSeconds: route.totalDurationSeconds,
        distanceKm,
        durationMin,
        distanceDiffKm,
        durationDiffMin,
        turnCount,
        parsedRoute: route,
        color: palette.color,
        outlineColor: palette.outlineColor
      };
    });
  }

  /**
   * Sort alternative routes by user preference
   */
  public static sortRoutes(
    alternatives: RouteAlternative[],
    sortBy: 'distance' | 'time' | 'turns'
  ): RouteAlternative[] {
    const list = [...alternatives];
    switch (sortBy) {
      case 'distance':
        return list.sort((a, b) => a.distanceMeters - b.distanceMeters);
      case 'time':
        return list.sort((a, b) => a.durationSeconds - b.durationSeconds);
      case 'turns':
        return list.sort((a, b) => a.turnCount - b.turnCount);
      default:
        return list;
    }
  }
}

