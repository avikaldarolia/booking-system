import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import axios from "axios";

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
const storeId = import.meta.env.VITE_STORE_ID;

axios.defaults.baseURL = `${baseUrl}/${storeId}/`;

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>
);
