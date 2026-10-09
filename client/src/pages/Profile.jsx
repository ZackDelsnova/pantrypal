import { useState } from "react";
import { FiUser, FiLock, FiCheck } from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import IngredientTag from "../components/IngredientTag.jsx";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    dietaryPreference: user?.dietaryPreference || "any",
    allergies: user?.allergies || [],
  });
  const [newAllergy, setNewAllergy] = useState("");
  const [passwords, setPasswords] = useState({ newPass: "", confirm: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put("/auth/profile", form);
      updateUser(data);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const addAllergy = () => {
    const a = newAllergy.trim().toLowerCase();
    if (!a || form.allergies.includes(a)) return;
    setForm({ ...form, allergies: [...form.allergies, a] });
    setNewAllergy("");
  };

  const removeAllergy = (name) => {
    setForm({ ...form, allergies: form.allergies.filter((a) => a !== name) });
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!passwords.newPass || passwords.newPass.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      await api.put("/auth/profile", { password: passwords.newPass });
      setPasswords({ newPass: "", confirm: "" });
      toast.success("Password changed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
          <FiUser className="me-2" style={{ color: "var(--accent)" }} />
          My Profile
        </h2>
        <p style={{ color: "var(--text-secondary)" }} className="mb-0">
          {user?.email}
        </p>
      </div>

      <div className="glass-card p-4 mb-3">
        <h6 className="fw-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Account Details
        </h6>
        <form onSubmit={saveProfile}>
          <div className="row g-3">
            <div className="col-md-6">
              <label
                className="form-label"
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                Name
              </label>
              <input
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label
                className="form-label"
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                Dietary Preference
              </label>
              <select
                className="form-select"
                value={form.dietaryPreference}
                onChange={(e) =>
                  setForm({ ...form, dietaryPreference: e.target.value })
                }
              >
                <option value="any">No preference</option>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>
            <div className="col-12">
              <label
                className="form-label"
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                Allergies
              </label>
              <div className="d-flex gap-2 mb-2">
                <input
                  className="form-control"
                  placeholder="e.g., peanuts"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAllergy();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={addAllergy}
                >
                  Add
                </button>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {form.allergies.map((a) => (
                  <IngredientTag
                    key={a}
                    name={a}
                    onRemove={() => removeAllergy(a)}
                  />
                ))}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-accent mt-3"
            disabled={savingProfile}
          >
            {savingProfile ? (
              <LoadingSpinner size={18} />
            ) : (
              <>
                <FiCheck className="me-1" /> Save Changes
              </>
            )}
          </button>
        </form>
      </div>

      <div className="glass-card p-4">
        <h6 className="fw-bold mb-3" style={{ color: "var(--text-primary)" }}>
          <FiLock className="me-2" /> Change Password
        </h6>
        <form onSubmit={savePassword}>
          <div className="row g-3">
            <div className="col-md-6">
              <label
                className="form-label"
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                New Password
              </label>
              <input
                type="password"
                className="form-control"
                value={passwords.newPass}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPass: e.target.value })
                }
              />
            </div>
            <div className="col-md-6">
              <label
                className="form-label"
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                Confirm
              </label>
              <input
                type="password"
                className="form-control"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-outline-secondary mt-3"
            disabled={savingPassword}
          >
            {savingPassword ? <LoadingSpinner size={18} /> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;