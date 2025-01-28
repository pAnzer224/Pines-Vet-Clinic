import React from "react";
import { Download } from "lucide-react";
import Papa from "papaparse";

const ExportButton = ({ metrics, selectedMonth }) => {
  const generateCSV = () => {
    // Filter data based on selected month
    const filterByMonth = (data) => {
      if (selectedMonth === "all") return data;
      const targetDate = new Date(selectedMonth);
      return data.filter((item) => {
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
        const itemMonth = monthNames.indexOf(item.month);
        return itemMonth === targetDate.getMonth();
      });
    };

    // Prepare data for CSV
    const csvData = [];

    // Add header row with clinic name
    csvData.push(["Pines Vet Clinic"]);
    csvData.push([]); // Empty row for spacing

    // Add period
    const period =
      selectedMonth === "all"
        ? "All Time"
        : new Date(selectedMonth).toLocaleString("default", {
            month: "long",
            year: "numeric",
          });
    csvData.push(["Period:", period]);
    csvData.push([]); // Empty row for spacing

    // Add summary data
    csvData.push(["Summary"]);
    csvData.push([
      "Total Revenue",
      `₱${metrics.totalRevenue.toLocaleString()}`,
    ]);
    csvData.push(["Total Customers", metrics.totalCustomers]);
    csvData.push(["Total Products", metrics.totalProducts]);
    csvData.push([]); // Empty row for spacing

    // Add service breakdown
    csvData.push(["Service Breakdown"]);
    metrics.serviceBreakdown.forEach((service) => {
      csvData.push([service.name, `${service.value}%`]);
    });
    csvData.push([]); // Empty row for spacing

    // Add monthly revenue
    csvData.push(["Monthly Revenue"]);
    csvData.push(["Month", "Revenue"]);
    filterByMonth(metrics.monthlyRevenue).forEach((item) => {
      csvData.push([item.month, `₱${item.revenue.toLocaleString()}`]);
    });
    csvData.push([]); // Empty row for spacing

    // Add monthly products
    csvData.push(["Monthly Products"]);
    csvData.push(["Month", "Products"]);
    filterByMonth(metrics.monthlyProducts).forEach((item) => {
      csvData.push([item.month, item.products]);
    });

    // Convert to CSV string
    const csvContent = Papa.unparse(csvData);

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `pines-vet-clinic-report-${
        selectedMonth === "all" ? "all-time" : selectedMonth
      }.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative group">
      <button
        onClick={generateCSV}
        className="flex items-center text-primary hover:text-green2 transition-colors"
      >
        <Download size={19} />
      </button>

      <div className="absolute right-0 top-full mt-1 px-2 py-1 bg-green2/80 text-background/90 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-nunito-semibold tracking-wide">
        Export as CSV
      </div>
    </div>
  );
};

export default ExportButton;
