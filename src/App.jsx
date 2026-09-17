import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ShopProvider } from "./store/shop.jsx";
import { AuthProvider } from "./store/auth.jsx";
import { ProductsProvider } from "./store/products.jsx";
import { SiteProvider } from "./store/site.jsx";
import { GarageProvider } from "./components/garage/GarageContext.jsx";
import Layout from "./components/Layout.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const Shop = lazy(() => import("./pages/Shop.jsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));

const CategoriesPage = lazy(() => import("./pages/Extra.jsx").then(m => ({ default: m.CategoriesPage })));
const BrandsPage = lazy(() => import("./pages/Extra.jsx").then(m => ({ default: m.BrandsPage })));
const DealsPage = lazy(() => import("./pages/Extra.jsx").then(m => ({ default: m.DealsPage })));
const CheckoutPage = lazy(() => import("./pages/Checkout.jsx").then(m => ({ default: m.CheckoutPage })));
const OrderSuccessPage = lazy(() => import("./pages/Checkout.jsx").then(m => ({ default: m.OrderSuccessPage })));
const TrackPage = lazy(() => import("./pages/Extra.jsx").then(m => ({ default: m.TrackPage })));
const ResourcesPage = lazy(() => import("./pages/Resources.jsx").then(m => ({ default: m.ResourcesPage })));
const PartnersPage = lazy(() => import("./pages/Partners.jsx").then(m => ({ default: m.PartnersPage })));
const CataloguePage = lazy(() => import("./pages/Catalogue.jsx").then(m => ({ default: m.CataloguePage })));
const CompliancePage = lazy(() => import("./pages/Extra.jsx").then(m => ({ default: m.CompliancePage })));
const ContactPage = lazy(() => import("./pages/Extra.jsx").then(m => ({ default: m.ContactPage })));
const QuotePage = lazy(() => import("./pages/Extra.jsx").then(m => ({ default: m.QuotePage })));

const LoginPage = lazy(() => import("./pages/Auth.jsx").then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import("./pages/Auth.jsx").then(m => ({ default: m.SignupPage })));
const AccountPage = lazy(() => import("./pages/Auth.jsx").then(m => ({ default: m.AccountPage })));


const AboutPage = lazy(() => import("./pages/Company.jsx").then(m => ({ default: m.AboutPage })));
const LocationsPage = lazy(() => import("./pages/Company.jsx").then(m => ({ default: m.LocationsPage })));
const TradePage = lazy(() => import("./pages/Company.jsx").then(m => ({ default: m.TradePage })));
const PoliciesPage = lazy(() => import("./pages/Company.jsx").then(m => ({ default: m.PoliciesPage })));

const BrandPage = lazy(() => import("./pages/Brand.jsx"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout.jsx"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard.jsx"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders.jsx"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts.jsx"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories.jsx"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminRest.jsx").then(m => ({ default: m.AdminCustomers })));
const AdminQuotes = lazy(() => import("./pages/admin/AdminRest.jsx").then(m => ({ default: m.AdminQuotes })));
const AdminDeals = lazy(() => import("./pages/admin/AdminRest.jsx").then(m => ({ default: m.AdminDeals })));
const AdminContent = lazy(() => import("./pages/admin/AdminRest.jsx").then(m => ({ default: m.AdminContent })));
const AdminSettings = lazy(() => import("./pages/admin/AdminRest.jsx").then(m => ({ default: m.AdminSettings })));

// Skeleton loader instead of generic spinner
const SkeletonLoader = () => (
  <div className="animate-pulse px-4 py-8 max-w-7xl mx-auto space-y-6 opacity-30">
    <div className="h-64 bg-gray-200 rounded-2xl w-full" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="h-72 bg-gray-200 rounded-2xl" />
      ))}
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <SiteProvider>
            <ProductsProvider>
              <ShopProvider>
                <GarageProvider>
                  <Suspense fallback={<SkeletonLoader />}>
                    <Routes>
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="customers" element={<AdminCustomers />} />
                        <Route path="quotes" element={<AdminQuotes />} />
                        <Route path="deals" element={<AdminDeals />} />
                        <Route path="content" element={<AdminContent />} />
                        <Route path="settings" element={<AdminSettings />} />
                      </Route>
                      {/* Full screen auth, no store header or footer */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
                      <Route path="/*" element={
                        <Layout>
                          <Suspense fallback={<SkeletonLoader />}>
                            <Routes>
                              <Route path="/" element={<Home />} />
                              <Route path="/shop" element={<Shop />} />
                              <Route path="/product/:sku" element={<ProductDetail />} />
                              <Route path="/categories" element={<CategoriesPage />} />
                              <Route path="/brands" element={<BrandsPage />} />
                              <Route path="/deals" element={<DealsPage />} />
                              <Route path="/resources" element={<ResourcesPage />} />
                              <Route path="/partners" element={<PartnersPage />} />
                              <Route path="/catalogue" element={<CataloguePage />} />
                              <Route path="/contact" element={<ContactPage />} />
                              <Route path="/quote" element={<QuotePage />} />
                              <Route path="/checkout" element={<CheckoutPage />} />
                              <Route path="/order-success/:id" element={<OrderSuccessPage />} />
                              <Route path="/account" element={<AccountPage />} />
                              <Route path="/track" element={<TrackPage />} />
                              <Route path="/compliance" element={<CompliancePage />} />
                              <Route path="/about" element={<AboutPage />} />
                              <Route path="/locations" element={<LocationsPage />} />
                              <Route path="/trade" element={<TradePage />} />
                              <Route path="/policies" element={<PoliciesPage />} />
                              <Route path="/policies/:slug" element={<PoliciesPage />} />
                              <Route path="/brand/:name" element={<BrandPage />} />
                              <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                          </Suspense>
                        </Layout>
                      } />
                    </Routes>
                  </Suspense>
                </GarageProvider>
              </ShopProvider>
            </ProductsProvider>
          </SiteProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
