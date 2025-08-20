import { useAuth } from "@/contexts/AuthContext";
import { Button, Text, View } from "react-native";

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 20, marginBottom: 16 }}>
        {user?.displayName
          ? `Welcome, ${user.displayName}!`
          : `Welcome, ${user?.email}!`}
      </Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
