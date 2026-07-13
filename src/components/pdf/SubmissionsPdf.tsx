import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

type Submission = {
  id: string;
  formSlug: string;
  data: Record<string, unknown>;
  createdAt: Date;
};

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: "Helvetica" },
  title: {
    fontSize: 18,
    marginBottom: 16,
    color: "#111827",
    fontFamily: "Helvetica-Bold",
  },
  table: { display: "flex", width: "100%", borderWidth: 1, borderColor: "#e5e7eb" },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#111827",
  },
  headerCell: {
    flex: 1,
    padding: 6,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  rowAlt: {
    backgroundColor: "#f9fafb",
  },
  cell: {
    flex: 1,
    padding: 6,
    color: "#374151",
    fontSize: 9,
  },
});

export default function SubmissionsPdf({
  submissions,
  keys,
}: {
  submissions: Submission[];
  keys: string[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Contact Submissions</Text>

        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={styles.headerCell}>Submitted</Text>
            <Text style={styles.headerCell}>Form</Text>
            {keys.map((k) => (
              <Text key={k} style={styles.headerCell}>
                {k}
              </Text>
            ))}
          </View>

          {submissions.map((s, i) => (
            <View
              key={s.id}
              style={i % 2 === 1 ? { ...styles.row, ...styles.rowAlt } : styles.row}
            >
              <Text style={styles.cell}>{new Date(s.createdAt).toLocaleString()}</Text>
              <Text style={styles.cell}>{s.formSlug}</Text>
              {keys.map((k) => (
                <Text key={k} style={styles.cell}>
                  {String(s.data[k] ?? "")}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}