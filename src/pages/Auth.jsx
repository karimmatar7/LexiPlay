import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUser, loginUser } from "../utils/user.js";

export default function AuthPage({ onLogin }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  // Check if user already exists in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("lexiplay_user");
    if (saved) {
      const user = JSON.parse(saved);
      onLogin(user);
      navigate("/menu");
    }
  }, [onLogin, navigate]);

  const handleLogin = async () => {
    if (!name || !pin) return setError("Vul beide velden in");
    const user = await loginUser(name, pin);
    if (!user) return setError("Gebruiker niet gevonden of fout PIN");
    localStorage.setItem("lexiplay_user", JSON.stringify(user));
    onLogin(user);
    navigate("/menu");
  };

  const handleRegister = async () => {
    if (!name || !pin) return setError("Vul beide velden in");
    const user = await createUser(name, pin);
    if (!user) return setError("Registratie mislukt");
    localStorage.setItem("lexiplay_user", JSON.stringify(user));
    onLogin(user);
    navigate("/menu");
  };

  const handleGuest = () => {
    const guest = { id: "guest", name: "Gast", rewards: 0, progress: {} };
    localStorage.setItem("lexiplay_user", JSON.stringify(guest));
    onLogin(guest);
    navigate("/menu");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-200 to-purple-400">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">Welkom bij LexiPlay!</h1>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Naam"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            type="password"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <div className="flex gap-4">
            <button
              onClick={handleLogin}
              className="bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 w-1/2"
            >
              Login
            </button>
            <button
              onClick={handleRegister}
              className="bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 w-1/2"
            >
              Register
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="mb-2 text-gray-500">of</p>
          <button
            onClick={handleGuest}
            className="border border-purple-600 text-purple-600 py-2 px-4 rounded-lg hover:bg-purple-100 transition-colors font-medium"
          >
            Verder gaan als gast
          </button>
        </div>

        {error && (
          <p className="mt-4 text-center text-red-500 font-medium">{error}</p>
        )}
      </div>
    </div>
  );
}
