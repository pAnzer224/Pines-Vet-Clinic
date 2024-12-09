import {
  Users,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Clock,
  Package,
  UserPlus,
  AlertCircle,
  PawPrint,
} from "lucide-react";

// Sample data to displayy
const mockData = {
  metrics: [
    {
      title: "Total Customers",
      value: "1,234",
      change: "+12%",
      icon: Users,
    },
    {
      title: "Appointments Today",
      value: "28",
      change: "+5%",
      icon: Calendar,
    },
    {
      title: "Shop Orders",
      value: "156",
      change: "+8%",
      icon: ShoppingBag,
    },
    {
      title: "Revenue",
      value: "₱12,345",
      change: "+15%",
      icon: TrendingUp,
    },
  ],
  recentActivity: [
    {
      id: 1,
      type: "appointment",
      title: "New Grooming Appointment",
      description: "Max (Golden Retriever) - Basic Grooming",
      time: "10 minutes ago",
      icon: Clock,
    },
    {
      id: 2,
      type: "order",
      title: "New Shop Order #1234",
      description: "Dog Food - Premium Mix (2 items)",
      time: "25 minutes ago",
      icon: Package,
    },
    {
      id: 3,
      type: "customer",
      title: "New Customer Registration",
      description: "Sarah Johnson joined Highland PetVibes",
      time: "1 hour ago",
      icon: UserPlus,
    },
    {
      id: 4,
      type: "alert",
      title: "Low Stock Alert",
      description: "Premium Cat Food running low",
      time: "2 hours ago",
      icon: AlertCircle,
    },
  ],
};

// Component to display a metric card on the dashboard
function MetricCard({ title, value, change, icon: Icon }) {
  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <div className="flex items-center justify-between">
        <div>
          {/* Metric title */}
          <p className="text-sm text-green2 font-nunito-medium">{title}</p>
          {/* Metric value */}
          <p className="text-2xl font-nunito-bold mt-2 text-primary">{value}</p>
          {/* {Change} from last month */}
          <p className="text-sm text-primary mt-1 font-nunito-medium">
            {change} from last month
          </p>
        </div>
        <div className="p-3 rounded-full bg-green3/10 text-green2">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

// Display recent activities
function ActivityItem({ title, description, time, icon: Icon }) {
  return (
    <div className="flex items-start space-x-4 p-5 hover:bg-green3/10 rounded-lg">
      <div className="bg-green3/10 p-2 rounded-full text-green2">
        <Icon size={20} />
      </div>
      {/* Activity details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-nunito-bold text-green2">{title}</p>
        <p className="text-sm font-nunito-medium text-primary/50">
          {description}
        </p>
        <p className="text-xs font-nunito-bold text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
}

//  main Dashboard component
function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-nunito-bold text-green2">Dashboard</h1>
        {/* Welcome message */}
        <div className="flex items-center mt-5">
          <PawPrint className="mr-2 text-primary size-7" />
          <p className="text-xl text-primary font-nunito-bold tracking-wide">
            Welcome back! Here's what's happening with your pet store today.
          </p>
        </div>
      </div>

      {/* Section for displaying metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Map through the mock data to display metric cards */}
        {mockData.metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Section for recent activity */}
      <div className="bg-background rounded-lg shadow-sm border-2 border-green3/60">
        <div className="border-b border-green3/60 px-6 py-4">
          {/* Title for recent activity */}
          <h2 className="text-lg font-nunito-bold text-green2">
            Recent Activity
          </h2>
        </div>
        <div className="divide-y divide-green3/50">
          {/* Sample map that displays data */}
          {mockData.recentActivity.map((activity) => (
            <ActivityItem key={activity.id} {...activity} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
