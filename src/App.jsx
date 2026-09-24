import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./store/cart";
import { AuthProvider } from "./store/auth";
import { SiteProvider } from "./store/site";
import { CatalogProvider } from "./store/catalog";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PageMeta from "./components/PageMeta";
import ErrorBoundary from "./components/ErrorBoundary";
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
import OrderSuccess from "./pages/OrderSuccess";
import Orders, { ProfileBody } from "./pages/Account";
import Track from "./pages/Track";
import Auth from "./pages/Auth";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import AdminCustomers from "./pages/admin/Customers";
import AdminEnquiries from "./pages/admin/Enquiries";
import AdminMarketing from "./pages/admin/Marketing";
import AdminSettings from "./pages/admin/Settings";

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

/**
 * Storefront chrome (header / cart / footer / popups) must NEVER render
 * inside the admin area. Admin login + dashboard are a totally separate
 * app surface mounted at /admin — no shared header, footer or drawers.
 */
function Shell() {
  const { pathname } = useLocation();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return (
      <>
        <ScrollManager />
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="marketing" element={<AdminMarketing />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </>
    );
  }

  /* Standalone account screens: full-screen, no storefront chrome
     (no header, footer, cart drawer, popups) — same treatment as admin. */
  if (pathname === "/login" || pathname === "/signup") {
    return (
      <>
        <ScrollManager />
        <PageMeta />
        <Routes>
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/signup" element={<Auth mode="signup" />} />
        </Routes>
      </>
    );
  }

  return (
    <>
      <ScrollManager />
      <PageMeta />
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
        <Route path="/order-success/:id" element={<OrderSuccess />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<ProfileBody />} />
        <Route path="/track" element={<Track />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
    <SiteProvider>
    <CatalogProvider>
    <CartProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Shell />
        </ErrorBoundary>
      </BrowserRouter>
    </CartProvider>
    </CatalogProvider>
    </SiteProvider>
    </AuthProvider>
  );
}
