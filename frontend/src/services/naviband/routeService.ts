import { fetchRouteDirections } from './navibandApi';
import { parseAllOrsRoutes, parseOrsRouteResponse } from '../../utils/turnClassifier';
import { ParsedRoute } from '../../types/navigation';

export interface RouteServiceResult {
  routes: ParsedRoute[];
  source: 'ors-alternatives' | 'single-route' | 'fallback';
}

/**
 * RouteService: Fetches and normalizes driving directions from ORS via backend proxy
 * Handles single or multiple alternative routes
 */
export class RouteService {
  /**
   * Request routes between start and destination coordinates
   * @param coordinates Array of [lon, lat] pairs
   * @param profile Routing profile ('driving-car')
   * @returns Array of ParsedRoute
   */
  public static async fetchRoutes(
    coordinates: [number, number][],
    profile = 'driving-car'
  ): Promise<ParsedRoute[]> {
    if (!coordinates || coordinates.length < 2) {
      throw new Error('At least two coordinate points are required to calculate a route');
    }

    const rawGeojson = await fetchRouteDirections(coordinates, profile);

    if (!rawGeojson || !rawGeojson.features || rawGeojson.features.length === 0) {
      throw new Error('No driving routes returned from OpenRouteService for these locations');
    }

    try {
      const parsedRoutes = parseAllOrsRoutes(rawGeojson);
      return parsedRoutes;
    } catch (parseErr: any) {
      // Fallback: try parsing at least features[0]
      const singleRoute = parseOrsRouteResponse(rawGeojson);
      return [singleRoute];
    }
  }
}

