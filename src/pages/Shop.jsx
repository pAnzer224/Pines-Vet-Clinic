import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ShoppingCart } from "lucide-react";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  limit,
  startAfter,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase-config";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import CartModal from "../userDashboard/components/cartModal";
import StatusDropdown from "../components/StatusDropdown";
import LoadingSpinner from "../components/LoadingSpinner";
import FeatureOverlay from "../components/FeauterOverlay";
import PromptModal from "../components/promptModal";

const PRODUCTS_PER_PAGE = 12;

const planDiscounts = {
  premium: 0.2,
  standard: 0.15,
  basic: 0.1,
  free: 0,
};

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [lastProduct, setLastProduct] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [userPlan, setUserPlan] = useState({
    name: "free",
    discount: 0,
  });
  const { currentUser } = useAuth();
  const [overlaySettings, setOverlaySettings] = useState({
    isEnabled: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    const savedOverlaySettings = localStorage.getItem("overlaySettings");
    if (savedOverlaySettings) {
      const settings = JSON.parse(savedOverlaySettings);
      if (settings.shop) {
        setOverlaySettings(settings.shop);
        setShowTooltip(!settings.shop.isEnabled);
      }
    } else {
      setShowTooltip(true);
    }
  }, []);

  const categories = useMemo(
    () => [
      "All",
      "Food & Treats",
      "Toys",
      "Beds & Furniture",
      "Accessories",
      "Health & Wellness",
    ],
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!overlaySettings.isEnabled) {
        setShowTooltip(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [overlaySettings.isEnabled]);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = onSnapshot(doc(db, "users", currentUser.uid), (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        const planName = userData.plan || "free";
        setUserPlan({
          name: planName,
          discount: planDiscounts[planName] || 0,
        });
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    const initialQuery = query(
      collection(db, "products"),
      orderBy("name"),
      limit(PRODUCTS_PER_PAGE)
    );

    const unsubscribe = onSnapshot(initialQuery, (snapshot) => {
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastProduct(lastVisible);

      const fetchedProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        name: String(doc.data().name || ""),
        category: String(doc.data().category || ""),
        description: String(doc.data().description || ""),
        price: Number(doc.data().price || 0),
        image: doc.data().image || "/images/shop-images/default-image.jpg",
      }));

      setProducts(fetchedProducts);
      setInitialLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const cartQuery = query(
      collection(db, "cart"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(cartQuery, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCartItems(items);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const loadMoreProducts = async () => {
    if (loadingMore || !lastProduct) return;

    setLoadingMore(true);
    const nextQuery = query(
      collection(db, "products"),
      orderBy("name"),
      startAfter(lastProduct),
      limit(PRODUCTS_PER_PAGE)
    );

    const snapshot = await getDocs(nextQuery);
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    setLastProduct(lastVisible);

    const newProducts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      name: String(doc.data().name || ""),
      category: String(doc.data().category || ""),
      description: String(doc.data().description || ""),
      price: Number(doc.data().price || 0),
      image: doc.data().image || "/images/shop-images/default-image.jpg",
    }));

    setProducts((prev) => [...prev, ...newProducts]);
    setLoadingMore(false);
  };

  const handleAddToCart = async (product) => {
    if (!currentUser) {
      setIsAuthPromptOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const cartQuery = query(
        collection(db, "cart"),
        where("userId", "==", currentUser.uid),
        where("productId", "==", product.id)
      );

      const cartSnapshot = await getDocs(cartQuery);

      const discountedPrice = Math.round(
        product.price * (1 - (userPlan.discount || 0))
      );

      if (!cartSnapshot.empty) {
        const cartItem = cartSnapshot.docs[0];
        await updateDoc(doc(db, "cart", cartItem.id), {
          quantity: cartItem.data().quantity + 1,
          updatedAt: serverTimestamp(),
          price: discountedPrice,
          originalPrice: product.price,
        });
      } else {
        await addDoc(collection(db, "cart"), {
          userId: currentUser.uid,
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          price: discountedPrice,
          originalPrice: product.price,
          quantity: 1,
          createdAt: serverTimestamp(),
          userName: currentUser.displayName || "Unknown User",
        });
      }

      toast.success("Added to cart successfully!");
      setIsCartOpen(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description &&
          product.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      if (matchesCategory && matchesSearch) {
        const discountedPrice = Math.round(
          product.price * (1 - (userPlan.discount || 0))
        );
        return {
          ...product,
          originalPrice: product.price,
          price: discountedPrice,
        };
      }
      return false;
    });
  }, [products, selectedCategory, searchQuery, userPlan.discount]);

  return (
    <div className="min-h-screen bg-background/40">
      <FeatureOverlay
        isEnabled={overlaySettings.isEnabled}
        title={overlaySettings.title}
        message={overlaySettings.message}
      />

      <div className="container mx-auto px-6 pb-20 mb-10 font-nunito-bold">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text mb-2 tracking-wide">
            Pet Shop
          </h1>
          <p className="text-text/80 tracking-wide font-nunito-semibold max-w-2xl mx-auto">
            Everything your pet needs, from nutrition to comfort, all in one
            place.
          </p>
        </div>

        {userPlan.name !== "free" && (
          <div className="bg-green3/20 border-l-4 border-green2 p-4 mb-8 max-w-7xl mx-auto">
            <p className="text-primary font-nunito-semibold tracking-wide">
              Your{" "}
              {userPlan.name.charAt(0).toUpperCase() + userPlan.name.slice(1)}{" "}
              Plan discount: {userPlan.discount * 100}% off all products!
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 relative max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green2/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border-[1.6px] border-green2 bg-background/95 focus:outline-none focus:border-primary text-text"
              />
            </div>

            <StatusDropdown
              statusOptions={categories}
              selectedStatus={selectedCategory}
              onStatusChange={setSelectedCategory}
            />
          </div>

          <div className="relative self-end sm:self-auto">
            <button
              onClick={() => {
                if (!currentUser) {
                  setIsAuthPromptOpen(true);
                  return;
                }
                setIsCartOpen(true);
                setShowTooltip(false);
              }}
              className={`p-2 text-green2 hover:text-primary rounded-full transition-all relative z-50 ${
                showTooltip
                  ? "bg-background shadow-[0_0_35px_15px_rgba(255,255,255,0.95)]"
                  : ""
              }`}
            >
              <ShoppingCart size={24} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>

            {showTooltip && (
              <>
                <div
                  className="fixed inset-0 bg-black/60 z-40"
                  onClick={() => setShowTooltip(false)}
                />
                <div className="absolute right-0 mt-3 z-50">
                  <div className="relative bg-background p-4 rounded-lg shadow-lg border-2 border-green2 w-64">
                    <p className="text-text/70 text-center">
                      Here you can see your orders and manage your shopping
                      cart!
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {initialLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="bg-background/95 p-5 rounded-2xl border-[1.6px] border-green2 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="relative group">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-44 object-cover rounded-xl mb-4"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-green2/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                </div>

                <span className="inline-block px-3 py-1 bg-green3/30 text-text/80 text-xs rounded-full mb-2">
                  {product.category}
                </span>

                <h2 className="text-xl font-semibold text-text mb-1">
                  {product.name}
                </h2>

                <p className="text-text/60 text-sm mb-2 line-clamp-2">
                  {product.description}
                </p>

                <div className="mb-4">
                  {userPlan.discount > 0 ? (
                    <>
                      <p className="text-text/60 text-sm line-through">
                        ₱{product.originalPrice}
                      </p>
                      <p className="text-lg font-semibold text-primary">
                        ₱{product.price}
                        <span className="text-sm text-green2 ml-2">
                          ({userPlan.discount * 100}% off)
                        </span>
                      </p>
                    </>
                  ) : (
                    <p className="text-lg font-semibold text-primary">
                      ₱{product.price}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-green3 text-text rounded-full hover:bg-green3/80 transition-colors border-[1.6px] border-green2 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  {isLoading ? "Adding..." : "Add to Cart"}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {products.length >= PRODUCTS_PER_PAGE && !initialLoading && (
          <div className="text-center mt-8">
            <button
              onClick={loadMoreProducts}
              disabled={loadingMore}
              className="px-6 py-2 bg-green3 text-text rounded-full hover:bg-green3/80 transition-colors border-[1.6px] border-green2"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}

        <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

        <PromptModal
          isOpen={isAuthPromptOpen}
          onClose={() => setIsAuthPromptOpen(false)}
          title="Authentication Required"
          message="You need to be logged in to perform this action. Please log in or sign up to continue."
        />
      </div>
    </div>
  );
};

export default Shop;
