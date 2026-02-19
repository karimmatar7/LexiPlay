import React from "react"
import AvatarCanvas from "./AvatarCanvas"
import { DEFAULT_AVATAR } from "../data/avatarParts"

export default function AvatarDisplay({ avatar, size = 44, name, animated = false }) {
  const av = avatar || DEFAULT_AVATAR
  return (
    <div className="flex items-center gap-2">
      <div
        style={{
          width: size, height: size,
          borderRadius: "50%",
          border: "3px solid white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <AvatarCanvas avatar={av} size={size} animated={animated} />
      </div>
      {name && (
        <span className="font-bold text-sm text-gray-700 leading-none">{name}</span>
      )}
    </div>
  )
}
