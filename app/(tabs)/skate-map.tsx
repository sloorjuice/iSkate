import { ThemedText } from "@/components/ThemedText";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import { useAuth } from "@/contexts/AuthContext";
import { firestore } from "@/utils/firebaseConfig";
import * as Location from 'expo-location';
import { AppleMaps } from "expo-maps";
import { AppleMapsMapType } from "expo-maps/build/apple/AppleMaps.types";
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from "react";
import { Button, Modal, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SkateSpot = {
  id: string;
  name: string;
  description?: string;
  difficulty?: string;
  skatedBy?: string[];
  images?: string[];
  spotTypes?: string[];
  latitude: number;
  longitude: number;
  CreatedAt?: Date;
  createdBy?: string;
  rating?: number;
  ratings?: number[];
};

export default function SkateMap() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const ref = useRef<AppleMaps.MapView>(null);
  const [MapView, setMapView] = useState<JSX.Element | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationIndex, setLocationIndex] = useState(0);
  const [spots, setSpots] = useState<SkateSpot[]>([]);

  const [selectedSpot, setSelectedSpot] = useState<SkateSpot | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [newSpotCords, setNewSpotCords] = useState<{ latitude: number; longitude: number } | null>(null);

  const { user } = useAuth();
  const bottom = useBottomTabOverflow();

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
    () => [...userMarker, ...markersFromSpots],
    [markersFromSpots, userMarker]
  );

  const cameraPosition = useMemo(() => {
    const marker = allMarkers[locationIndex] ?? allMarkers[0];
    if (!marker) {
      // fallback to a default location if no markers exist
      return {
        coordinates: {
          latitude: 49.27235336018808,
          longitude: -123.13455838338278,
        },
        zoom: 15,
      };
    }
    return {
      coordinates: {
        latitude: marker.coordinates.latitude,
        longitude: marker.coordinates.longitude,
      },
      zoom: 17,
    };
  }, [allMarkers, locationIndex]);

  const handleChangeWithRef = useCallback((direction: "next" | "prev") => {
    const newIndex = locationIndex + (direction === "next" ? 1 : -1);
    const nextLocation = allMarkers[newIndex] ?? allMarkers[0];

    // Set camera position first to ensure animation happens
    ref.current?.setCameraPosition({
      coordinates: {
        latitude: nextLocation.coordinates.latitude,
        longitude: nextLocation.coordinates.longitude,
      },
      zoom: 17,
    });

    setLocationIndex(newIndex);
  }, [locationIndex, allMarkers]);

  const renderMapControls = useCallback(() => (
    <>
      <View style={{ flex: 8 }} pointerEvents="none" />

      <View style={styles.controlsContainer} pointerEvents="auto">
        <View style={styles.controlsInner}>
          {selectedSpot && (
            <ThemedText style={styles.selectedSpotText} type="subtitle">
              {selectedSpot.name}
            </ThemedText>
          )}
          <View style={styles.buttonRow}>
            <Button
              title="Prev"
              onPress={() => handleChangeWithRef("prev")}
              disabled={locationIndex <= 0}
            />
            <Button
              title="Next"
              onPress={() => handleChangeWithRef("next")}
              disabled={locationIndex >= allMarkers.length - 1}
            />
          </View>
        </View>
      </View>
    </>
  ), [locationIndex, allMarkers.length, handleChangeWithRef, selectedSpot]);

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
              <>
                <AppleMaps.View
                  ref={ref}
                  style={StyleSheet.absoluteFill}
                  markers={allMarkers}
                  cameraPosition={cameraPosition}
                  properties={{
                    mapType: AppleMapsMapType.IMAGERY,
                    selectionEnabled: false,
                    isTrafficEnabled: false,
                  }}
                   onMapClick={(e) => {
                      console.log(
                        JSON.stringify({ type: "onMapClick", data: e }, null, 2)
                      );

                      // const { latitude, longitude } = e.coordinates ?? e;
                      // if (typeof latitude === "number" && typeof longitude === "number") {
                      //   setNewSpotCords({ latitude, longitude });
                      //   setModalVisible(true);
                      // }
                    }}
                    onMarkerClick={(e) => {
                      console.log(
                        JSON.stringify({ type: "onMarkerClick", data: e }, null, 2)
                      );
                      
                      // e.coordinates contains the lat/lng of the tapped marker
                      // Defensive: extract coordinates safely
                      const coords = (e && 'coordinates' in e) ? (e as any).coordinates : e;
                      const latitude = coords?.latitude;
                      const longitude = coords?.longitude;
                      // Find the spot with matching coordinates
                      const spot = spots.find(
                        (s) =>
                          Math.abs(s.latitude - latitude) < 1e-6 &&
                          Math.abs(s.longitude - longitude) < 1e-6
                      );
                      if (spot) {
                        setSelectedSpot(spot);
                        // Optionally open a modal or show spot details here
                        // setModalVisible(true);
                      }
                    }}
                    onCameraMove={(e) => {
                      console.log(
                        JSON.stringify({ type: "onCameraMove", data: e }, null, 2)
                      );
                    }}
                />
                <SafeAreaView
                  style={{ flex: 1, paddingBottom: bottom }}
                  pointerEvents="box-none" // this allows the user to use the object (map) behind the map controls
                >
                  {renderMapControls()}
                </SafeAreaView>
              </>
          );
      } else if (Platform.OS === "android") { // ANDROID
        const { GoogleMaps } = await import("expo-maps");
        if (isMounted)
          setMapView(
            <>
              <GoogleMaps.View
                ref={ref}
                style={{ flex: 1 }}
                markers={allMarkers}
                cameraPosition={cameraPosition}
              />
              <SafeAreaView
                style={{ flex: 1, paddingBottom: bottom }}
                pointerEvents="box-none" // this allows the user to use the object (map) behind the map controls
              >
                {renderMapControls()}
              </SafeAreaView>
            </>
          );
      }
    }
    loadMap();
    return () => {
      isMounted = false;
    };
  }, [allMarkers, userLocation, cameraPosition, renderMapControls, bottom, spots]);

  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Maps are not supported on web yet.</Text>
      </View>
    );
  }

  // Move Modal here so it always reflects latest state
  return (
    <>
      {MapView}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)"
        }}>
          <View style={{
            backgroundColor: "white",
            padding: 24,
            borderRadius: 12,
            minWidth: 300,
            alignItems: "center"
          }}>
            <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>Create Spot</Text>
            <Text>Lat: {newSpotCords?.latitude ?? ""}</Text>
            <Text>Lng: {newSpotCords?.longitude ?? ""}</Text>
            {/* Add your form fields here */}
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
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
  controlsInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  selectedSpotText: {
    marginBottom: 8,
    fontWeight: "bold",
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
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