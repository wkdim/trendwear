import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );

test("renders the brand and core nav links for a guest", () => {
  renderNavbar();

  expect(screen.getByText("TrendWear GH")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Shop" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Cart/ })).toBeInTheDocument();
});

test("shows Login/Register (not Admin) when logged out", () => {
  renderNavbar();

  expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();
});
