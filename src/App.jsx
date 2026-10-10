import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate, useSearchParams } from "react-router-dom";
import { NotificationProvider } from "./store/notification";
import NotificationCenter from "./components/NotificationCenter";
import { CartProvider } from "./store/cart";
import { AuthProvider, useAuth } from "./store/auth";
import { SiteProvider } from "./store/site";
import { CatalogProvider } from "./store/catalog";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PageMeta from "./components/PageMeta";
import ErrorBoundary from "./components/ErrorBoundary";
import CartDrawer from "./components/CartDrawer";
import CompareTray from "./components/CompareTray";
import PromoPopup from "./components/PromoPopup";
import AuthModal from "./components/AuthModal";
import Home from "./pages/Home";

/* Everything except the landing page loads on demand. */
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const TailLiftEnquiry = lazy(() => import("./pages/TailLiftEnquiry"));
const Shop = lazy(() => import("./pages/Shop"));
const CategoryByParam = lazy(() => import("./pages/Shop").then((m) => ({ default: m.CategoryByParam })));
const Policies = lazy(() => import("./pages/Policies"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Article = lazy(() => import("./pages/Article"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const Orders = lazy(() => import("./pages/Account"));
const ProfileBody = lazy(() => import("./pages/Account").then((m) => ({ default: m.ProfileBody })));
const Track = lazy(() => import("./pages/Track"));
const Reset = lazy(() => import("./pages/Reset"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const AdminCustomers = lazy(() => import("./pages/admin/Customers"));
const AdminEnquiries = lazy(() => import("./pages/admin/Enquiries"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));

const PageFallback = () => <div className="min-h-[60vh]" aria-busy="true" />;

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

function AuthRedirect({ mode = "login" }) {
  const { openAuthModal } = useAuth();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  useEffect(() => {
    openAuthModal({ mode });
  }, [mode, openAuthModal]);

  return <Navigate to={redirect} replace />;
}

/**
 * Storefront chrome (header / cart / footer / popups) must NEVER render
 * inside the admin area. Admin login + dashboard are a totally separate
 * app surface mounted at /admin — no shared header, footer or drawers.
 */
function Shell() {
  const { pathname } = useLocation();
  const { authModal, closeAuthModal } = useAuth();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return (
      <>
        <ScrollManager />
        <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="marketing" element={<Navigate to="/admin" replace />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
        </Suspense>
      </>
    );
  }

  /* Standalone password reset screens: full-screen, no storefront chrome */
  if (pathname === "/forgot-password" || pathname === "/reset-password") {
    return (
      <>
        <ScrollManager />
        <PageMeta />
        <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/forgot-password" element={<Reset />} />
          <Route path="/reset-password" element={<Reset />} />
        </Routes>
        </Suspense>
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
      <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/tail-lift-enquiry" element={<TailLiftEnquiry />} />
        <Route path="/enquiry/tail-lift" element={<TailLiftEnquiry />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:slug" element={<CategoryByParam />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/product/:sku" element={<ProductDetail />} />
        <Route path="/news/:slug" element={<Article />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<ProfileBody />} />
        <Route path="/track" element={<Track />} />
        <Route path="/login" element={<AuthRedirect mode="login" />} />
        <Route path="/signup" element={<AuthRedirect mode="signup" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
      <Footer />
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        initialMode={authModal.mode}
        onComplete={authModal.onComplete}
      />
    </>
  );
}

export default function App() {
  return (
    <NotificationProvider>
    <AuthProvider>
    <SiteProvider>
    <CatalogProvider>
    <CartProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <NotificationCenter />
          <Shell />
        </ErrorBoundary>
      </BrowserRouter>
    </CartProvider>
    </CatalogProvider>
    </SiteProvider>
    </AuthProvider>
    </NotificationProvider>
  );
}
