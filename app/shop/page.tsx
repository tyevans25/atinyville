"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react"
import Navigation from "@/components/Navigation"

interface Store {
  name: string
  productImage: string
  logo: string
  link: string
}

interface Album {
  id: string
  title: string
  cover: string
  stores: Store[]
}

const albums: Album[] = [
  {
    id: "ghp4",
    title: "GOLDEN HOUR : Part.4",
    cover: "https://i.imgur.com/yERYbjx.jpeg",
    stores: [
      { name: "Target", productImage: "https://target.scene7.com/is/image/Target/GUEST_7f384248-c41e-4c59-b6fa-7a9839d49b13?wid=600&hei=600&qlt=80", logo: "https://toppng.com/uploads/preview/target-logo-11530965454baetvidszx.png", link: "https://www.target.com/p/ateez-golden-hour-part-4-diary-ver-target-exclusive-cd/-/A-95151746#lnk=sametab" },
      { name: "Target", productImage: "https://target.scene7.com/is/image/Target/GUEST_da4fd028-b7bf-4549-aea9-0915bd91960e?wid=600&hei=600&qlt=80", logo: "https://toppng.com/uploads/preview/target-logo-11530965454baetvidszx.png", link: "https://www.target.com/p/ateez-golden-hour-part-4-a-ver-target-exclusive-cd/-/A-95151398#lnk=sametab" },
      { name: "Walmart", productImage: "https://i5.walmartimages.com/seo/ATEEZ-GOLDEN-HOUR-Part-4-DIARY-Ver-Walmart-Exclusive-nbsp-CD_17a88677-1d13-460f-b569-d9677ee7ba1e.fa31635c784c779b5cf7087f6ed7ab2d.jpeg?odnHeight=573&odnWidth=573&odnBg=FFFFFF", logo: "https://toppng.com/uploads/preview/walmart-new-vector-logo-free-download-11574013610ep8hruyeqb.png", link: "https://www.walmart.com/ip/ATEEZ-GOLDEN-HOUR-Part-4-DIARY-Ver-Walmart-Exclusive-nbsp-CD/19218350917" },
      { name: "Hello82", productImage: "https://hello82.com/cdn/shop/files/Photobook_Thumbnail_Signed_Standard-hello82.com_SET_5b1bc373-0065-4cd5-8bc8-e47089e22eb8.jpg?v=1767982261&width=1024", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Hello82.png", link: "https://hello82.com/collections/ateez/products/signed-ateez-golden-hour-part-4" },
      { name: "KQ Shop", productImage: "https://image.static.bstage.in/cdn-cgi/image/metadata=none,dpr=1,f=auto,width=640/ateez/d1e6cc9b-093f-48b6-bd14-abd515e1f69c/57ad57b6-a24a-4a33-96db-e5304b66ccc9/ori.jpg", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/KQ_Entertainment_logo.webp", link: "https://ateez.kqent.com/shop/kr/products/203" },
      { name: "Choice Music LA", productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ_13th_Mini_Album_-_GOLDEN_HOUR_Part_4_Cover.webp?v=1768326026&width=768", logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s", link: "https://choicemusicla.com/products/ateez-13th-mini-album-golden-hour-part-4" },
      { name: "K Place", productImage: "https://kplaceshop.com/cdn/shop/files/ateez-golden-hour-part-4-13th-mini-album-main-image_600x.jpg?v=1768270999", logo: "https://kplaceshop.com/cdn/shop/files/kplace-logo_1200x.png?v=1705380088", link: "https://kplaceshop.com/products/ateez-golden-hour-part-4-13th-mini-album" },
    ]
  },
  {
    id: "atl",
    title: "Ashes to Light",
    cover: "https://i.imgur.com/h8qwLU9.jpeg",
    stores: [
      { name: "Target", productImage: "https://target.scene7.com/is/image/Target/GUEST_84712334-a0d0-42c8-9594-4abfe320b0a3?wid=384&qlt=80", logo: "https://toppng.com/uploads/preview/target-logo-11530965454baetvidszx.png", link: "https://www.target.com/p/ateez-ashes-to-light-target-exclusive-cd/-/A-94948768" },
      { name: "Choice Music LA", productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ_2nd_Full_Japanese_Album_-_Ashes_to_Light_Regular_Edition_Cover_8a5e7a80-6f4c-409e-b82f-01736350e7ab.webp?v=1755560010&width=500", logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s", link: "https://choicemusicla.com/products/ateez-2nd-full-japanese-album-ashes-to-light-regular-edition" },
    ]
  },
  {
    id: "ghp3-iyf",
    title: "GOLDEN HOUR : Part.3 'In Your Fantasy'",
    cover: "https://i.imgur.com/QAfnPX1.jpeg",
    stores: [
      { name: "Target", productImage: "https://target.scene7.com/is/image/Target/GUEST_13596c32-4734-48f8-b3d6-e2a12da5ffdc?wid=1200&hei=1200&qlt=80", logo: "https://toppng.com/uploads/preview/target-logo-11530965454baetvidszx.png", link: "https://www.target.com/p/ateez-golden-hour-part-3-39-in-your-fantasy-edition-39-cd/-/A-94784941" },
      { name: "Hello82", productImage: "https://hello82.com/cdn/shop/files/2-1.hello82_hello82.com.jpg?v=1750709989&width=1920", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Hello82.png", link: "https://hello82.com/products/hello82-ateez-golden-hour-part-4" },
    ]
  },
  {
    id: "ghp3",
    title: "GOLDEN HOUR : Part.3",
    cover: "https://i.imgur.com/VrauSQg_d.jpeg?maxwidth=520&shape=thumb&fidelity=high",
    stores: [
      { name: "Walmart", productImage: "https://i5.walmartimages.com/seo/ATEEZ-GOLDEN-HOUR-PART-3-THIRST-Ver-Walmart-Exclusive-CD_66719a13-9101-42a9-8ff3-c4f323fa2ea9.a5bb9f62521d36f43bc6fe4f994b943a.jpeg?odnHeight=2000&odnWidth=2000&odnBg=FFFFFF", logo: "https://toppng.com/uploads/preview/walmart-new-vector-logo-free-download-11574013610ep8hruyeqb.png", link: "https://www.walmart.com/ip/ATEEZ-GOLDEN-HOUR-PART-3-THIRST-Ver-Walmart-Exclusive-CD/16588800802" },
      { name: "Hello82", productImage: "https://hello82.com/cdn/shop/files/Thumbnail_hello82_hello82.com_SET.jpg?v=1748370651&width=1024", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Hello82.png", link: "https://hello82.com/collections/ateez/products/hello82-ateez-golden-hour-part3" },
      { name: "Choice Music LA", productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ_12th_Mini_Album_-_GOLDEN_HOUR_Part.3_hello82_POP-UP_Exclusive_Cover.webp?v=1748449640&width=768", logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s", link: "https://choicemusicla.com/products/ateez-12th-mini-album-golden-hour-part-3-hello82-pop-up-exclusive" },
    ]
  },
  {
    id: "ghp2",
    title: "GOLDEN HOUR : Part.2",
    cover: "https://i.imgur.com/bm9fjjr_d.jpeg?maxwidth=520&shape=thumb&fidelity=high",
    stores: [
      { name: "Target", productImage: "https://target.scene7.com/is/image/Target/GUEST_b6cfdef3-058b-49fb-a6df-624b91c0d839?wid=600&hei=600&qlt=80", logo: "https://toppng.com/uploads/preview/target-logo-11530965454baetvidszx.png", link: "https://www.target.com/p/ateez-golden-hour-part-2-to-ver-target-exclusive-cd/-/A-93619759" },
      { name: "Hello82", productImage: "https://hello82.com/cdn/shop/files/Cover_2-1_Standard_hello82_SET.jpg?v=1729560429&width=1024", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Hello82.png", link: "https://hello82.com/collections/ateez/products/ateez-golden-hour-part-2-hello82" },
      { name: "Choice Music LA", productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ_11th_Mini_Album_-_GOLDEN_HOUR_Part.2_Cover.webp?v=1729874420&width=768", logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s", link: "https://choicemusicla.com/products/ateez-11th-mini-album-golden-hour-part-2" },
    ]
  },
  {
    id: "ghp1",
    title: "GOLDEN HOUR : Part.1",
    cover: "https://i.imgur.com/i11KQQd_d.jpeg?maxwidth=520&shape=thumb&fidelity=high",
    stores: [
      { name: "KQ Shop", productImage: "https://image.static.bstage.in/cdn-cgi/image/metadata=none,dpr=1,f=auto,width=640/ateez/c95ba46c-9eec-4d36-8b35-faf49ddb6870/f96aa42d-c620-4459-882e-a526e68d1e68/ori.jpg", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/KQ_Entertainment_logo.webp", link: "https://ateez.kqent.com/shop/kr/products/65" },
      { name: "Hello82", productImage: "https://hello82.com/cdn/shop/files/hello82_boxset_ATEEZ-05.jpg?v=1713995863&width=1024", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Hello82.png", link: "https://hello82.com/collections/ateez/products/us-ateez-golden-hour-h82" },
      { name: "Choice Music LA", productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ10thMiniAlbum-GOLDENHOURPart.1.webp?v=1714145431&width=768", logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s", link: "https://choicemusicla.com/products/ateez-10th-mini-album-golden-hour-part-1" },
    ]
  },
]

export default function ShopPage() {
  const [selectedAlbum, setSelectedAlbum]       = useState<Album | null>(null)
  const [currentStoreIndex, setCurrentStoreIndex] = useState(0)
  const [currentAlbumIndex, setCurrentAlbumIndex] = useState(0)

  const openModal  = (album: Album) => { setSelectedAlbum(album); setCurrentStoreIndex(0) }
  const closeModal = () => { setSelectedAlbum(null); setCurrentStoreIndex(0) }
  const nextStore  = () => selectedAlbum && setCurrentStoreIndex(p => (p + 1) % selectedAlbum.stores.length)
  const prevStore  = () => selectedAlbum && setCurrentStoreIndex(p => (p - 1 + selectedAlbum.stores.length) % selectedAlbum.stores.length)
  const nextAlbum  = () => setCurrentAlbumIndex(p => (p + 1) % albums.length)
  const prevAlbum  = () => setCurrentAlbumIndex(p => (p - 1 + albums.length) % albums.length)

  return (
    <>
      <Navigation />
      <div style={{ background: "#0d1117", minHeight: "100vh" }}>

        {/* Background atmosphere */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "8%", left: "20%", width: 600, height: 600, borderRadius: "50%", background: "rgba(31,111,235,0.04)", filter: "blur(120px)" }} />
          <div style={{ position: "absolute", bottom: "15%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "rgba(88,166,255,0.03)", filter: "blur(100px)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", padding: "88px 24px 56px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h1 style={{ color: "white", fontWeight: 900, fontSize: 36, margin: "0 0 8px", letterSpacing: "-0.01em" }}>ATINYTOWN Shop</h1>
            <p style={{ color: "#8b949e", fontSize: 14, margin: 0 }}>Find official ATEEZ albums, merch, and more!</p>
          </div>

          {/* Albums carousel */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ color: "white", fontWeight: 800, fontSize: 20, margin: "0 0 16px" }}>Albums</h2>
            <div style={{ position: "relative" }}>
              <div style={{ overflow: "hidden" }}>
                <div style={{ display: "flex", gap: 14, transition: "transform 0.5s ease-out", transform: `translateX(-${currentAlbumIndex * 274}px)` }}>
                  {albums.map(album => (
                    <div key={album.id} style={{ flexShrink: 0, width: 260 }}>
                      <button
                        onClick={() => openModal(album)}
                        style={{ position: "relative", width: "100%", aspectRatio: "1", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", background: "none", padding: 0, display: "block", transition: "border-color 0.15s, transform 0.15s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.25)"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)" }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)" }}
                      >
                        <img src={album.cover} alt={album.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", opacity: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.15s" }}
                          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = "1"}
                          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = "0"}
                        >
                          <span style={{ color: "white", fontWeight: 700, fontSize: 15 }}>Shop Now</span>
                        </div>
                      </button>
                      <p style={{ color: "#8b949e", fontSize: 11, marginTop: 8, textAlign: "center" }}>{album.title}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Arrows */}
              {[
                { fn: prevAlbum, side: "left", label: <ChevronLeft style={{ width: 20, height: 20 }} />, disabled: currentAlbumIndex === 0 },
                { fn: nextAlbum, side: "right", label: <ChevronRight style={{ width: 20, height: 20 }} />, disabled: currentAlbumIndex >= albums.length - 1 },
              ].map(({ fn, side, label, disabled }) => (
                <button key={side} onClick={fn} disabled={disabled} style={{
                  position: "absolute", [side]: -18, top: "45%", transform: "translateY(-50%)",
                  width: 36, height: 36, borderRadius: "50%",
                  background: "rgba(22,32,56,0.9)", border: "1px solid rgba(255,255,255,0.1)",
                  color: disabled ? "#484f58" : "#8b949e", cursor: disabled ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{label}</button>
              ))}
            </div>
          </div>

          {/* Merch placeholder */}
          <div>
            <h2 style={{ color: "white", fontWeight: 800, fontSize: 20, margin: "0 0 16px" }}>Merch</h2>
            <div style={{ background: "rgba(22,32,56,0.85)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "40px 20px", textAlign: "center" }}>
              <p style={{ color: "#484f58", fontSize: 13, margin: 0 }}>Coming soon...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedAlbum && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", zIndex: 100 }} onClick={closeModal} />
          <div style={{ position: "fixed", inset: 0, zIndex: 101, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, maxWidth: 560, width: "100%", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>

              {/* Modal header */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
                <div>
                  <h2 style={{ color: "white", fontWeight: 800, fontSize: 18, margin: "0 0 4px" }}>{selectedAlbum.title}</h2>
                  <p style={{ color: "#484f58", fontSize: 11, margin: 0 }}>{selectedAlbum.stores.length} listings available</p>
                </div>
                <button onClick={closeModal} style={{ background: "none", border: "none", color: "#484f58", cursor: "pointer", padding: 4 }}><X style={{ width: 18, height: 18 }} /></button>
              </div>

              {/* Modal carousel */}
              <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
                <div style={{ position: "relative" }}>
                  <div style={{ aspectRatio: "1", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", position: "relative" }}>
                    <img src={selectedAlbum.stores[currentStoreIndex].productImage} alt={selectedAlbum.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    {/* Store logo */}
                    <div style={{ position: "absolute", top: 12, right: 12, width: 52, height: 52, background: "white", borderRadius: 10, padding: 6 }}>
                      <img src={selectedAlbum.stores[currentStoreIndex].logo} alt={selectedAlbum.stores[currentStoreIndex].name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    {/* Shop overlay */}
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", opacity: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.15s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = "1"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = "0"}
                    >
                      <a href={selectedAlbum.stores[currentStoreIndex].link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                        style={{ background: "#e6edf3", color: "#0d1117", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 10, display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
                        Shop at {selectedAlbum.stores[currentStoreIndex].name} <ExternalLink style={{ width: 13, height: 13 }} />
                      </a>
                    </div>
                    {/* Arrows */}
                    {selectedAlbum.stores.length > 1 && (
                      <>
                        <button onClick={prevStore} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", background: "rgba(13,17,23,0.85)", border: "1px solid rgba(255,255,255,0.1)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft style={{ width: 16, height: 16 }} /></button>
                        <button onClick={nextStore} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", background: "rgba(13,17,23,0.85)", border: "1px solid rgba(255,255,255,0.1)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight style={{ width: 16, height: 16 }} /></button>
                      </>
                    )}
                  </div>

                  {/* Dots */}
                  {selectedAlbum.stores.length > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 14 }}>
                      {selectedAlbum.stores.map((_, i) => (
                        <button key={i} onClick={() => setCurrentStoreIndex(i)} style={{ width: i === currentStoreIndex ? 22 : 6, height: 6, borderRadius: 3, background: i === currentStoreIndex ? "#58a6ff" : "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.2s" }} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Store name + link */}
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <p style={{ color: "white", fontWeight: 700, fontSize: 15, margin: "0 0 6px" }}>{selectedAlbum.stores[currentStoreIndex].name}</p>
                  <a href={selectedAlbum.stores[currentStoreIndex].link} target="_blank" rel="noopener noreferrer" style={{ color: "#58a6ff", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
                    Visit Store <ExternalLink style={{ width: 11, height: 11 }} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}