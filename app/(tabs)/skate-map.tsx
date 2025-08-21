import { useAuth } from "@/contexts/AuthContext";
import { firestore } from "@/utils/firebaseConfig";
import * as Location from 'expo-location';
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import { Button, Platform, StyleSheet, Text, View } from "react-native";

type SkateSpot = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export default function SkateMap() {
  const [MapView, setMapView] = useState<JSX.Element | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationIndex, setLocationIndex] = useState(0);
  const [spots, setSpots] = useState<SkateSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { user } = useAuth();

  // const cameraPosition = useMemo(() => {
  //   if (userLocation) {
  //     return {
  //       coordinates: {
  //         latitude: userLocation.coords.latitude,
  //         longitude: userLocation.coords.longitude,
  //       },
  //       zoom: 15,
  //     };
  //   } else {
  //     setErrorMsg("Unable to determine your location.");
  //     return {
  //       coordinates: {
  //       latitude: 49.27235336018808,
  //       longitude: -123.13455838338278,
  //     },
  //     zoom: 15,
  //   };
  //   }
  // }, [userLocation]);

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

  const markersFromSpots = useMemo(
    () =>
      spots.map((spot) => ({
        coordinates: { latitude: spot.latitude, longitude: spot.longitude },
        title: spot.name,
        // Optionally add tintColor, systemImage, etc.
      })),
    [spots]
  );

  useEffect(() => {
    async function getCurrentLocation() {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
    }

    getCurrentLocation();
  }, []);

  const userMarker = useMemo(
    () =>
      userLocation
        ? [
            {
              coordinates: {
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
              },
              title: user?.displayName ?? "You are here",
              tintColor: "blue",
              systemImage: "location.fill",
            },
          ]
        : [],
    [userLocation, user?.displayName]
  );

  const allMarkers = useMemo(
    () => [...markersFromSpots, ...userMarker],
    [markersFromSpots, userMarker]
  );

  const cameraPosition = useMemo(() => ({
    coordinates: {
      latitude: allMarkers[locationIndex].coordinates.latitude,
      longitude: allMarkers[locationIndex].coordinates.longitude,
    },
    zoom: 18,
  }), [allMarkers, locationIndex]);

  const renderMapControls = useCallback(() => (
    <>
      <View style={{ flex: 8 }} pointerEvents="none" />

      <View style={styles.controlsContainer} pointerEvents="auto">
        <Button
          title="Prev"
          onPress={() => setLocationIndex(locationIndex - 1)}
        />
        <Button
          title="Next"
          onPress={() => setLocationIndex(locationIndex - 1)}
        />
      </View>
    </>
  ), [locationIndex]);

  // MAIN RETURN STATEMENT
  // We use the useEffect statement to make sure that if were using the app on web it doesn't crash on web
  // unless you open the map screen
  useEffect(() => {
    let isMounted = true;
    async function loadMap() {
      if (Platform.OS === "ios") { // IOS
        const { AppleMaps } = await import("expo-maps");
        if (isMounted)
          setMapView(
            <AppleMaps.View
              style={{ flex: 1 }}
              markers={allMarkers}
              cameraPosition={cameraPosition}
            />
          );
          {renderMapControls()}
      } else if (Platform.OS === "android") { // ANDROID
        const { GoogleMaps } = await import("expo-maps");
        if (isMounted)
          setMapView(
            <GoogleMaps.View
              style={{ flex: 1 }}
              markers={allMarkers}
              cameraPosition={cameraPosition}
            />
          );
          {renderMapControls()}
      }
    }
    loadMap();
    return () => {
      isMounted = false;
    };
  }, [allMarkers, userLocation, cameraPosition, renderMapControls]);

  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Maps are not supported on web yet.</Text>
      </View>
    );
  }

  return MapView ?? null;
}

const styles = StyleSheet.create({
  controlsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});


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