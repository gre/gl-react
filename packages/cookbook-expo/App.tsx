import React, { useState, useMemo } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  ScrollView,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { examples, ExampleEntry } from "./examples";

type CategoryGroup = { category: string; items: ExampleEntry[] };

function groupByCategory(list: ExampleEntry[]): CategoryGroup[] {
  const map = new Map<string, ExampleEntry[]>();
  for (const ex of list) {
    if (!map.has(ex.category)) map.set(ex.category, []);
    map.get(ex.category)!.push(ex);
  }
  return Array.from(map.entries()).map(([category, items]) => ({
    category,
    items,
  }));
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppInner />
    </SafeAreaProvider>
  );
}

function AppInner() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const groups = useMemo(() => groupByCategory(examples), []);
  const selected = selectedId
    ? examples.find((e) => e.id === selectedId)
    : null;

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      {selected ? (
        <ExampleDetail
          example={selected}
          onBack={() => setSelectedId(null)}
        />
      ) : (
        <ExamplesList groups={groups} onSelect={setSelectedId} />
      )}
    </SafeAreaView>
  );
}

function ExamplesList({
  groups,
  onSelect,
}: {
  groups: CategoryGroup[];
  onSelect: (id: string) => void;
}) {
  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Text style={styles.title}>gl-react cookbook</Text>
        <Text style={styles.subtitle}>
          {examples.length} examples on Expo SDK 54
        </Text>
      </View>
      <FlatList
        data={groups}
        keyExtractor={(g) => g.category}
        renderItem={({ item: group }) => (
          <View>
            <Text style={styles.sectionHeader}>{group.category}</Text>
            {group.items.map((ex) => (
              <Pressable
                key={ex.id}
                onPress={() => onSelect(ex.id)}
                style={({ pressed }) => [
                  styles.row,
                  pressed && styles.rowPressed,
                ]}
              >
                <Text style={styles.rowTitle}>{ex.title}</Text>
                <Text style={styles.rowDesc} numberOfLines={2}>
                  {ex.description}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      />
    </View>
  );
}

function ExampleDetail({
  example,
  onBack,
}: {
  example: ExampleEntry;
  onBack: () => void;
}) {
  const Component = example.Component;
  return (
    <View style={styles.flex}>
      <View style={styles.detailHeader}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <View style={styles.detailTitleBlock}>
          <Text style={styles.detailTitle}>{example.title}</Text>
          <Text style={styles.detailDesc}>{example.description}</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.detailContent}
        bounces={false}
      >
        <Component />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fafafa" },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: { fontSize: 22, fontWeight: "700", color: "#111" },
  subtitle: { fontSize: 12, color: "#666", marginTop: 2 },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  rowPressed: { backgroundColor: "#eef" },
  rowTitle: { fontSize: 15, color: "#111", fontWeight: "500" },
  rowDesc: { fontSize: 12, color: "#666", marginTop: 2 },
  detailHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: { paddingVertical: 4, paddingRight: 12 },
  backText: { fontSize: 16, color: "#4f46e5" },
  detailTitleBlock: { flex: 1 },
  detailTitle: { fontSize: 17, fontWeight: "700", color: "#111" },
  detailDesc: { fontSize: 12, color: "#666", marginTop: 2 },
  detailContent: { padding: 16, alignItems: "center", flexGrow: 1 },
});
