import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Route } from "react-router-dom";
import "./style.css";
import App from "./routes/App";
import Error from "./routes/Error";
import Crawl from "./routes/Crawl";
import Watch from "./routes/Watch";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <App>
        <Watch />
      </App>
    ),
    errorElement: (
      <App>
        <Error />
      </App>
    ),
  },
  {
    path: "crawl",
    element: (
      <App>
        <Crawl />
      </App>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
