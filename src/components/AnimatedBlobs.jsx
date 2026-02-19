import React from "react"

export default function AnimatedBlobs() {
  return (
    <>
      <style>{`
        @keyframes blob-drift {
          0%, 100% { transform: translate(0,0) scale(1); }
          50%  { transform: translate(20px,-16px) scale(1.08); }
        }
      `}</style>

      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          top: "-5%", left: "-8%",
          width: "clamp(180px,35vw,320px)",
          height: "clamp(180px,35vw,320px)",
          background: "radial-gradient(circle, rgba(251,207,232,0.55) 0%, transparent 70%)",
          animation: "blob-drift 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          bottom: "0%", right: "-6%",
          width: "clamp(200px,40vw,380px)",
          height: "clamp(200px,40vw,380px)",
          background: "radial-gradient(circle, rgba(254,240,138,0.45) 0%, transparent 70%)",
          animation: "blob-drift 10s ease-in-out 2s infinite reverse",
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          top: "40%", left: "40%",
          width: "clamp(150px,30vw,280px)",
          height: "clamp(150px,30vw,280px)",
          background: "radial-gradient(circle, rgba(199,210,254,0.35) 0%, transparent 70%)",
          animation: "blob-drift 12s ease-in-out 4s infinite",
        }}
      />
    </>
  )
}
