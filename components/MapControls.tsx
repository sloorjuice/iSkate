import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";

type MapControlsProps = {
  selectedSpot: any;
  previewImage?: string;
  description?: string;
  types?: string[];
  locationIndex: number;
  markersLength: number;
  onPrev: () => void;
  onNext: () => void;
  rating?: number;
  skatedBy?: any[]; // <-- Add skatedBy prop
};

export function MapControls({
  selectedSpot,
  locationIndex,
  markersLength,
  onPrev,
  onNext,
  previewImage,
  description,
  types,
  rating,
  skatedBy // <-- Add skatedBy prop
}: MapControlsProps) {
  const cardBg = useThemeColor({}, "card");
  const cardShadow = useThemeColor({}, "icon");
  const buttonBg = useThemeColor({}, "tint");
  const buttonText = useThemeColor({}, "background");
  const nameColor = useThemeColor({}, "text");
  const descriptionColor = useThemeColor({}, "description");
  const typeBadgeBg = useThemeColor({}, "tint"); // Use tint as badge background
  const typeBadgeText = useThemeColor({}, "background"); // Use background as badge text

  console.log("selectedSpot", selectedSpot);

  return (
    <>
      <View style={{ flex: 8 }} pointerEvents="none" />
      <View style={styles.outerContainer} pointerEvents="auto">
        <View style={[styles.card, { backgroundColor: cardBg, shadowColor: cardShadow }]}>
          <View style={styles.leftColumn}>
            {previewImage && (
              <Image
                source={{ uri: previewImage }}
                style={styles.previewImage}
                contentFit="cover"
                transition={300}
              />
            )}
          </View>
          <View style={styles.rightColumn}>
            {selectedSpot && (
              <>
                <View style={styles.nameRow}>
                  <ThemedText style={[styles.selectedSpotText, { color: nameColor }]} type="subtitle">
                    {selectedSpot.name.slice(0, 22)}{selectedSpot.name.length > 22 ? "..." : ""}
                  </ThemedText>
                  {typeof rating === "number" && (
                    <ThemedText style={styles.ratingText}>
                      ⭐ {rating.toFixed(1)}
                    </ThemedText>
                  )}
                </View>
                {(description || Array.isArray(skatedBy)) && (
                  <View style={styles.descriptionRow}>
                    {description && (
                      <ThemedText numberOfLines={2} style={[styles.descriptionText, { color: descriptionColor }]}>
                        {description.slice(0, 28)}{description.length > 28 ? "..." : ""}
                      </ThemedText>
                    )}
                    {Array.isArray(skatedBy) && (
                      <ThemedText style={styles.skatedByText}>
                        🧍 {skatedBy.length}
                      </ThemedText>
                    )}
                  </View>
                )}
                {types && Array.isArray(types) && types.length > 0 && (
                  <View style={styles.typesRow}>
                    {types.slice(0, 2).map((type, idx) => (
                      <ThemedText
                        key={type}
                        style={[
                          styles.typeBadge,
                          {
                            backgroundColor: typeBadgeBg,
                            color: typeBadgeText,
                          },
                        ]}
                      >
                        {type}
                      </ThemedText>
                    ))}
                    {types.length > 2 && (
                      <ThemedText style={styles.typeMore}>
                        +{types.length - 2}
                      </ThemedText>
                    )}
                  </View>
                )}
              </>
            )}
          </View>
          <View style={styles.buttonStack}>
            <Pressable
              style={({ pressed }) => [
                styles.smallButton,
                { backgroundColor: buttonBg, opacity: pressed || locationIndex <= 0 ? 0.6 : 1 },
              ]}
              onPress={onPrev}
              disabled={locationIndex <= 0}
            >
              <ThemedText style={[styles.buttonText, { color: buttonText }]}>Prev</ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.smallButton,
                { backgroundColor: buttonBg, opacity: pressed || locationIndex >= markersLength - 1 ? 0.6 : 1 },
              ]}
              onPress={onNext}
              disabled={locationIndex >= markersLength - 1}
            >
              <ThemedText style={[styles.buttonText, { color: buttonText }]}>Next</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    width: "100%",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: "#fff",
    gap: 16,
  },
  leftColumn: {
    justifyContent: "center",
    alignItems: "center",
  },
  rightColumn: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 0,
  },
  ratingColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginLeft: 6,
  },
  previewImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#222",
  },
  selectedSpotText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#222",
    marginBottom: 0,
  },
  ratingText: {
    fontSize: 14,
    color: "#f5a623",
    marginTop: 0,
    marginLeft: 6,
    marginBottom: 0,
  },
  descriptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 0,
    marginTop: 2,
  },
  skatedByText: {
    fontSize: 13,
    color: "#888",
    marginLeft: 8,
  },
  descriptionText: {
    color: "#666",
    fontSize: 13,
    marginBottom: 0,
  },
  typesRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 2,
  },
  typeBadge: {
    fontSize: 12,
    color: "#888",
    backgroundColor: "#eee",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeMore: {
    fontSize: 12,
    color: "#888",
  },
  buttonStack: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 10,
    marginLeft: 8,
  },
  smallButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 0.5,
  },
});