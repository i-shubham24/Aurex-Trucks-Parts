import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ShopProvider } from "./store/shop.jsx";
import { AuthProvider } from "./store/auth.jsx";
import { ProductsProvider } from "./store/products.jsx";
import { SiteProvider } from "./store/site.jsx";
import { GarageProvider } from "./components/garage/GarageContext.jsx";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import { CategoriesPage, BrandsPage, DealsPage, ResourcesPage, ContactPage, QuotePage, TrackPage, CompliancePage } from "./pages/Extra.jsx";
import { LoginPage, SignupPage, AccountPage } from "./pages/Auth.jsx";
import { CheckoutPage, OrderSuccessPage } from "./pages/Checkout.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminCategories from "./pages/admin/AdminCategories.jsx";
import { AdminCustomers, AdminQuotes, AdminDeals, AdminContent, AdminSettings } from "./pages/admin/AdminRest.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SiteProvider>
          <ProductsProvider>
            <ShopProvider>
              <GarageProvider>
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
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/product/:sku" element={<ProductDetail />} />
                        <Route path="/categories" element={<CategoriesPage />} />
                        <Route path="/brands" element={<BrandsPage />} />
                        <Route path="/deals" element={<DealsPage />} />
                        <Route path="/resources" element={<ResourcesPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/quote" element={<QuotePage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/order-success/:id" element={<OrderSuccessPage />} />
                        <Route path="/account" element={<AccountPage />} />
                        <Route path="/track" element={<TrackPage />} />
                        <Route path="/compliance" element={<CompliancePage />} />
                        <Route path="*" element={<Home />} />
                      </Routes>
                    </Layout>
                  } />
                </Routes>
              </GarageProvider>
            </ShopProvider>
          </ProductsProvider>
        </SiteProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
