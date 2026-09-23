import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./store/cart";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import CompareTray from "./components/CompareTray";
import PromoPopup from "./components/PromoPopup";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Shop, { CategoryByParam } from "./pages/Shop";
import Policies from "./pages/Policies";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Orders, { ProfileBody } from "./pages/Account";
import Track from "./pages/Track";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) { el.scrollIntoView({ behavior: "smooth" }); return; }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollManager />
        <Header />
        <CartDrawer />
        <CompareTray />
        <PromoPopup />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:slug" element={<CategoryByParam />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/product/:sku" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<ProfileBody />} />
          <Route path="/track" element={<Track />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </CartProvider>
  );
}
