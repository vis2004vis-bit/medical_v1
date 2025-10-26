import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signIn, fetchAuthSession } from "aws-amplify/auth";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await signIn({
        username: form.username,
        password: form.password,
      });
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      login({
        token,
        user: {
          username: form.username,
          email: user?.userId || "",
        },
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-xl border bg-white p-6 shadow"
      >
        <h2 className="text-2xl font-semibold">Login</h2>
        <p className="mt-1 text-sm text-slate-600">
          Use your username or email.
        </p>
        {error && (
          <div className="mt-3 bg-rose-50 border border-rose-200 p-2 text-rose-700">
            {error}
          </div>
        )}
        <div className="mt-4">
          <label className="text-sm text-slate-700">Username</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={form.username}
            onChange={(e) =>
              setForm((f) => ({ ...f, username: e.target.value }))
            }
            required
          />
        </div>
        <div className="mt-3">
          <label className="text-sm text-slate-700">Password</label>
          <input
            type="password"
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            required
          />
        </div>
        <button
          disabled={loading}
          className="mt-5 w-full rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
        <div className="mt-3 text-sm text-slate-600">
          No account?{" "}
          <Link to="/signup" className="text-sky-700">
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}
