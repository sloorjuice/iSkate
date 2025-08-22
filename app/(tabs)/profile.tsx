import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Button, View } from "react-native";

export default function Profile() {
  const { user, logout } = useAuth();
  const bgColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: bgColor,
      }}
    >
      <ThemedText style={{ fontSize: 20, marginBottom: 16, color: textColor }}>
        {user?.displayName
          ? `Welcome, ${user.displayName}!`
          : `Welcome, ${user?.email}!`}
      </ThemedText>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
