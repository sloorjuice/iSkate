import type { SkateSpot } from "@/app/(tabs)/skate-map";
import { SPOT_TYPES } from "@/constants/SpotTypes";
import { useSpotListFilter } from "@/hooks/useSearch";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from '@expo/vector-icons'; // or any icon lib you use
import { Image } from "expo-image";
import { useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import { ThemedText } from "./ThemedText";

type SpotListModalProps = {
  visible: boolean;
  onClose: () => void;
  spots: SkateSpot[];
  userLocation: { coords: { latitude: number; longitude: number } } | null;
  getDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
  onSelectSpot: (spot: SkateSpot) => void;
};

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

export function SpotListModal({
  visible,
  onClose,
  spots,
  userLocation,
  getDistance,
  onSelectSpot,
}: SpotListModalProps) {
  // Theme colors
  const modalBg = useThemeColor({}, "card");
  const modalText = useThemeColor({}, "text");
  const modalDesc = useThemeColor({}, "description");
  const modalBorder = useThemeColor({}, "icon");
  const typeBadgeBg = useThemeColor({}, "tint");
  const typeBadgeText = useThemeColor({}, "background");
  const modalBackground = useThemeColor({}, "background");

  // --- Add filter/sort/search state ---
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"distance" | "difficulty" | "name" | "rating" | "date">("distance");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  // Add local state for toggling filter sections
  const [showSearch, setShowSearch] = useState(true);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [showTypes, setShowTypes] = useState(false);
  const [showSort, setShowSort] = useState(false);

  // --- Use the filtering hook ---
  const filteredSpots = useSpotListFilter(spots, {
    search,
    sortField,
    sortDirection,
    difficulties,
    types,
    userLocation,
    getDistance,
  });

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={["down"]}
      style={{
        justifyContent: "flex-end",
        margin: 0,
      }}
      propagateSwipe
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          flex: 1,
          justifyContent: "flex-end", // Align modal to the bottom
        }}
      >
        <View
          style={{
            backgroundColor: modalBackground,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            width: "100%",
            maxHeight: "80%",
            padding: 16,
            paddingBottom: 0
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <ThemedText style={{ fontWeight: "bold", fontSize: 18, color: modalText }}>
              All Skate Spots
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={24} color={modalText} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", marginBottom: 8, gap: 8 }}>
            <TextInput
              placeholder="Search spots..."
              value={search}
              onChangeText={setSearch}
              style={{
                flex: 1,
                backgroundColor: modalBg,
                borderRadius: 8,
                padding: 8,
                color: modalText,
                minWidth: 0,
              }}
              placeholderTextColor={modalDesc}
              returnKeyType="search"
            />
            <TouchableOpacity
              onPress={() => setShowDifficulty((v) => !v)}
              style={{
                backgroundColor: modalBg,
                borderRadius: 8,
                padding: 8,
                borderWidth: 1,
                borderColor: modalBorder,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="options-outline" size={20} color={modalText} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowSort((v) => !v)}
              style={{
                backgroundColor: modalBg,
                borderRadius: 8,
                padding: 8,
                borderWidth: 1,
                borderColor: modalBorder,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="swap-vertical-outline" size={20} color={modalText} />
            </TouchableOpacity>
          </View>

          {/* Filter Section (Difficulty & Types) */}
          {showDifficulty && (
            <View style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 4 }}>
                {DIFFICULTIES.map(diff => (
                  <TouchableOpacity
                    key={diff}
                    onPress={() =>
                      setDifficulties(difficulties.includes(diff)
                        ? difficulties.filter(d => d !== diff)
                        : [...difficulties, diff])
                    }
                    style={{
                      backgroundColor: difficulties.includes(diff) ? typeBadgeBg : modalBg,
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      marginRight: 4,
                      marginBottom: 4,
                      borderWidth: 1,
                      borderColor: modalBorder,
                    }}
                  >
                    <ThemedText style={{ color: difficulties.includes(diff) ? typeBadgeText : modalText, fontSize: 13 }}>
                      {diff}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {SPOT_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() =>
                      setTypes(types.includes(type.id)
                        ? types.filter(t => t !== type.id)
                        : [...types, type.id])
                    }
                    style={{
                      backgroundColor: types.includes(type.id) ? typeBadgeBg : modalBg,
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      marginRight: 4,
                      marginBottom: 4,
                      borderWidth: 1,
                      borderColor: modalBorder,
                    }}
                  >
                    <ThemedText style={{ color: types.includes(type.id) ? typeBadgeText : modalText, fontSize: 13 }}>
                      {type.name}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Sort Section */}
          {showSort && (
            <View style={{ flexDirection: "row", marginBottom: 8, flexWrap: "wrap" }}>
              {["distance", "difficulty", "name", "rating", "date"].map(field => (
                <TouchableOpacity
                  key={field}
                  onPress={() => setSortField(field as any)}
                  style={{
                    backgroundColor: sortField === field ? typeBadgeBg : modalBg,
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    marginRight: 4,
                    marginBottom: 4,
                    borderWidth: 1,
                    borderColor: modalBorder,
                  }}
                >
                  <ThemedText style={{ color: sortField === field ? typeBadgeText : modalText, fontSize: 13 }}>
                    {field}
                  </ThemedText>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                style={{
                  backgroundColor: typeBadgeBg,
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  marginLeft: 4,
                  borderWidth: 1,
                  borderColor: modalBorder,
                }}
              >
                <ThemedText style={{ color: typeBadgeText, fontSize: 13 }}>
                  {sortDirection === "asc" ? "↑" : "↓"}
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          <FlatList
            data={filteredSpots}
            keyExtractor={(item) => item.id}
            initialNumToRender={20}
            maxToRenderPerBatch={30}
            windowSize={21}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  backgroundColor: modalBg,
                  borderRadius: 16,
                  marginBottom: 12,
                  padding: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.10,
                  shadowRadius: 4,
                  elevation: 2,
                  borderWidth: 1,
                  borderColor: modalBorder,
                  minHeight: 70, // reduced minHeight for compactness
                }}
                onPress={() => onSelectSpot(item)}
                activeOpacity={0.85}
              >
                {/* Only show image if it exists */}
                {item.images?.[0] && (
                  <Image
                    source={{ uri: item.images[0] }}
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#eee",
                      backgroundColor: "#222",
                    }}
                    contentFit="cover"
                    transition={300}
                  />
                )}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <ThemedText
                      style={{
                        fontWeight: "bold",
                        color: modalText,
                        fontSize: 15,
                        flexShrink: 1,
                        marginRight: 4,
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.name}
                    </ThemedText>
                    {typeof item.rating === "number" && (
                      <ThemedText style={{ fontSize: 13, color: "#f5a623", fontWeight: "bold" }}>
                        ⭐ {item.rating.toFixed(1)}
                      </ThemedText>
                    )}
                  </View>
                  <ThemedText
                    style={{
                      color: modalDesc,
                      fontSize: 12,
                      marginTop: 2,
                      marginBottom: 2,
                    }}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {item.description}
                  </ThemedText>
                  <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
                    {/* Difficulty Badge */}
                    {item.difficulty && (
                      <ThemedText
                        style={{
                          fontSize: 11,
                          color: "#fff",
                          backgroundColor:
                            item.difficulty === "Beginner"
                              ? "#4CAF50"
                              : item.difficulty === "Intermediate"
                              ? "#FFC107"
                              : item.difficulty === "Advanced"
                              ? "#F44336"
                              : "#888",
                          borderRadius: 5,
                          paddingHorizontal: 6,
                          paddingVertical: 1,
                          marginRight: 4,
                          fontWeight: "bold",
                          overflow: "hidden",
                        }}
                      >
                        {item.difficulty}
                      </ThemedText>
                    )}
                    {/* Spot Types */}
                    {Array.isArray(item.spotType) && item.spotType.slice(0, 2).map((type) => (
                      <ThemedText
                        key={type}
                        style={{
                          fontSize: 11,
                          color: typeBadgeText,
                          backgroundColor: typeBadgeBg,
                          borderRadius: 5,
                          paddingHorizontal: 6,
                          paddingVertical: 1,
                          marginRight: 2,
                          overflow: "hidden",
                        }}
                        numberOfLines={1}
                      >
                        {type}
                      </ThemedText>
                    ))}
                    {Array.isArray(item.spotType) && item.spotType.length > 2 && (
                      <ThemedText style={{ fontSize: 11, color: "#888" }}>
                        +{item.spotType.length - 2}
                      </ThemedText>
                    )}
                    {Array.isArray(item.skatedBy) && (
                      <ThemedText style={{ fontSize: 11, color: "#888", marginLeft: 4 }}>
                        🧍 {item.skatedBy.length}
                      </ThemedText>
                    )}
                    {userLocation && (
                      <ThemedText style={{ color: modalDesc, fontSize: 11, marginLeft: 4 }}>
                        {(getDistance(
                          userLocation.coords.latitude,
                          userLocation.coords.longitude,
                          item.latitude,
                          item.longitude
                        ) / 1609.34).toFixed(2)} mi
                      </ThemedText>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}