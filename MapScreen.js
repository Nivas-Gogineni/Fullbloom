
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { FOURSQUARE_API_KEY } from "@env";
const CATEGORY_IDS = "15046"; // Women’s health clinic, etc.
const CLINIC_PIN_COLOR = "purple";

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [clinics, setClinics] = useState([]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location permission denied.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      if (!loc?.coords) {
        Alert.alert("Could not retrieve location.");
        return;
      }

      const { latitude, longitude } = loc.coords;
      setLocation(loc.coords);

      const url =
        `https://api.foursquare.com/v3/places/search` +
        `?ll=${latitude},${longitude}` +
        `&radius=5000` +
        `&categories=${CATEGORY_IDS}` +
        `&limit=30`;

      try {
        const res = await fetch(url, {
          headers: {
            Accept: "application/json",
            Authorization: FOURSQUARE_API_KEY,
          },
        });
        const data = await res.json();
        if (Array.isArray(data.results) && data.results.length) {
          setClinics(data.results);
        } else {
          Alert.alert("No clinics found nearby.");
        }
      } catch (e) {
        console.error("Foursquare error:", e);
        Alert.alert("Failed to load clinics.");
      }
    })();
  }, []);

  
  const clinicMarkers = [];
  for (let i = 0; i < clinics.length; i++) {
    const clinic = clinics[i];
    const lat = clinic.geocodes?.main?.latitude;
    const lng = clinic.geocodes?.main?.longitude;

    if (typeof lat === "number" && typeof lng === "number") {
      clinicMarkers.push(
        <Marker
          key={clinic.fsq_id || i}
          coordinate={{ latitude: lat, longitude: lng }}
          title={clinic.name}
          description={clinic.location?.formatted_address}
          pinColor={CLINIC_PIN_COLOR}
        />
      );
    }
  }

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation
        >
          {/* “You are here” */}
          <Marker
            coordinate={location}
            title="You are here"
            pinColor="blue"
          />

          {/*all clinic markers*/}
          {clinicMarkers}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
});
