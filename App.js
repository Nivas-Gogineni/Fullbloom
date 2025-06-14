import "react-native-gesture-handler";
import MapScreen from "./MapScreen";

import AIResponseBubble from "./AIResponseBubble";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthScreen from "./AuthScreen";
import ResourcesScreen from "./ResourceScreen";
import { GROQ_API_KEY } from "@env";
const Stack = createNativeStackNavigator();
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Pressable,
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const bgImage = require("./assets/fullbloom-logo.png");
const { height } = Dimensions.get("window");
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = "home-outline";
          if (route.name === "Home") iconName = "home-outline";
          else if (route.name === "AI Coach") iconName = "bulb-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#7e57c2",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
      <Tab.Screen name="AI Coach" component={AICoachScreen} />
      <Tab.Screen name="Clinics Nearby" component={MapScreen} />
    </Tab.Navigator>
  );
}

function HomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.homeScroll}>
        <View style={styles.flexContainer}>
          <ImageBackground
            source={bgImage}
            style={styles.background}
            resizeMode="contain"
          />
        </View>

        <View style={styles.missionWrapper}>
          <View style={styles.missionBox}>
            <Text style={styles.heading}>Our Mission</Text>
            <Text style={styles.content}>
              FullBloom empowers expectant mothers with:
            </Text>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>
                • Evidence-based educational resources
              </Text>
              <Text style={styles.bullet}>
                • Personalized risk insights using AI
              </Text>
              <Text style={styles.bullet}>• Symptom tracking and analysis</Text>
              <Text style={styles.bullet}>
                • Access to expert care recommendations
              </Text>
            </View>

            <View style={styles.fabContainer}>
              <Animated.View style={{ opacity: fadeAnim }}>
                <Pressable
                  style={styles.fab}
                  onPress={() => navigation.navigate("Resources")}
                >
                  <Text style={styles.fabText}>Explore Now</Text>
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function AICoachScreen() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const loadChats = async () => {
      const stored = await AsyncStorage.getItem("chatHistory");
      if (stored) setChatHistory(JSON.parse(stored));
    };
    loadChats();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);

  async function askAI() {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input, time: Date.now() };
    setChatHistory((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer " + GROQ_API_KEY,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 512,
            messages: [
              {
                role: "system",
                content:
                  "You are a compassionate and knowledgeable AI coach dedicated to supporting pregnant mothers, especially those at risk of preterm birth. Your mission is to provide clear, trustworthy, and empathetic guidance to promote healthy pregnancies and reduce anxiety. You deliver personalized advice on prenatal health, nutrition, warning signs, emotional well-being, and lifestyle choices—always backed by medical best practices and sensitivity to each mother's unique situation. Your tone is warm, encouraging, and non-judgmental, helping mothers feel empowered and cared for during every stage of their journey. Provide the sources of the information or citations to the mother",
              },
              ...chatHistory.map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
              { role: "user", content: input },
            ],
          }),
        }
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const aiMessage = {
          role: "assistant",
          content: data.choices[0].message.content,
          time: Date.now(),
        };
        setChatHistory((prev) => [...prev, aiMessage]);
        setResponse(aiMessage.content);
      } else {
        setError("Unexpected response format from AI");
      }
    } catch (e) {
      console.error("AI Error:", e);
      setError("Error connecting to AI: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function clearChatHistory() {
    await AsyncStorage.removeItem("chatHistory");
    setChatHistory([]);
    setResponse("");
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={styles.heading}>Ask Luma, your AI Coach</Text>

      <ScrollView
        style={{ maxHeight: "55%", marginVertical: 10 }}
        contentContainerStyle={{ paddingBottom: 10 }}
        showsVerticalScrollIndicator={true}
      >
        {chatHistory.map((msg, index) => (
          <View key={index} style={{ marginVertical: 6 }}>
            {msg.role === "user" ? (
              <View
                style={{
                  alignSelf: "flex-end",
                  backgroundColor: "#e8eaf6",
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontWeight: "bold", marginBottom: 4 }}>You</Text>
                <Text>{msg.content}</Text>
              </View>
            ) : (
              <AIResponseBubble text={msg.content} />
            )}
          </View>
        ))}
      </ScrollView>

      <TextInput
        
        placeholder="Type your question..."
        style={styles.input}
        value={input}
        onChangeText={setInput}
        multiline
      />
      <Pressable style={styles.fab} onPress={askAI}>
        <Text style={styles.fabText}>Ask</Text>
      </Pressable>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#7e57c2"
          style={{ marginTop: 20 }}
        />
      )}
      {error !== "" && (
        <View
          style={{
            marginTop: 16,
            padding: 10,
            backgroundColor: "#ffebee",
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#c62828" }}>{error}</Text>
        </View>
      )}

      <Pressable onPress={clearChatHistory} style={{ marginTop: 16 }}>
        <Text
          style={{
            textAlign: "center",
            color: "#888",
            textDecorationLine: "underline",
          }}
        >
          Clear Chat History
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  homeScroll: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: 100,
  },
  flexContainer: {
    flexShrink: 1,
    alignItems: "center",
  },
  background: {
    width: "100%",
    height: height * 0.4,
    justifyContent: "center",
    alignItems: "center",
  },
  missionBox: {
    backgroundColor: "#f7f0fa",
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
    color: "#5e35b1",
    textAlign: "center",
  },
  content: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  bulletContainer: {
    paddingHorizontal: 10,
    marginTop: 10,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 2,
    color: "#444",
  },
  fabContainer: {
    marginTop: 30,
    alignSelf: "center",
  },
  fab: {
    backgroundColor: "#7e57c2",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 50,
    elevation: 5,
    marginTop: 12,
  },
  fabText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    borderColor: "#aaa",
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginTop: 20,
  },
  missionWrapper: {
    backgroundColor: "#f7f0fa",
    flexGrow: 1,
    paddingBottom: 50,
  },
});
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
