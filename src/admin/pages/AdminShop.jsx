import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, CheckCircle } from "lucide-react";
import { db } from "../../firebase-config";
import StatusDropdown from "../../components/StatusDropdown";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
} from "firebase/firestore";

function importAllImages(requireContext) {
  return requireContext.keys().map(requireContext);
}

function AdminShop() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    stock: "",
    image: "/images/shop-images/default-image.jpg",
  });

  const shopImages = importAllImages(
    require.context("/public/images/shop-images/", false, /\.(png|jpe?g|svg)$/)
  );

  const categories = [
    "All Categories",
    "Food & Treats",
    "Toys",
    "Beds & Furniture",
    "Accessories",
    "Health & Wellness",
  ];

  useEffect(() => {
    const productsCollectionRef = collection(db, "products");
    const ordersCollectionRef = collection(db, "orders");

    const unsubscribeProducts = onSnapshot(
      query(productsCollectionRef),
      (snapshot) => {
        const fetchedProducts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(fetchedProducts);
      },
      (error) => {
        console.error("Error fetching products: ", error);
      }
    );

    const unsubscribeOrders = onSnapshot(
      query(ordersCollectionRef),
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(fetchedOrders);
      },
      (error) => {
        console.error("Error fetching orders: ", error);
      }
    );

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, []);

  useEffect(() => {
    if (selectedImage) {
      setNewProduct((prev) => ({
        ...prev,
        image: selectedImage,
      }));
    }
  }, [selectedImage]);

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      const productToAdd = {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        status: Number(newProduct.stock) > 20 ? "In Stock" : "Low Stock",
        image: selectedImage || newProduct.image,
      };

      if (isEditMode && editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productToAdd);
      } else {
        await addDoc(collection(db, "products"), productToAdd);
      }

      setIsModalOpen(false);
      setNewProduct({
        name: "",
        category: "",
        description: "",
        price: "",
        stock: "",
        image: "/images/shop-images/default-image.jpg",
      });
      setSelectedImage(null);
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
    setSelectedImage(product.image);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(db, "products", productId));
    } catch (e) {
      console.error("Error removing document: ", e);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "Confirmed",
      });
    } catch (e) {
      console.error("Error confirming order: ", e);
    }
  };

  const handleReceiveOrder = async (orderId) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "Received",
      });
    } catch (e) {
      console.error("Error marking order as received: ", e);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      selectedCategory === "All Categories" ||
      product.category === selectedCategory
  );

  return (
    <div className="space-y-6 mt-14">
      <div className="flex justify-between items-center">
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
              image: "/images/shop-images/default-image.jpg",
            });
            setSelectedImage(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-green2 text-white rounded-full hover:bg-green2/80 transition-colors font-nunito"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 font-nunito-medium tracking-wide text-sm">
          <form
            onSubmit={handleAddProduct}
            className="bg-background p-8 rounded-2xl w-96 border-[1.6px] border-green2"
          >
            <input
              type="text"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              className="w-full mb-2 p-2 px-4 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent"
              required
            />
            <div className="w-full mb-4">
              <p className="text-sm text-text/70 mb-2">Select Product Image:</p>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {shopImages.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`
                      w-24 h-24 flex-shrink-0 rounded-lg cursor-pointer 
                      border-2 transition-all duration-200
                      ${
                        selectedImage === image
                          ? "border-green2 ring-2 ring-green2/50"
                          : "border-transparent hover:border-green2/50"
                      }
                    `}
                  >
                    <img
                      src={image}
                      alt={`Product option ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>

            <select
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct({ ...newProduct, category: e.target.value })
              }
              className="w-full mb-2 p-2 px-4 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent"
              required
            >
              <option value="">Select Category</option>
              {categories.slice(1).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
              className="w-full mb-2 p-2 px-4 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent"
              required
              rows={3}
            />
            <div className="relative mb-2">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 font-nunito-bold text-primary/80">
                ₱
              </span>
              <input
                type="text"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, "");
                  setNewProduct({ ...newProduct, price: value });
                }}
                className="w-full p-2 pl-7 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent"
                required
              />
            </div>
            <input
              type="text"
              placeholder="Stock"
              value={newProduct.stock}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setNewProduct({ ...newProduct, stock: value });
              }}
              className="w-full mb-2 p-2 px-4 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent"
              required
            />
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors font-nunito"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green2 text-white rounded-full hover:bg-green2/80 transition-colors font-nunito"
              >
                {isEditMode ? "Update Product" : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border-[1.6px] border-green2">
        <table className="w-full bg-background border-collapse">
          <thead>
            <tr className="bg-green3/20 font-nunito-bold text-text">
              <th className="p-3 text-left">Product Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Description</th>
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
                className="border-b border-green3/30 hover:bg-green3/10 font-nunito"
              >
                <td className="p-3 font-nunito-bold">{product.name}</td>
                <td className="p-3">{product.category}</td>
                <td className="p-3">{product.description}</td>
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
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-green2 hover:text-green2/80 transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order History Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-green2 mb-6">Order History</h2>
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-background/95 p-6 rounded-xl border-[1.6px] border-green2 shadow-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-text">
                    {order.userName}
                  </h3>
                  <p className="text-sm text-text/60">
                    User ID: {order.userId}
                  </p>
                  <p className="text-primary font-medium mt-2">
                    ₱{order.price * order.quantity}
                  </p>
                  <div className="mt-2">
                    <span className="text-sm text-text/60">
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
                        className="px-4 py-2 bg-green3 text-text rounded-full hover:bg-green3/80 transition-colors border-[1.6px] border-green2 flex items-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Confirm
                      </button>
                    )}
                  {order.status === "Confirmed" &&
                    order.status !== "Received" && (
                      <button
                        onClick={() => handleReceiveOrder(order.id)}
                        className="px-4 py-2 bg-green3 text-text rounded-full hover:bg-green3/80 transition-colors border-[1.6px] border-green2 flex items-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Received
                      </button>
                    )}
                  {order.status === "Received" && (
                    <span className="px-4 py-2 bg-green3/30 text-text rounded-full border-[1.6px] border-green2 flex items-center gap-2">
                      <CheckCircle size={18} />
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminShop;
