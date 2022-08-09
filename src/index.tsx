import { BrowserRouter, Routes, Route } from "react-router-dom";
import { IndexPage } from "./pages";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { API } from "./consts/api";
import { SignInPage } from "./pages/sign-in";
import { AddListPage } from "./pages/add-list";
import React, { useEffect } from "react";
import { useUserStore } from "./store/UserStore";

const queryClient = new QueryClient();
export default function App() {
  const { fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/add-list" element={<AddListPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}
