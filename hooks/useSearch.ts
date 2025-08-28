import type { SkateSpot } from "@/app/(tabs)/skate-map";
import { useMemo } from "react";

type SortField = "distance" | "difficulty" | "name" | "rating" | "date";
type SortDirection = "asc" | "desc";

type FilterOptions = {
  search: string;
  sortField: SortField;
  sortDirection: SortDirection;
  difficulties: string[];
  types: string[];
  userLocation: { coords: { latitude: number; longitude: number } } | null;
  getDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
};

export function useSpotListFilter(
  spots: SkateSpot[],
  options: FilterOptions
) {
  return useMemo(() => {
    let filtered = spots;

    // Search
    if (options.search) {
      filtered = filtered.filter(spot =>
        spot.name?.toLowerCase().includes(options.search.toLowerCase()) ||
        spot.description?.toLowerCase().includes(options.search.toLowerCase())
      );
    }

    // Difficulty filter
    if (options.difficulties.length > 0) {
      filtered = filtered.filter(spot =>
        options.difficulties.includes(spot.difficulty ?? "")
      );
    }

    // Type filter
    if (options.types.length > 0) {
      filtered = filtered.filter(spot =>
        Array.isArray(spot.spotType) &&
        options.types.every(type => spot.spotType?.includes(type)) // Ensure all selected types are included
      );
    }

    // Sorting
    filtered = [...filtered].sort((a, b) => {
      let aValue: any, bValue: any;
      switch (options.sortField) {
        case "distance":
          if (options.userLocation) {
            aValue = options.getDistance(
              options.userLocation.coords.latitude,
              options.userLocation.coords.longitude,
              a.latitude,
              a.longitude
            );
            bValue = options.getDistance(
              options.userLocation.coords.latitude,
              options.userLocation.coords.longitude,
              b.latitude,
              b.longitude
            );
          } else {
            aValue = 0;
            bValue = 0;
          }
          break;
        case "difficulty":
          aValue = a.difficulty ?? "";
          bValue = b.difficulty ?? "";
          break;
        case "name":
          aValue = a.name ?? "";
          bValue = b.name ?? "";
          break;
        case "rating":
          aValue = a.rating ?? 0;
          bValue = b.rating ?? 0;
          break;
        case "date":
          aValue = a.CreatedAt ? new Date(a.CreatedAt).getTime() : 0;
          bValue = b.CreatedAt ? new Date(b.CreatedAt).getTime() : 0;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }
      if (aValue < bValue) return options.sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return options.sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [spots, options]);
}