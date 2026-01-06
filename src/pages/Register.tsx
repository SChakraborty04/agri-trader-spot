import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../lib/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await register(name, email, phone || undefined);
      setMessage(res.message || "Registered");
      navigate("/login");
    } catch (err: any) {
      setMessage(err?.message || String(err));
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl mb-4">Register</h2>
      <form onSubmit={handleRegister} className="space-y-3">
        <div>
          <label className="block text-sm">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2" />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2" />
        </div>
        <div>
          <label className="block text-sm">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border p-2" />
        </div>
        <div>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white">Register</button>
        </div>
        {message && <p className="text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}
