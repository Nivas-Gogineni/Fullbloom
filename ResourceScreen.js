import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Pressable,
} from "react-native";

const resources = [
  {
    title: "Nutrition During Pregnancy",
    link: "https://www.acog.org/womens-health/faqs/nutrition-during-pregnancy",
    description: "Official guidance from the American College of Obstetricians and Gynecologists.",
  },
  {
    title: "Signs of Preterm Labor",
    link: "https://www.marchofdimes.org/find-support/topics/pregnancy/preterm-labor-and-premature-birth",
    description: "Learn the warning signs and what actions to take.",
  },
  {
    title: "Pregnancy Week-by-Week",
    link: "https://www.babycenter.com/pregnancy-week-by-week",
    description: "Track your baby's development and your changing body.",
  },
  {
    title: "Safe Exercise for Moms",
    link: "https://www.mayo clinic.org/healthy-lifestyle/pregnancy-week-by-week/in-depth/pregnancy/art-20046896",
    description: "What exercises are safe and how to stay active.",
  },
  {
    title: "Mental Health During Pregnancy",
    link: "https://www.postpartum.net/learn-more/pregnancy/",
    description: "Recognizing and managing anxiety, depression, and stress.",
  },
];

export default function ResourcesScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Helpful Resources</Text>
      {resources.map((res, index) => (
        <Pressable
          key={index}
          onPress={() => Linking.openURL(res.link)}
          style={styles.card}
        >
          <Text style={styles.title}>{res.title}</Text>
          <Text style={styles.description}>{res.description}</Text>
          <Text style={styles.link}>Tap to read →</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 60,   // ← moved everything down by 60px
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#5e35b1",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#f3e5f5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4a148c",
  },
  description: {
    fontSize: 14,
    marginVertical: 6,
    color: "#333",
  },
  link: {
    fontSize: 14,
    color: "#7e57c2",
    fontWeight: "600",
  },
});
