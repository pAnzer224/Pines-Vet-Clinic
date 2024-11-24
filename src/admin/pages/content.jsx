import React, { useState } from "react";
import {
  PawPrint,
  FileText,
  Image,
  ShoppingBag,
  Newspaper,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

// Mock data for different content types
const mockContent = {
  services: [
    {
      id: 1,
      title: "Veterinary Consultation",
      lastUpdated: "2 days ago",
      status: "Published",
    },
    {
      id: 2,
      title: "Pet Grooming Services",
      lastUpdated: "5 days ago",
      status: "Draft",
    },
  ],
  products: [
    {
      id: 1,
      title: "Premium Dog Food Collection",
      lastUpdated: "1 day ago",
      status: "Published",
    },
    {
      id: 2,
      title: "Interactive Cat Toys",
      lastUpdated: "3 days ago",
      status: "Published",
    },
  ],
  blog: [
    {
      id: 1,
      title: "Pet Care Tips for Summer",
      lastUpdated: "4 days ago",
      status: "Draft",
    },
    {
      id: 2,
      title: "Choosing the Right Pet Food",
      lastUpdated: "1 week ago",
      status: "Published",
    },
  ],
};

// Content card component
function ContentCard({ item }) {
  const statusColors = {
    Published: "bg-green3/50 text-green-800",
    Draft: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="bg-background p-4 rounded-lg border-2 border-green3/60 hover:border-primary/70 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-nunito-bold text-green2">{item.title}</h3>
          <p className="text-xs text-text/60 font-nunito-bold">
            Last updated: {item.lastUpdated}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-nunito-bold ${
            statusColors[item.status]
          }`}
        >
          {item.status}
        </span>
      </div>

      <div className="flex gap-2 mt-4">
        <button className="flex items-center px-3 py-1.5 text-sm font-nunito-bold text-green2 bg-green3/20 rounded-md hover:bg-green3/30">
          <Edit size={16} className="mr-1" />
          Edit
        </button>
        <button className="flex items-center px-3 py-1.5 text-sm font-nunito-bold text-red/90 bg-red-100 rounded-md hover:bg-red-200">
          <Trash2 size={16} className="mr-1" />
          Delete
        </button>
      </div>
    </div>
  );
}

function Content() {
  const [selectedSection, setSelectedSection] = useState("All Content");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const sections = ["All Content", "Services", "Products", "Blog Posts"];

  const contentTypeIcons = {
    services: FileText,
    products: ShoppingBag,
    blog: Newspaper,
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-nunito-bold text-green2">
          Content Management
        </h1>
        <div className="flex items-center mt-5">
          <PawPrint className="mr-2 text-primary size-7" />
          <p className="text-xl text-primary font-nunito-bold tracking-wide">
            Manage your website content and keep it up to date
          </p>
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {/* Dropdown Filter */}
        <div className="relative w-full sm:w-64 font-nunito-bold">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-4 py-2 bg-green3 text-text rounded-full hover:bg-green3/80 transition-colors border-[1.6px] border-green2 flex items-center justify-between"
          >
            <span>{selectedSection}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 border-[1.6px] border-green2 rounded-xl shadow-lg z-50">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => {
                    setSelectedSection(section);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-green3/20 text-text transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  {section}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Add New Content Button */}
        <button className="px-4 py-2 bg-green3 text-background rounded-full hover:bg-green3/80 transition-colors border-[1.6px] border-green2 flex items-center justify-center font-nunito-bold">
          <Plus size={20} className="mr-2" />
          Add New Content
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.entries(mockContent).map(([type, items]) =>
          items.map((item) => (
            <ContentCard key={`${type}-${item.id}`} item={item} />
          ))
        )}
      </div>
    </div>
  );
}

export default Content;
