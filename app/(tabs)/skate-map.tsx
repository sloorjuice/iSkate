import { MapControls } from "@/components/MapControls";
import { SpotListModal } from "@/components/SpotListModal";
import { ThemedText } from "@/components/ThemedText";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { firestore } from "@/utils/firebaseConfig";
import * as Location from 'expo-location';
import { AppleMaps } from "expo-maps";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from "react";
import { Button, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type SkateSpot = {
  id: string;
  name: string;
  description?: string;
  difficulty?: string;
  skatedBy?: string[];
  images?: string[];
  spotType?: string[];
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

  const [listModalVisible, setListModalVisible] = useState(false);

  const [mapType, setMapType] = useState(AppleMaps.MapType.HYBRID);
  const { user } = useAuth();
  const bottom = useBottomTabOverflow();

  // Theme colors
  const modalBg = useThemeColor({}, "card");
  const modalText = useThemeColor({}, "text");
  const modalDesc = useThemeColor({}, "description");
  const modalBorder = useThemeColor({}, "icon");
  const mapTypeBtnBg = useThemeColor({}, "background");
  const mapTypeBtnText = useThemeColor({}, "text");

  const [searchRadiusMiles, setSearchRadiusMiles] = useState(25); // <-- Add this

  useEffect(() => {
    async function fetchSpots() {
      const querySnapshot = await getDocs(collection(firestore, "skateSpots"));
      const spotsData: SkateSpot[] = [];
      for (const docSnap of querySnapshot.docs) {
        const spot = { id: docSnap.id, ...docSnap.data() } as SkateSpot;
        // Fetch creator's favoriteColor if available
        if (spot.createdBy) {
          try {
            const userDoc = await getDoc(doc(firestore, "users", spot.createdBy));
            const userData = userDoc.exists() ? userDoc.data() : {};
            (spot as any).favoriteColor = userData.favoriteColor || "#FF4081"; // fallback color
          } catch {
            (spot as any).favoriteColor = "#FF4081";
          }
        } else {
          (spot as any).favoriteColor = "#FF4081";
        }
        spotsData.push(spot);
      }
      setSpots(spotsData);
      setLoading(false);
    }
    fetchSpots();
  }, []);

  // Memoize sorted and filtered spots by distance
  const sortedSpots = useMemo(() => {
    if (!userLocation) return spots;
    const radiusMeters = searchRadiusMiles * 1609.34; // 1 mile = 1609.34 meters
    // Filter by distance
    const filtered = spots.filter(
      (spot) =>
        getDistance(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          spot.latitude,
          spot.longitude
        ) <= radiusMeters
    );
    // Sort by distance
    return filtered.sort(
      (a, b) =>
        getDistance(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          a.latitude,
          a.longitude
        ) -
        getDistance(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          b.latitude,
          b.longitude
        )
    );
  }, [spots, userLocation, searchRadiusMiles]);

  // use this to convert the spots into markers
  const markersFromSpots = useMemo(
    () =>
      sortedSpots.map((spot) => ({
        coordinates: { latitude: spot.latitude, longitude: spot.longitude },
        title: spot.name,
        tintColor: (spot as any).favoriteColor, // Use favoriteColor
        //systemImage: "star.fill", // or whatever icon you want
      })),
    [sortedSpots]
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

  // What the actual fuck. im dying and crying
  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371e3; // metres
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  useEffect(() => {
    if (!selectedSpot && userLocation && spots.length > 0) {
      let nearest = spots[0];
      let minDist = getDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        nearest.latitude,
        nearest.longitude
      );
      for (const spot of spots) {
        const dist = getDistance(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          spot.latitude,
          spot.longitude
        );
        if (dist < minDist) {
          minDist = dist;
          nearest = spot;
        }
      }
      setSelectedSpot(nearest);
    }
  }, [selectedSpot, userLocation, spots, allMarkers]);

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

    const spot = spots.find(
    (s) =>
      Math.abs(s.latitude - nextLocation.coordinates.latitude) < 1e-6 &&
      Math.abs(s.longitude - nextLocation.coordinates.longitude) < 1e-6
  );
  setSelectedSpot(spot ?? null);
  }, [locationIndex, allMarkers, spots]);

  const toggleMapType = () => {
    setMapType((prev) =>
      prev === AppleMaps.MapType.HYBRID
        ? AppleMaps.MapType.IMAGERY
        : AppleMaps.MapType.HYBRID
    );
  };

    // Handler for selecting a spot from the list
  const handleSelectSpot = useCallback(
    (spot: SkateSpot) => {
      setSelectedSpot(spot);
      setListModalVisible(false);
      // Find the marker index for camera movement
      const idx = allMarkers.findIndex(
        (m) =>
          Math.abs(m.coordinates.latitude - spot.latitude) < 1e-6 &&
          Math.abs(m.coordinates.longitude - spot.longitude) < 1e-6
      );
      setLocationIndex(idx >= 0 ? idx : 0);
      // Move camera
      ref.current?.setCameraPosition({
        coordinates: {
          latitude: spot.latitude,
          longitude: spot.longitude,
        },
        zoom: 17,
      });
    },
    [allMarkers]
  );

  // MAIN RETURN STATEMENT
  // We use the useEffect statement to make sure that if were using the app on web it doesn't crash on web
  // unless you open the map screen
  useEffect(() => {
    let isMounted = true;
    async function loadMap() {
      if (Platform.OS === "ios") {
        const { AppleMaps } = await import("expo-maps");
        if (isMounted)
          setMapView(
            <>
              {/* Map type toggle button with theme */}
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 6,
                  left: 6,
                  zIndex: 10,
                  backgroundColor: mapTypeBtnBg,
                  padding: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: modalBorder,
                }}
                onPress={toggleMapType}
              >
                <ThemedText style={{ fontWeight: "bold", color: mapTypeBtnText }}>
                  {mapType === AppleMaps.MapType.HYBRID ? "All Locations" : "SkateSpots"}
                </ThemedText>
              </TouchableOpacity>
              <AppleMaps.View
                ref={ref}
                style={StyleSheet.absoluteFill}
                markers={allMarkers}
                cameraPosition={cameraPosition}
                properties={{
                  mapType: mapType,
                  selectionEnabled: false,
                  isTrafficEnabled: false,
                }}
                uiSettings={{
                  togglePitchEnabled: true,
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
                pointerEvents="box-none"
              >
                <MapControls
                  loading={loading || !selectedSpot}
                  selectedSpot={{
                    ...selectedSpot,
                    userLocation,
                    getDistance,
                  }}
                  previewImage={selectedSpot?.images?.[0]}
                  description={selectedSpot?.description}
                  skatedBy={selectedSpot?.skatedBy}
                  types={selectedSpot?.spotType}
                  rating={selectedSpot?.rating}
                  locationIndex={locationIndex}
                  markersLength={allMarkers.length}
                  onOpenList={() => setListModalVisible(true)}
                />
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
                <MapControls
                  loading={loading || !selectedSpot}
                  selectedSpot={{
                    ...selectedSpot,
                    userLocation,
                    getDistance,
                  }}
                  previewImage={selectedSpot?.images?.[0]}
                  description={selectedSpot?.description}
                  skatedBy={selectedSpot?.skatedBy}
                  types={selectedSpot?.spotType}
                  rating={selectedSpot?.rating}
                  locationIndex={locationIndex}
                  markersLength={allMarkers.length}
                  onOpenList={() => setListModalVisible(true)}
                />
              </SafeAreaView>
            </>
          );
      }
    }
    loadMap();
    return () => {
      isMounted = false;
    };
  }, [
    allMarkers,
    userLocation,
    cameraPosition,
    bottom,
    spots,
    selectedSpot,
    handleChangeWithRef,
    locationIndex,
    mapType,
    mapTypeBtnBg,
    mapTypeBtnText,
    modalBorder,
    loading
  ]);

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
      {/* Create Spot Modal (unchanged) */}
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
            backgroundColor: modalBg,
            padding: 24,
            borderRadius: 12,
            minWidth: 300,
            alignItems: "center"
          }}>
            <ThemedText style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8, color: modalText }}>Create Spot</ThemedText>
            <ThemedText style={{ color: modalText }}>Lat: {newSpotCords?.latitude ?? ""}</ThemedText>
            <ThemedText style={{ color: modalText }}>Lng: {newSpotCords?.longitude ?? ""}</ThemedText>
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Spot List Modal */}
      <SpotListModal
        visible={listModalVisible}
        onClose={() => setListModalVisible(false)}
        spots={sortedSpots}
        userLocation={userLocation}
        getDistance={getDistance}
        onSelectSpot={handleSelectSpot}
      />
    </>
  );
}