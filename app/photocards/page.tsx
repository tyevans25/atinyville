"use client"

import { useRouter } from "next/navigation"
import PhotocardGallery from "@/components/PhotocardGallery"

export default function PhotocardsPage() {
  const router = useRouter()
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "#060810", overflowY: "auto", scrollbarWidth: "none" }}>
      <PhotocardGallery onClose={() => router.back()} />
    </div>
  )
}