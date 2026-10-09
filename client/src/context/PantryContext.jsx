import { createContext, useContext, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../api/axios.js";
import { useAuth } from "./AuthContext.jsx";

const PantryContext = createContext();

export const PantryProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchPantry = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await api.get("/pantry");
      setItems(data);
      setLoaded(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load pantry");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addItem = async (payload) => {
    try {
      const { data } = await api.post("/pantry", payload);
      setItems((prev) => [data, ...prev]);
      toast.success(`Added ${data.name}`);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add");
      return false;
    }
  };

  const updateItem = async (id, payload) => {
    try {
      const { data } = await api.put(`/pantry/${id}`, payload);
      setItems((prev) => prev.map((i) => (i._id === id ? data : i)));
      toast.success("Updated");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
      return false;
    }
  };

  const deleteItem = async (id) => {
    try {
      await api.delete(`/pantry/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success("Removed");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove");
      return false;
    }
  };

  const clearPantry = async () => {
    try {
      await api.delete("/pantry/clear");
      setItems([]);
      toast.success("Pantry cleared");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to clear");
      return false;
    }
  };

  const resetPantry = () => {
    setItems([]);
    setLoaded(false);
  };

  return (
    <PantryContext.Provider
      value={{
        items,
        loading,
        loaded,
        fetchPantry,
        addItem,
        updateItem,
        deleteItem,
        clearPantry,
        resetPantry,
      }}
    >
      {children}
    </PantryContext.Provider>
  );
};

export const usePantry = () => {
  const ctx = useContext(PantryContext);
  if (!ctx) throw new Error("usePantry must be used within PantryProvider");
  return ctx;
};