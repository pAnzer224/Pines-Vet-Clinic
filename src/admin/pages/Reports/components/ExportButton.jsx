import React from "react";
import { Download } from "lucide-react";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  table: {
    display: "table",
    width: "100%",
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: "#000",
  },
  tableCell: {
    padding: 5,
    flex: 1,
  },
});

const filterDataByMonth = (data, selectedMonth) => {
  if (selectedMonth === "all") return data;
  const targetDate = new Date(selectedMonth);
  return data.filter((item) => {
    const itemMonth = monthNames.indexOf(item.month);
    const currentMonth = targetDate.getMonth();
    return itemMonth === currentMonth;
  });
};

const ReportDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Business Report</Text>

      <View style={styles.section}>
        <Text style={styles.header}>Summary</Text>
        <Text style={styles.text}>Period: {data.period}</Text>
        <Text style={styles.text}>
          Total Revenue: ₱{data.totalRevenue.toLocaleString()}
        </Text>
        <Text style={styles.text}>Total Customers: {data.totalCustomers}</Text>
        <Text style={styles.text}>Products Sold: {data.totalProducts}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Service Breakdown</Text>
        {data.serviceBreakdown.map((service, i) => (
          <Text key={i} style={styles.text}>
            {service.name}: {service.value}%
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Monthly Revenue</Text>
        {data.monthlyRevenue.map((item, i) => (
          <Text key={i} style={styles.text}>
            {item.month}: ₱{item.revenue.toLocaleString()}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Monthly Products</Text>
        {data.monthlyProducts.map((item, i) => (
          <Text key={i} style={styles.text}>
            {item.month}: {item.products} products
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Monthly Services</Text>
        {data.monthlyServices.map((item, i) => (
          <Text key={i} style={styles.text}>
            {item.month}:
            {Object.entries(item)
              .filter(([key]) => key !== "month")
              .map(([service, count]) => ` ${service}: ${count}`)
              .join(", ")}
          </Text>
        ))}
      </View>
    </Page>
  </Document>
);

const ExportButton = ({ metrics, selectedMonth }) => {
  const reportData = {
    period:
      selectedMonth === "all"
        ? "All Time"
        : new Date(selectedMonth).toLocaleString("default", {
            month: "long",
            year: "numeric",
          }),
    totalRevenue: metrics.totalRevenue,
    totalCustomers: metrics.totalCustomers,
    totalProducts: metrics.totalProducts,
    serviceBreakdown: metrics.serviceBreakdown,
    monthlyRevenue: filterDataByMonth(metrics.monthlyRevenue, selectedMonth),
    monthlyProducts: filterDataByMonth(metrics.monthlyProducts, selectedMonth),
    monthlyServices: filterDataByMonth(metrics.monthlyServices, selectedMonth),
  };

  return (
    <div className="relative group">
      <PDFDownloadLink
        document={<ReportDocument data={reportData} />}
        fileName={`business-report-${
          selectedMonth === "all" ? "all-time" : selectedMonth
        }.pdf`}
        className="flex items-center text-primary hover:text-green2 transition-colors"
      >
        <Download size={19} />
      </PDFDownloadLink>

      <div className="absolute right-0 top-full mt-1 px-2 py-1 bg-green2/80 text-background/90 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-nunito-semibold tracking-wide">
        Export as PDF
      </div>
    </div>
  );
};

export default ExportButton;
