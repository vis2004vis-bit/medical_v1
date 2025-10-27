import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Upload() {
  const { user, token } = useAuth();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const onUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("username", user?.profile?.email || "anonymous");

      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setResult(res.data);
    } catch (e) {
      console.error("Upload error:", e);
      if (e.response) {
        console.error("Response data:", e.response.data);
        console.error("Response status:", e.response.status);
        console.error("Response headers:", e.response.headers);
        setError(
          e.response.data?.message || `Server error (${e.response.status})`
        );
      } else if (e.request) {
        console.error("Request made but no response:", e.request);
        setError("No response received from server");
      } else {
        console.error("Error setting up request:", e.message);
        setError("Request setup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h2 className="text-2xl font-semibold">Upload X-ray</h2>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="mt-4 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 text-slate-600"
      >
        <div className="text-center">
          <div>Drag and drop X-ray here</div>
          <div className="my-3">or</div>
          <label className="inline-block rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-700">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
            Choose file
          </label>
          {file && (
            <div className="mt-3 text-slate-800">Selected: {file.name}</div>
          )}
        </div>
      </div>
      <button
        onClick={onUpload}
        disabled={loading || !file}
        className="mt-4 rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 disabled:opacity-60"
      >
        {loading ? "Uploading..." : "Upload & Analyze"}
      </button>

      {error && (
        <div className="mt-4 rounded bg-rose-50 p-2 text-rose-700 border border-rose-200">
          {error}
        </div>
      )}
      {result && (
        <div className="mt-6 rounded-xl border bg-white p-6">
          <div className="text-lg font-semibold">Result</div>
          <div className="mt-2 text-slate-700">
            Prediction: {result.prediction}
          </div>
          {"confidence" in result && (
            <div className="text-slate-700">
              Confidence:{" "}
              {typeof result.confidence === "number"
                ? (result.confidence * 100).toFixed(1) + "%"
                : "-"}
            </div>
          )}
          {result.segmentationMapUrl && (
            <img
              src={result.segmentationMapUrl.replace("/public", "")}
              alt="Segmentation"
              className="mt-3 max-h-80 w-full object-contain rounded"
            />
          )}
        </div>
      )}
    </div>
  );
}
