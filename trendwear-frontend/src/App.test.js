import { render, screen } from "@testing-library/react";
import App from "./App";

// Smoke test: proves the router + AuthProvider + CartProvider + Navbar/Footer
// wiring in App.jsx mounts without throwing (this exact composition used to
// be entirely broken — see the plan this repo was fixed under). Navigates to
// /contact rather than "/" so it doesn't also need to mock the Home page's
// product fetch just to render.
test("renders without crashing", async () => {
  window.history.pushState({}, "", "/contact");
  render(<App />);

  expect(screen.getByText("TrendWear GH")).toBeInTheDocument(); // navbar brand
  expect(await screen.findByRole("heading", { name: "Contact Us" })).toBeInTheDocument();
  expect(screen.getByText(/All rights reserved/)).toBeInTheDocument(); // footer
});
