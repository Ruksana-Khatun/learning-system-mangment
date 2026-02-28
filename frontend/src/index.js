import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import store from "./Redux/store";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(
      Provider,
      { store },
      React.createElement(
        BrowserRouter,
        null,
        React.createElement(App, null),
        React.createElement(Toaster, null)
      )
    )
  )
);

