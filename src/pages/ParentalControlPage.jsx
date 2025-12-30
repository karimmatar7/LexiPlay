import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getUser, updateParentalControl } from "../utils/user.js"
import NotificationModal from "../components/NotificationModal"

export default function ParentalControlPage({ user, fetchUser }) {
  const [enabled, setEnabled] = useState(false)
  const [dailyLimit, setDailyLimit] = useState(60)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchControl() {
      if (!user?.id) return
      const latestUser = await getUser(user.id)
      const control = latestUser?.parental_control || {}
      setEnabled(control.enabled || false)
      setDailyLimit(control.dailyLimitMinutes || 60)
    }
    fetchControl()
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    await updateParentalControl(user.id, {
      enabled,
      dailyLimitMinutes: dailyLimit,
    })
    if (fetchUser) await fetchUser() // refresh user state
    setSaving(false)
    setShowModal(true)
  }

  return (
    <div className="min-h-screen bg-purple-50 p-6 md:p-8 relative">
      {/* Decorative shapes */}
      <div className="absolute top-12 right-12 w-32 h-32 bg-pink-200 rounded-full opacity-30" />
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-indigo-200 rounded-full opacity-25" />

      <div className="relative max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6 bg-white rounded-3xl p-8 shadow-sm border-4 border-purple-300">
            <span className="text-7xl">👨‍👩‍👧</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4 text-purple-700" style={{ letterSpacing: '-0.02em' }}>
            Ouderlijk Toezicht
          </h1>
          <p className="text-xl text-gray-700 font-medium">
            Beheer de speeltijd van je kind
          </p>
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-3xl shadow-sm border-2 p-8 mb-10 space-y-8">
          {/* Enable Toggle */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="text-4xl">🔒</span>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Toezicht Inschakelen</h3>
                <p className="text-gray-600 mb-4">Activeer ouderlijk toezicht om speeltijd te beperken</p>
                <label className="flex items-center gap-4 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-20 h-10 rounded-full shadow-inner transition-all duration-300 border-2 ${
                      enabled ? 'bg-green-400 border-green-600' : 'bg-gray-300 border-gray-400'
                    }`}>
                      <div className={`absolute top-1 w-8 h-8 bg-white rounded-full shadow-md transition-all duration-300 ${
                        enabled ? 'right-1' : 'left-1'
                      }`} />
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-gray-700">
                    {enabled ? 'Ingeschakeld' : 'Uitgeschakeld'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Daily Limit */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="text-4xl">⏰</span>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Dagelijkse Speeltijd</h3>
                <p className="text-gray-600 mb-4">Stel een limiet in voor het aantal minuten per dag</p>

                <div className="flex items-center gap-4">
                  {/* Slider */}
                  <input
                    type="range"
                    min="0"
                    max="240"
                    step="5"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(Number(e.target.value))}
                    className="flex-1 h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  {/* Number Input */}
                  <input
                    type="number"
                    min="0"
                    max="240"
                    value={dailyLimit}
                    onChange={(e) => {
                      let val = Number(e.target.value)
                      if (val < 0) val = 0
                      if (val > 240) val = 240
                      setDailyLimit(val)
                    }}
                    className="bg-purple-100 border-2 border-purple-400 rounded-xl px-4 py-2 w-24 text-center text-2xl font-bold text-purple-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 text-center group inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-md hover:shadow-lg border-b-4 border-green-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span className="text-2xl">💾</span>
            <span>{saving ? "Opslaan..." : "Opslaan"}</span>
          </button>

          <button
            onClick={() => navigate("/menu")}
            className="flex-1 text-center group inline-flex items-center justify-center gap-3 bg-gray-400 hover:bg-gray-500 text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-md hover:shadow-lg border-b-4 border-gray-600 transform hover:scale-105 transition-all duration-200"
          >
            <span className="text-2xl">🏠</span>
            <span>Terug naar Menu</span>
          </button>
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        message="Instellingen opgeslagen!"
        type="success"
      />
    </div>
  )
}
