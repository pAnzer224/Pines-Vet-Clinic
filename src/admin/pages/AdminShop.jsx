import React, { useState, useRef, useEffect } from "react";
import {
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import StatusDropdown from "../../components/StatusDropdown";
import useFirestoreCrud from "../../hooks/useFirestoreCrud";
import { handleImageUpload } from "../components/image-utils";

function AdminShop() {
  const {
    items: products,
    createItem,
    updateItem,
    deleteItem,
  } = useFirestoreCrud("products");
  const {
    items: orders,
    updateItem: updateOrder,
    deleteItem: deleteOrder,
  } = useFirestoreCrud("orders", {
    orderBy: { field: "createdAt", direction: "desc" },
  });

  const modalRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    stock: "",
    image: "",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5; //change amount of max pages here

  const categories = [
    "All Categories",
    "Food & Treats",
    "Toys",
    "Beds & Furniture",
    "Accessories",
    "Health & Wellness",
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await handleImageUpload(file);
      setNewProduct((prev) => ({
        ...prev,
        image: base64,
      }));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      const productToAdd = {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        status: Number(newProduct.stock) > 20 ? "In Stock" : "Low Stock",
      };

      if (isEditMode && editingProduct) {
        await updateItem(editingProduct.id, productToAdd);
      } else {
        await createItem(productToAdd);
      }

      setIsModalOpen(false);
      setNewProduct({
        name: "",
        category: "",
        description: "",
        price: "",
        stock: "",
        image: "",
      });
      setIsEditMode(false);
      setEditingProduct(null);
    } catch (e) {
      console.error("Error adding/updating document: ", e);
    }
  };

  const handleEdit = (product) => {
    setIsEditMode(true);
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      image: product.image,
    });
    setIsModalOpen(true);
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      await updateOrder(orderId, { status: "Confirmed" });
    } catch (e) {
      console.error("Error confirming order: ", e);
    }
  };

  const handleReceiveOrder = async (orderId) => {
    try {
      await updateOrder(orderId, { status: "Received" });
    } catch (e) {
      console.error("Error marking order as received: ", e);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (
      window.confirm(
        `Are you sure you want to delete the product "${productName}"?`
      )
    ) {
      try {
        await deleteItem(productId);
        console.log(`Product "${productName}" successfully deleted.`);
      } catch (e) {
        console.error("Error deleting product: ", e);
      }
    }
  };

  const handleDeleteOrder = async (orderId, productName) => {
    if (
      window.confirm(
        `Are you sure you want to delete this order for "${productName}"?`
      )
    ) {
      try {
        await deleteOrder(orderId);
        console.log(`Order for "${productName}" successfully deleted.`);
      } catch (e) {
        console.error("Error deleting order: ", e);
      }
    }
  };

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;

  const sortedOrders = [...orders].sort((a, b) => {
    const statusOrder = {
      Pending: 0,
      Cancelled: 0,
      Confirmed: 1,
      Received: 2,
    };

    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }

    return b.createdAt.seconds - a.createdAt.seconds;
  });

  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const filteredProducts = products.filter(
    (product) =>
      selectedCategory === "All Categories" ||
      product.category === selectedCategory
  );

  return (
    <div className="space-y-6 mt-14">
      <div className="flex justify-between items-center gap-4">
        <StatusDropdown
          statusOptions={categories}
          selectedStatus={selectedCategory}
          onStatusChange={setSelectedCategory}
        />

        <button
          onClick={() => {
            setIsEditMode(false);
            setEditingProduct(null);
            setNewProduct({
              name: "",
              category: "",
              description: "",
              price: "",
              stock: "",
              image: "",
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center whitespace-nowrap px-4 py-2 bg-green2 text-background rounded-full hover:bg-green2/80 transition-colors font-nunito text-sm md:text-base"
        >
          <PlusCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
          Add Product
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div
            ref={modalRef}
            className="bg-background p-6 sm:p-8 rounded-2xl w-full max-w-2xl border-[1.6px] border-green2 font-nunito-semibold tracking-wide"
          >
            <h2 className="text-xl font-nunito-bold text-green2 mb-6">
              {isEditMode ? "Edit Product" : "Add New Product"}
            </h2>

            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-text/80 mb-1.5">
                      Product Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter product name"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      className="w-full p-2.5 px-4 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent text-sm md:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-text/80 mb-1.5">
                      Category
                    </label>
                    <StatusDropdown
                      statusOptions={categories.slice(1)}
                      selectedStatus={newProduct.category || "Select Category"}
                      onStatusChange={(category) =>
                        setNewProduct({ ...newProduct, category })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-text/80 mb-1.5">Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 font-nunito-bold text-primary/80 text-sm md:text-base">
                        ₱
                      </span>
                      <input
                        type="text"
                        placeholder="Enter price"
                        value={newProduct.price}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, "");
                          setNewProduct({ ...newProduct, price: value });
                        }}
                        className="w-full p-2.5 pl-7 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent text-sm md:text-base"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-text/80 mb-1.5">Stock</label>
                    <input
                      type="text"
                      placeholder="Enter stock quantity"
                      value={newProduct.stock}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        setNewProduct({ ...newProduct, stock: value });
                      }}
                      className="w-full p-2.5 px-4 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent text-sm md:text-base"
                      required
                    />
                  </div>
                </div>

                <div className="w-[1px] bg-green2/20"></div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-text/80 mb-1.5">
                      Product Image
                    </label>
                    <label className="block w-full p-2.5 px-4 border-[1.6px] border-green2 rounded-lg cursor-pointer hover:bg-green3/20 transition-colors">
                      <div className="flex items-center justify-center gap-2">
                        <Upload className="w-5 h-5 text-green2" />
                        <span className="text-green2">
                          {newProduct.image ? "Change Image" : "Upload Image"}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    {newProduct.image && (
                      <div className="mt-2 relative aspect-video rounded-lg overflow-hidden">
                        <img
                          src={newProduct.image}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-text/80 mb-1.5">
                      Description
                    </label>
                    <textarea
                      placeholder="Enter product description"
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-2.5 px-4 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent text-sm md:text-base"
                      required
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 ">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors font-nunito text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green2 text-background rounded-full hover:bg-green2/80 transition-colors font-nunito-semibold text-sm md:text-base"
                >
                  {isEditMode ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border-[1.6px] border-green2">
        <table className="w-full bg-background border-collapse">
          <thead>
            <tr className="bg-green3/20 font-nunito-bold text-text">
              <th className="p-3 text-left text-base">Product Name</th>
              <th className="hidden md:table-cell p-3 text-left text-base">
                Category
              </th>
              <th className="hidden md:table-cell p-3 text-left text-base">
                Description
              </th>
              <th className="p-3 text-left text-base">Price/Stock</th>
              <th className="hidden md:table-cell p-3 text-left text-base">
                Stock
              </th>
              <th className="p-3 text-left text-base">Status</th>
              <th className="p-3 text-center text-base">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className="border-b border-green3/30 hover:bg-green3/10 font-nunito-semibold text-text/80"
              >
                <td className="p-3 font-nunito-bold text-base">
                  {product.name}
                </td>
                <td className="hidden md:table-cell p-3 text-base">
                  {product.category}
                </td>
                <td className="hidden md:table-cell p-3 text-base">
                  {product.description}
                </td>
                <td className="p-3 text-base">
                  <div className="flex flex-col">
                    <span>₱{product.price}</span>
                    <span
                      className={`md:hidden text-base ${
                        product.stock <= 20
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {product.stock} left
                    </span>
                  </div>
                </td>
                <td className="hidden md:table-cell p-3 text-base">
                  {product.stock}
                </td>
                <td className="p-3">
                  <span
                    className={`
                    inline-flex whitespace-nowrap px-3 py-1 rounded-full text-base font-nunito-bold
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
                <td className="p-3">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-green2 hover:text-green2/80 transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteProduct(product.id, product.name)
                      }
                      className="text-red/80 hover:text-red transition-colors"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-nunito-bold text-green2 mb-4">
          Order History
        </h2>
        <span className="px-2.5 py-1 bg-green3/30 text-green2 rounded-full text-sm font-nunito-bold border border-green2">
          {orders.length} Orders
        </span>
        <div className="grid gap-3 pt-5">
          {currentOrders.map((order) => (
            <div
              key={order.id}
              className="bg-background/95 p-4 rounded-lg border border-green2/60 shadow-sm hover:shadow-[0_0_0_1px] hover:shadow-green2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-nunito-bold text-primary">
                    {order.userName}
                  </h3>
                  <p className="text-sm">
                    <span className="font-nunito-semibold text-green2">
                      Product:
                    </span>{" "}
                    <span className="text-text/80 font-nunito-semibold">
                      {order.productName}
                    </span>
                  </p>
                  <p className="text-primary font-nunito-semibold mt-1 text-base">
                    ₱{order.price * order.quantity}
                  </p>
                  <div className="mt-1">
                    <span className="text-sm text-text/60 font-nunito-semibold">
                      Order Date:{" "}
                      {order.createdAt
                        ? new Date(
                            order.createdAt.seconds * 1000
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Date not available"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {order.status !== "Confirmed" &&
                    order.status !== "Received" && (
                      <button
                        onClick={() => handleConfirmOrder(order.id)}
                        className="px-3 py-1.5 bg-green3 text-text rounded-full hover:bg-green3/80 transition-colors border border-green2 flex items-center gap-1.5 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Confirm
                      </button>
                    )}
                  {order.status === "Confirmed" &&
                    order.status !== "Received" && (
                      <button
                        onClick={() => handleReceiveOrder(order.id)}
                        className="px-3 py-1.5 bg-green3 text-text rounded-full hover:bg-green3/80 transition-colors border border-green2 flex items-center gap-1.5 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Received
                      </button>
                    )}
                  {order.status === "Received" && (
                    <span className="px-3 py-1.5 bg-green3/30 text-text rounded-full border border-green2 flex items-center gap-1.5 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Completed
                    </span>
                  )}
                  <button
                    onClick={() =>
                      handleDeleteOrder(order.id, order.productName)
                    }
                    className="px-3 py-1.5 bg-red/10 text-red rounded-full hover:bg-red/20 transition-colors border border-red/60 flex items-center gap-1.5 text-sm"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 rounded-md hover:bg-green3/10 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-5 h-5 text-green2" />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? "bg-green3/20 text-green2"
                        : "hover:bg-green3/10 text-text"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md hover:bg-green3/10 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-5 h-5 text-green2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminShop;
