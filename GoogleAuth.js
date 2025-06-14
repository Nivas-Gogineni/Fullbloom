
import React, { useEffect } from "react";
import { Button, Alert, View, ActivityIndicator } from "react-native";

import * as WebBrowser   from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

import { supabase } from "./supabaseClient.js";

WebBrowser.maybeCompleteAuthSession();


export default function AuthScreen({ navigation }) {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "fullbloom",          
    useProxy: true,            
  });


  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUri },
    });

    if (error) {
      Alert.alert("Login error", error.message);
    }
  };

  
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        
        navigation.replace("MapScreen"); 
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Button
        title="Sign in with Google"
        onPress={signInWithGoogle}
      />
    </View>
  );
}
