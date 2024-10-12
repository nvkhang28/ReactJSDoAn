import App from "../layout/App";
import Catalog from "../../fearures/catalog/Catalog";
import ProductDetails from "../../fearures/catalog/ProductDetails";
import AboutPage from "../../fearures/about/AboutPage";
import ContactPage from "../../fearures/contact/ContactPage";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ServerError from "../errors/ServerError";
import NotFound from "../errors/NotFound";
import BasketPage from "../../fearures/basket/BasketPage";
import RequireAuth from "./RequireAuth";
import Register from "../../fearures/account/Register";
import Login from "../../fearures/account/Login";
import Orders from "../../fearures/order/Orders";
import CheckoutWrapper from "../../fearures/checkout/CheckoutWrapper";
import Inventory from "../../fearures/admin/Inventory";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        // authenticated routes
        element: <RequireAuth />,
        children: [
          { path: "/checkout", element: <CheckoutWrapper /> },
          { path: "/orders", element: <Orders /> },
        ],
      },
      {
        // admin routes
        element: <RequireAuth roles={["User"]} />,
        children: [{ path: "/inventory", element: <Inventory /> }],
      },
      { path: "catalog", element: <Catalog /> },
      { path: "catalog/:id", element: <ProductDetails /> },
      { path: "about", element: <AboutPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "/server-error", element: <ServerError /> },
      { path: "/not-found", element: <NotFound /> },
      { path: "/basket", element: <BasketPage /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "*", element: <Navigate replace to="/not-found" /> },
    ],
  },
]);
