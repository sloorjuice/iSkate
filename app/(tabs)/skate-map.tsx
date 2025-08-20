import { firestore } from "@/utils/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState, type JSX } from "react";
import { Platform, Text, View } from "react-native";

type SkateSpot = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export default function SkateMap() {
  const [MapView, setMapView] = useState<JSX.Element | null>(null);
  const [spots, setSpots] = useState<SkateSpot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSpots() {
      const querySnapshot = await getDocs(collection(firestore, "skateSpots"));
      const spotsData: SkateSpot[] = [];
      querySnapshot.forEach((doc) => {
        spotsData.push({ id: doc.id, ...doc.data() } as SkateSpot);
      });
      setSpots(spotsData);
      setLoading(false);
    }
    fetchSpots();
  }, []);

  const markersFromSpots = spots.map((spot) => ({
    coordinates: { latitude: spot.latitude, longitude: spot.longitude },
    title: spot.name,
    // Optionally add tintColor, systemImage, etc.
  }));

  useEffect(() => {
    let isMounted = true;
    async function loadMap() {
      if (Platform.OS === "ios") {
        const { AppleMaps } = await import("expo-maps");
        if (isMounted)
          setMapView(
            <AppleMaps.View style={{ flex: 1 }} markers={markersFromSpots} />
          );
      } else if (Platform.OS === "android") {
        const { GoogleMaps } = await import("expo-maps");
        if (isMounted)
          setMapView(
            <GoogleMaps.View style={{ flex: 1 }} 
          />
          );
      }
    }
    loadMap();
    return () => {
      isMounted = false;
    };
  }, [spots]); // <-- Add spots as a dependency

  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Maps are not supported on web yet.</Text>
      </View>
    );
  }

  return MapView ?? null;
}

const markersApple = [
  {
    coordinates: { latitude: 49.259133, longitude: -123.10079 },
    title: "49th Parallel Café & Lucky's Doughnuts - Main Street",
    tintColor: "brown",
    systemImage: "cup.and.saucer.fill",
  },
  {
    coordinates: { latitude: 49.268034, longitude: -123.154819 },
    title: "49th Parallel Café & Lucky's Doughnuts - 4th Ave",
    tintColor: "brown",
    systemImage: "cup.and.saucer.fill",
  },
  {
    coordinates: { latitude: 49.286036, longitude: -123.12303 },
    title: "49th Parallel Café & Lucky's Doughnuts - Thurlow",
    tintColor: "brown",
    systemImage: "cup.and.saucer.fill",
  },
  {
    coordinates: { latitude: 49.311879, longitude: -123.079241 },
    title: "49th Parallel Café & Lucky's Doughnuts - Lonsdale",
    tintColor: "brown",
    systemImage: "cup.and.saucer.fill",
  },
  {
    coordinates: {
      latitude: 49.27235336018808,
      longitude: -123.13455838338278,
    },
    title: "A La Mode Pie Café - Granville Island",
    tintColor: "orange",
    systemImage: "fork.knife",
  },
];