import React, { useState } from "react";
import { Package, PlusCircle, Edit, Trash2, ChevronDown } from "lucide-react";

const initialProducts = [
  {
    id: 1,
    name: "Premium Dog Food",
    category: "Food & Treats",
    price: 100,
    stock: 50,
    status: "In Stock",
  },
  {
    id: 2,
    name: "Interactive Cat Wand",
    category: "Toys",
    price: 700,
    stock: 30,
    status: "Low Stock",
  },
  {
    id: 3,
    name: "Luxury Pet Bed",
    category: "Beds & Furniture",
    price: 1200,
    stock: 15,
    status: "Low Stock",
  },
];

function Shop() {
  const [products, setProducts] = useState(initialProducts);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const categories = [
    "All Categories",
    "Food & Treats",
    "Toys",
    "Beds & Furniture",
    "Accessories",
    "Health & Wellness",
  ];

  const filteredProducts = products.filter(
    (product) =>
      selectedCategory === "All Categories" ||
      product.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-nunito-bold text-green2">
          Shop Management
        </h1>
        <div className="flex items-center mt-5">
          <Package className="mr-2 text-primary size-7" />
          <p className="text-xl text-primary font-nunito-bold tracking-wide">
            Manage Your Product Inventory
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-full md:w-64">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-4 py-2 bg-green3 text-text rounded-full hover:bg-green3/80 transition-colors border-[1.6px] border-green2 flex items-center justify-between font-nunito"
          >
            <span>{selectedCategory}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 border-[1.6px] border-green2 rounded-xl shadow-lg z-50">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-green3/20 text-text transition-colors first:rounded-t-xl last:rounded-b-xl font-nunito"
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="flex items-center px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors font-nunito">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-background border-collapse">
          <thead>
            <tr className="bg-green3/20 font-nunito-bold text-primary">
              <th className="p-3 text-left">Product Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className="border-b border-green3/30 hover:bg-green3/10 font-nunito-bold-medium"
              >
                <td className="p-3 font-nunito-bold">{product.name}</td>
                <td className="p-3">{product.category}</td>
                <td className="p-3">₱{product.price}</td>
                <td className="p-3">{product.stock}</td>
                <td className="p-3">
                  <span
                    className={`
                    px-3 py-1 rounded-full text-xs font-nunito-bold
                    ${
                      product.status === "In Stock"
                        ? "bg-green3/50 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  `}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="p-3 flex justify-center space-x-2">
                  <button className="text-green2 hover:text-primary">
                    <Edit size={18} />
                  </button>
                  <button className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Shop;
