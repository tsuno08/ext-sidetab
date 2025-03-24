import React from "react";
import { createRoot } from "react-dom/client";
import { Popup } from "./components/Popup";
import "./popup.css";

const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);
