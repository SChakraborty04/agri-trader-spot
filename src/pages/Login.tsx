import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOtp, resendOtp } from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await verifyOtp(email, otp);
      setMessage(res.success ? "Logged in" : "Failed to verify");
      navigate("/");
    } catch (err: any) {
      setMessage(err?.message || String(err));
    }
  }

  async function handleResend() {
    try {
      const res = await resendOtp(email);
      setMessage(res.message || "OTP resent");
    } catch (err: any) {
      setMessage(err?.message || String(err));
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl mb-4">Login (Verify OTP)</h2>
      <form onSubmit={handleVerify} className="space-y-3">
        <div>
          <label className="block text-sm">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2" />
        </div>
        <div>
          <label className="block text-sm">OTP</label>
          <input value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full border p-2" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white">Verify</button>
          <button type="button" onClick={handleResend} className="px-4 py-2 bg-gray-200">Resend OTP</button>
        </div>
        {message && <p className="text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}
