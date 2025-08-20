import { useEffect, useState, type JSX } from "react";
import { Platform, Text, View } from "react-native";

export default function SkateMap() {
  const [MapView, setMapView] = useState<JSX.Element | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadMap() {
      if (Platform.OS === "ios") {
        const { AppleMaps } = await import("expo-maps");
        if (isMounted) setMapView(
          <AppleMaps.View style={{ flex: 1 }} 
            
          />
        );
      } else if (Platform.OS === "android") {
        const { GoogleMaps } = await import("expo-maps");
        if (isMounted) setMapView(
          <GoogleMaps.View style={{ flex: 1 }} 

          />
        );
      }
    }
    loadMap();
    return () => {
      isMounted = false;
    };
  }, []);

  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Maps are not supported on web yet.</Text>
      </View>
    );
  }

  return MapView ?? null;
}
