import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "./ProductCard";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";

const product = { _id: "p1", name: "Gold Hoodie", price: 150, stock: 5, image: "" };

const renderCard = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <CartProvider>
          <ProductCard product={product} />
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );

beforeEach(() => localStorage.clear());

test("renders the product name and price", () => {
  renderCard();
  expect(screen.getByText("Gold Hoodie")).toBeInTheDocument();
  expect(screen.getByText("GH₵ 150")).toBeInTheDocument();
});

test("adding to cart (as a guest) persists it to localStorage", async () => {
  renderCard();

  fireEvent.click(screen.getByRole("button", { name: "Add to Cart" }));

  await waitFor(() => {
    const cart = JSON.parse(localStorage.getItem("guestCart"));
    expect(cart).toEqual([
      expect.objectContaining({ productId: "p1", name: "Gold Hoodie", quantity: 1 }),
    ]);
  });
});

test("disables the button and labels out-of-stock products", () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <CartProvider>
          <ProductCard product={{ ...product, stock: 0 }} />
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );

  expect(screen.getByRole("button", { name: "Out of stock" })).toBeDisabled();
});
