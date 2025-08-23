import type { SkateSpot } from "@/app/(tabs)/skate-map";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Image } from "expo-image";
import { Button, FlatList, Modal, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";

type SpotListModalProps = {
  visible: boolean;
  onClose: () => void;
  spots: SkateSpot[];
  userLocation: { coords: { latitude: number; longitude: number } } | null;
  getDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
  onSelectSpot: (spot: SkateSpot) => void;
};

export function SpotListModal({
  visible,
  onClose,
  spots,
  userLocation,
  getDistance,
  onSelectSpot,
}: SpotListModalProps) {
  // Theme colors
  const modalBg = useThemeColor({}, "card"); // Card color for cards (header color)
  const modalText = useThemeColor({}, "text");
  const modalDesc = useThemeColor({}, "description");
  const modalBorder = useThemeColor({}, "icon");
  const typeBadgeBg = useThemeColor({}, "tint");
  const typeBadgeText = useThemeColor({}, "background");
  const modalBackground = useThemeColor({}, "background"); // <-- Add this

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}>
        <View style={{
          backgroundColor: modalBackground, // <-- Use background color for modal background
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          width: "100%",
          maxHeight: "80%",
          padding: 16,
        }}>
          <ThemedText style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12, color: modalText }}>
            All Skate Spots
          </ThemedText>
          <FlatList
            data={spots}
            keyExtractor={(item) => item.id}
            initialNumToRender={20}
            maxToRenderPerBatch={30}
            windowSize={21}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  backgroundColor: modalBg, // <-- Card color for cards (header color)
                  borderRadius: 14,
                  marginBottom: 14,
                  padding: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  // iOS shadow
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.12,
                  shadowRadius: 6,
                  // Android shadow
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: modalBorder,
                }}
                onPress={() => onSelectSpot(item)}
              >
                {item.images?.[0] && (
                  <Image
                    source={{ uri: item.images[0] }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: "#eee",
                      backgroundColor: "#222",
                    }}
                    contentFit="cover"
                    transition={300}
                  />
                )}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <ThemedText style={{ fontWeight: "bold", color: modalText, fontSize: 16 }}>
                      {item.name
                        ? `${item.name.slice(0, 26)}${item.name.length > 26 ? "..." : ""}`
                        : ""}
                    </ThemedText>
                    {typeof item.rating === "number" && (
                      <ThemedText style={{ fontSize: 13, color: "#f5a623" }}>
                        ⭐ {item.rating.toFixed(1)}
                      </ThemedText>
                    )}
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
                    <ThemedText style={{ color: modalText, fontSize: 13 }}>
                      {item.description
                        ? `${item.description.slice(0, 34)}${item.description.length > 34 ? "..." : ""}`
                        : ""}
                    </ThemedText>
                    {Array.isArray(item.skatedBy) && (
                      <ThemedText style={{ fontSize: 13, color: "#888" }}>
                        🧍 {item.skatedBy.length}
                      </ThemedText>
                    )}
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                    {Array.isArray(item.spotType) && item.spotType.slice(0, 2).map((type) => (
                      <ThemedText
                        key={type}
                        style={{
                          fontSize: 12,
                          color: typeBadgeText,         // Use the variable
                          backgroundColor: typeBadgeBg, // Use the variable
                          borderRadius: 6,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          marginRight: 2,
                        }}
                      >
                        {type}
                      </ThemedText>
                    ))}
                    {Array.isArray(item.spotType) && item.spotType.length > 2 && (
                      <ThemedText style={{ fontSize: 12, color: "#888" }}>
                        +{item.spotType.length - 2}
                      </ThemedText>
                    )}
                    {userLocation && (
                      <ThemedText style={{ color: modalDesc, fontSize: 12, marginLeft: 6 }}>
                        {(getDistance(
                          userLocation.coords.latitude,
                          userLocation.coords.longitude,
                          item.latitude,
                          item.longitude
                        ) / 1000).toFixed(2)} km away
                      </ThemedText>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}