import { BrowserRouter, Routes, Route } from "react-router-dom";
import { IndexPage } from "./pages";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { API } from "./consts/api";
import { SignInPage } from "./pages/sign-in";
import { AddListPage } from "./pages/list/add-list";
import React, { useEffect } from "react";
import { useUserStore } from "./store/UserStore";
import { useInterfaceStore } from "./store/InterfaceStore";
import { ScreenLoader } from "./components/ScreenLoader";
import { UserPage } from "./pages/user";

const queryClient = new QueryClient();
export default function App() {
  const { fetchUser } = useUserStore();
  const { isLoading } = useInterfaceStore();

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/user/:userId" element={<UserPage />} />
            <Route path="/list/add-list" element={<AddListPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
      <ScreenLoader isLoading={isLoading} />
    </React.StrictMode>
  );
}
