import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp, confirmSignUp } from "aws-amplify/auth";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerify, setShowVerify] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signUp({
        username: form.username,
        password: form.password,
        options: { userAttributes: { email: form.email } },
      });
      setShowVerify(true);
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await confirmSignUp({
        username: form.username,
        confirmationCode: verificationCode,
      });
      alert("Account verified successfully!");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (showVerify) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <form
          onSubmit={onVerify}
          className="w-full max-w-md rounded-xl border bg-white p-6 shadow"
        >
          <h2 className="text-2xl font-semibold">Verify Email</h2>
          <p className="mt-1 text-sm text-slate-600">
            Enter the 6-digit code sent to your email.
          </p>
          {error && (
            <div className="mt-3 bg-rose-50 border border-rose-200 p-2 text-rose-700">
              {error}
            </div>
          )}
          <div className="mt-4">
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
          </div>
          <button
            disabled={loading}
            className="mt-5 w-full bg-sky-600 text-white rounded-md py-2"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-xl border bg-white p-6 shadow"
      >
        <h2 className="text-2xl font-semibold">Create account</h2>
        <p className="mt-1 text-sm text-slate-600">
          Start scanning X-rays in minutes.
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
          <label className="text-sm text-slate-700">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
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
          {loading ? "Creating..." : "Sign up"}
        </button>
        <div className="mt-3 text-sm text-slate-600">
          Have an account?{" "}
          <Link to="/login" className="text-sky-700">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}
