import { Platform } from "react-native";

const LOCAL_HOST = "localhost";
const ANDROID_EMU = "10.0.2.2";

export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android" ? `http://${ANDROID_EMU}:3001` : `http://${LOCAL_HOST}:3001`);

export const DEMO_USER_ID = "demo-user";
