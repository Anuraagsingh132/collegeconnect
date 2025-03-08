import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setupAppwriteResources } from './lib/setup';
import { AuthProvider } from './lib/AuthContext'
import { Toaster } from '@/components/ui/toaster'

// Setup Appwrite resources (buckets) on application startup
setupAppwriteResources()
  .catch(console.error);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
    <Toaster />
  </AuthProvider>
);
