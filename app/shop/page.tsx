"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

// Test data
const albums: Album[] = [
  {
    id: "ghp4",
    title: "GOLDEN HOUR : Part.4",
    cover: "https://i.imgur.com/yERYbjx.jpeg",
    stores: [
      {
        name: "Target",
        productImage: "https://target.scene7.com/is/image/Target/GUEST_7f384248-c41e-4c59-b6fa-7a9839d49b13?wid=600&hei=600&qlt=80",
        logo: "https://icon2.cleanpng.com/20180202/ldq/avithxb3s.webp",
        link: "https://www.target.com/p/ateez-golden-hour-part-4-diary-ver-target-exclusive-cd/-/A-95151746#lnk=sametab"
      },
      {
        name: "Target",
        productImage: "https://target.scene7.com/is/image/Target/GUEST_da4fd028-b7bf-4549-aea9-0915bd91960e?wid=600&hei=600&qlt=80",
        logo: "https://icon2.cleanpng.com/20180202/ldq/avithxb3s.webp",
        link: "https://www.target.com/p/ateez-golden-hour-part-4-a-ver-target-exclusive-cd/-/A-95151398#lnk=sametab"
      },
      {
        name: "Target",
        productImage: "https://target.scene7.com/is/image/Target/GUEST_7a50ba5c-4df2-425f-8bb6-faa64aefb761?wid=1200&hei=1200&qlt=80",
        logo: "https://icon2.cleanpng.com/20180202/ldq/avithxb3s.webp",
        link: "https://www.target.com/p/ateez-golden-hour-part-4-z-ver-target-exclusive-cd/-/A-95151748"
      },
      {
        name: "Target",
        productImage: "https://target.scene7.com/is/image/Target/GUEST_63a8ccce-669a-46a8-bd74-c9d42f85e117?wid=600&hei=600&qlt=80",
        logo: "https://icon2.cleanpng.com/20180202/ldq/avithxb3s.webp",
        link: "https://www.target.com/p/ateez-golden-hour-part-4-digipack-target-exclusive-cd/-/A-95151752#lnk=sametab"
      },
      {
        name: "Target",
        productImage: "https://target.scene7.com/is/image/Target/GUEST_50086bfb-6b2a-4442-9cd1-fcdb3ad4cfd4?wid=600&hei=600&qlt=80",
        logo: "https://icon2.cleanpng.com/20180202/ldq/avithxb3s.webp",
        link: "https://www.target.com/p/ateez-golden-hour-part-4-pic-disc-target-exclusive-vinyl/-/A-95151802#lnk=sametab"
      },
      {
        name: "Target",
        productImage: "https://target.scene7.com/is/image/Target/GUEST_9e8aa5d7-404b-4baf-9a67-798250293b09?wid=600&hei=600&qlt=80",
        logo: "https://icon2.cleanpng.com/20180202/ldq/avithxb3s.webp",
        link: "https://www.target.com/p/ateez-tiny-vinyl-edition-single-target-exclusive-vinyl-4-inch/-/A-95186430?preselect=95151991#lnk=sametab"
      },
      {
        name: "Target",
        productImage: "https://target.scene7.com/is/image/Target/GUEST_5c92df6b-4cc4-4b16-b314-daef9c48a68b?wid=600&hei=600&qlt=80",
        logo: "https://icon2.cleanpng.com/20180202/ldq/avithxb3s.webp",
        link: "https://www.target.com/p/ateez-tiny-vinyl-edition-single-target-exclusive-vinyl-4-inch/-/A-95186430?preselect=95152046#lnk=sametab"
      },
      {
        name: "Walmart",
        productImage: "https://i5.walmartimages.com/seo/ATEEZ-GOLDEN-HOUR-Part-4-DIARY-Ver-Walmart-Exclusive-nbsp-CD_17a88677-1d13-460f-b569-d9677ee7ba1e.fa31635c784c779b5cf7087f6ed7ab2d.jpeg?odnHeight=573&odnWidth=573&odnBg=FFFFFF",
        logo: "https://toppng.com/uploads/preview/walmart-new-vector-logo-free-download-11574013610ep8hruyeqb.png",
        link: "https://www.walmart.com/ip/ATEEZ-GOLDEN-HOUR-Part-4-DIARY-Ver-Walmart-Exclusive-nbsp-CD/19218350917?classType=REGULAR&athbdg=L1600&from=/search"
      },
      {
        name: "Walmart",
        productImage: "https://i5.walmartimages.com/seo/ATEEZ-GOLDEN-HOUR-Part-4-A-Ver-Walmart-Exclusive-CD_46dabe41-6192-49b0-a1ce-c70633e18134.c664df0f6d1893f31393f1b94ae5317e.jpeg?odnHeight=573&odnWidth=573&odnBg=FFFFFF",
        logo: "https://toppng.com/uploads/preview/walmart-new-vector-logo-free-download-11574013610ep8hruyeqb.png",
        link: "https://www.walmart.com/ip/ATEEZ-GOLDEN-HOUR-Part-4-A-Ver-Walmart-Exclusive-CD/19167909250?classType=REGULAR&athbdg=L1600&from=/search"
      },
      {
        name: "Walmart",
        productImage: "https://i5.walmartimages.com/seo/ATEEZ-GOLDEN-HOUR-Part-4-Z-Ver-Walmart-Exclusive-nbsp-CD_496220b3-c1e7-4269-a092-bdc4a80e4c87.59c883b8fa3cb6629c3aab0324c2fe57.jpeg?odnHeight=573&odnWidth=573&odnBg=FFFFFF",
        logo: "https://toppng.com/uploads/preview/walmart-new-vector-logo-free-download-11574013610ep8hruyeqb.png",
        link: "https://www.walmart.com/ip/ATEEZ-GOLDEN-HOUR-Part-4-Z-Ver-Walmart-Exclusive-nbsp-CD/19191571157?classType=REGULAR&athbdg=L1600&from=/search"
      },
      {
        name: "Walmart",
        productImage: "https://i5.walmartimages.com/seo/ATEEZ-GOLDEN-HOUR-Part-4-Digipack-Walmart-Exclusive-nbsp-CD_cd69f046-d5e6-496c-9c5a-ffc8e5ab6da0.ef84bb5073dcbc3ccc1ecfbb2786b081.jpeg?odnHeight=573&odnWidth=573&odnBg=FFFFFF",
        logo: "https://toppng.com/uploads/preview/walmart-new-vector-logo-free-download-11574013610ep8hruyeqb.png",
        link: "https://www.walmart.com/ip/ATEEZ-GOLDEN-HOUR-Part-4-Digipack-Walmart-Exclusive-nbsp-CD/19232202656?classType=REGULAR&athbdg=L1600&from=/search"
      },
      {
        name: "Walmart",
        productImage: "https://i5.walmartimages.com/seo/ATEEZ-GOLDEN-HOUR-Part-4-Vinyl-4-Walmart-Exclusive-Vinyl_f59af090-7f17-4f28-a67e-0359a0f7d5f7.8573e559aa4b5e3d6714d38d2708cd5d.jpeg?odnHeight=573&odnWidth=573&odnBg=FFFFFF",
        logo: "https://toppng.com/uploads/preview/walmart-new-vector-logo-free-download-11574013610ep8hruyeqb.png",
        link: "https://www.walmart.com/ip/ATEEZ-GOLDEN-HOUR-Part-4-Vinyl-4-Walmart-Exclusive-Vinyl/19228713241?classType=REGULAR&athbdg=L1600&from=/search"
      },
      {
        name: "KQ Shop",
        productImage: "https://image.static.bstage.in/cdn-cgi/image/metadata=none,dpr=1,f=auto,width=640/ateez/d1e6cc9b-093f-48b6-bd14-abd515e1f69c/57ad57b6-a24a-4a33-96db-e5304b66ccc9/ori.jpg",
        logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/KQ_Entertainment_logo.webp",
        link: "https://ateez.kqent.com/shop/kr/products/203"
      },
      {
        name: "KQ Shop",
        productImage: "https://image.static.bstage.in/cdn-cgi/image/metadata=none,dpr=1,f=auto,width=640/ateez/dea14100-3e72-4fd3-9303-67a3201448c0/072b473d-4b13-458d-8375-783ba2ccac0f/ori.jpg",
        logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/KQ_Entertainment_logo.webp",
        link: "https://ateez.kqent.com/shop/kr/products/202"
      },
      {
        name: "KQ Shop",
        productImage: "https://image.static.bstage.in/cdn-cgi/image/metadata=none,dpr=1,f=auto,width=640/ateez/abd9a328-6192-4f3b-805e-90d0e73492e3/a2e23a8a-9dbe-45c9-aa01-0562e0339a84/ori.png",
        logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/KQ_Entertainment_logo.webp",
        link: "https://ateez.kqent.com/shop/kr/products/205"
      },
      {
        name: "Hello82",
        productImage: "https://hello82.com/cdn/shop/files/Photobook_Thumbnail_Signed_Standard-hello82.com_SET_5b1bc373-0065-4cd5-8bc8-e47089e22eb8.jpg?v=1767982261&width=1024",
        logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Hello82.png",
        link: "https://hello82.com/collections/ateez/products/signed-ateez-golden-hour-part-4?_pos=8&_fid=dee3981ee&_ss=c"
      },
      {
        name: "Hello82",
        productImage: "https://hello82.com/cdn/shop/files/Photobook_2-1_ATEEZ-GOLDENHOURPart.4_Thumbnail_hello82_hello82.com_SET.jpg?v=1768269853&width=1920",
        logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Hello82.png",
        link: "https://hello82.com/products/hello82-ateez-golden-hour-part-4?srsltid=AfmBOoqMnMtp5Qiny68KZwL5QuPv-HJq5COmVaxY1yb_OKliX_VPbXTI"
      },
      {
        name: "Hello82",
        productImage: "https://hello82.com/cdn/shop/files/Digipack_Thumbnail_Signed_Standard-hello82.com_SET.jpg?v=1767983813&width=1024",
        logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Hello82.png",
        link: "https://hello82.com/collections/ateez/products/signed-ateez-golden-hour-part-4-digipack?_pos=6&_fid=dee3981ee&_ss=c"
      },
      {
        name: "Hello82",
        productImage: "https://hello82.com/cdn/shop/files/Digipack_Thumbnail_hello82_Exclusive-hello82.com_SET.jpg?v=1767984425&width=1024",
        logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Hello82.png",
        link: "https://hello82.com/collections/ateez/products/hello82-ateez-golden-hour-part-4-digipack?_pos=5&_fid=dee3981ee&_ss=c"
      },
      {
        name: "Hello82",
        productImage: "https://hello82.com/cdn/shop/files/Vinyl_1_ATEEZ-GOLDENHOURPart.4_Thumbnail_hello82.jpg?v=1768251025&width=1024",
        logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Hello82.png",
        link: "https://hello82.com/collections/ateez/products/hello82-ateez-golden-hour-part-4-vinyl?_pos=4&_fid=dee3981ee&_ss=c"
      },
      {
        name: "Choice Music LA",
        productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ_13th_Mini_Album_-_GOLDEN_HOUR_Part_4_Cover.webp?v=1768326026&width=768",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s",
        link: "https://choicemusicla.com/products/ateez-13th-mini-album-golden-hour-part-4"
      },
      {
        name: "Choice Music LA",
        productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ_13th_Mini_Album_-_GOLDEN_HOUR_Part_4_hello82_POP-UP_Exclusive_Cover.webp?v=1768326026&width=768",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s",
        link: "https://choicemusicla.com/products/ateez-13th-mini-album-golden-hour-part-4-hello82-pop-up-exclusive"
      },
      {
        name: "Choice Music LA",
        productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ_13th_Mini_Album_-_GOLDEN_HOUR_Part_4_Poca_Album_Ver._cover.webp?v=1768326026&width=768",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s",
        link: "https://choicemusicla.com/products/ateez-13th-mini-album-golden-hour-part-4-poca-album-ver-toktoq-photocard"
      },
      {
        name: "Choice Music LA",
        productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ_13th_Mini_Album_-_GOLDEN_HOUR_Part_4_Digipack_Ver._Cover.webp?v=1768326057&width=768",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s",
        link: "https://choicemusicla.com/products/ateez-13th-mini-album-golden-hour-part-4-digipack-ver-applemusic-photocard"
      },
      {
        name: "Choice Music LA",
        productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ_13th_Mini_Album_-_GOLDEN_HOUR_Part_4_Vinyl_hello82_POP-UP_Exclusive_Cover.webp?v=1768331356&width=768",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s",
        link: "https://choicemusicla.com/products/ateez-13th-mini-album-golden-hour-part-4-vinyl-hello82-pop-up-exclusive"
      },
      {
        name: "K Place",
        productImage: "https://kplaceshop.com/cdn/shop/files/ateez-golden-hour-part-4-13th-mini-album-main-image_600x.jpg?v=1768270999",
        logo: "https://kplaceshop.com/cdn/shop/files/kplace-logo_1200x.png?v=1705380088",
        link: "https://kplaceshop.com/products/ateez-golden-hour-part-4-13th-mini-album?variant=52866675835198"
      },
      {
        name: "K Place",
        productImage: "https://kplaceshop.com/cdn/shop/files/ateez-golden-hour-part-4-13th-mini-album-pop-up-exclusive-ver-main-image_600x.jpg?v=1768275957",
        logo: "https://kplaceshop.com/cdn/shop/files/kplace-logo_1200x.png?v=1705380088",
        link: "https://kplaceshop.com/products/ateez-golden-hour-part-4-13th-mini-album-pop-up-exclusive-ver?variant=52866977792318"
      },
      {
        name: "K Place",
        productImage: "https://kplaceshop.com/cdn/shop/files/ateez-golden-hour-part-4-13th-mini-album-digipack-pop-up-ver-main-image_600x.jpg?v=1768276622",
        logo: "https://kplaceshop.com/cdn/shop/files/kplace-logo_1200x.png?v=1705380088",
        link: "https://kplaceshop.com/products/ateez-golden-hour-part-4-13th-mini-album-digipack-pop-up-ver?variant=52866997715262"
      },
      {
        name: "K Place",
        productImage: "https://kplaceshop.com/cdn/shop/files/ateez-golden-hour-part-4-13th-mini-album-digipack-ver-main-image_600x.jpg?v=1768272585",
        logo: "https://kplaceshop.com/cdn/shop/files/kplace-logo_1200x.png?v=1705380088",
        link: "https://kplaceshop.com/products/ateez-golden-hour-part-4-13th-mini-album-digipack-ver?variant=52866843967806"
      },
      {
        name: "K Place",
        productImage: "https://kplaceshop.com/cdn/shop/files/ateez-golden-hour-part-4-13th-mini-album-vinyl-pop-up-ver-main-image_600x.jpg?v=1768277048",
        logo: "https://kplaceshop.com/cdn/shop/files/kplace-logo_1200x.png?v=1705380088",
        link: "https://kplaceshop.com/products/ateez-golden-hour-part-4-13th-mini-album-vinyl-pop-up-ver"
      }
    ]
  },
  {
    id: "atl",
    title: "Ashes to Light",
    cover: "https://i.imgur.com/h8qwLU9.jpeg",
    stores: [
      {
        name: "Target",
        productImage: "https://target.scene7.com/is/image/Target/GUEST_84712334-a0d0-42c8-9594-4abfe320b0a3?wid=384&qlt=80",
        logo: "https://icon2.cleanpng.com/20180202/ldq/avithxb3s.webp",
        link: "https://target.scene7.com/is/image/Target/GUEST_84712334-a0d0-42c8-9594-4abfe320b0a3?wid=384&qlt=80"
      },
      {
        name: "Walmart",
        productImage: "https://i5.walmartimages.com/seo/Ateez-Ashes-to-Light-CD_b6e998ee-2f62-4f04-8ec9-ad047458679a.bcb474a7b706b49a4c238e1fe3900d26.jpeg?odnHeight=2000&odnWidth=2000&odnBg=FFFFFF",
        logo: "https://toppng.com/uploads/preview/walmart-new-vector-logo-free-download-11574013610ep8hruyeqb.png",
        link: "https://www.walmart.com/ip/Ateez-Ashes-to-Light-CD/17441452306?classType=REGULAR&from=/search"
      },
      {
        name: "Choice Music LA",
        productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ_2nd_Full_Japanese_Album_-_Ashes_to_Light_Regular_Edition_Cover_8a5e7a80-6f4c-409e-b82f-01736350e7ab.webp?v=1755560010&width=500",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s",
        link: "https://choicemusicla.com/products/ateez-2nd-full-japanese-album-ashes-to-light-regular-edition?_pos=5&_sid=24c96a39b&_ss=r"
      },
      {
        name: "Choice Music LA",
        productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ_2nd_Full_Japanese_Album_-_Ashes_to_Light_Flash_Price_Edition_Cover_7c3a0fbf-769f-4e70-a3ad-809bc92ace21.webp?v=1755560009&width=500",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s",
        link: "https://choicemusicla.com/products/ateez-2nd-full-japanese-album-ashes-to-light-flash-price-edition?_pos=4&_sid=24c96a39b&_ss=r"
      },
      {
        name: "Choice Music LA",
        productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ_2nd_Full_Japanese_Album_-_Ashes_to_Light_Limited_Edition_Cover_24e78997-908a-416f-83d6-bbe046ac9df8.webp?v=1755560009&width=500",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s",
        link: "https://choicemusicla.com/products/ateez-2nd-full-japanese-album-ashes-to-light-limited-edition?_pos=3&_sid=24c96a39b&_ss=r"
      },
      {
        name: "K Place",
        productImage: "https://kplaceshop.com/cdn/shop/files/ateez-ashes-to-light-2nd-jp-album-regular-edition-main-image_600x.jpg?v=1755106869",
        logo: "https://kplaceshop.com/cdn/shop/files/kplace-logo_1200x.png?v=1705380088",
        link: "https://kplaceshop.com/products/ateez-ashes-to-light-2nd-jp-album-regular-edition?variant=52015288385854&country=US&currency=USD&utm_medium=product_sync&utm_source=google&utm_content=sag_organic&utm_campaign=sag_organic&srsltid=AfmBOoonPgfNBQetg-RBoO18fIT-XEnd57THv1ZmZg4TLQwY6FoQJ_6Z5tU"
      }
    ]
  },
  {
    id: "ghp3-iyf",
    title: "GOLDEN HOUR : Part.3 'In Your Fantasy' Edition",
    cover: "https://i.imgur.com/QAfnPX1.jpeg",
    stores: [{
      name: "Target",
      productImage: "https://target.scene7.com/is/image/Target/GUEST_13596c32-4734-48f8-b3d6-e2a12da5ffdc?wid=1200&hei=1200&qlt=80",
      logo: "https://icon2.cleanpng.com/20180202/ldq/avithxb3s.webp",
      link: "https://www.target.com/p/ateez-golden-hour-part-3-39-in-your-fantasy-edition-39-cd/-/A-94784941#lnk=sametab"
    },
    {
      name: "Walmart",
      productImage: "https://i5.walmartimages.com/seo/ATEEZ-GOLDEN-HOUR-Part-3-In-Your-Fantasy-Edition-Walmart-Exclusive-CD_83f1ebcf-7571-4b71-815c-f51a980f8a7b.ca94580dd5c83a38b7d1ba3399536754.jpeg?odnHeight=573&odnWidth=573&odnBg=FFFFFF",
      logo: "https://toppng.com/uploads/preview/walmart-new-vector-logo-free-download-11574013610ep8hruyeqb.png",
      link: "https://www.walmart.com/ip/ATEEZ-GOLDEN-HOUR-Part-3-In-Your-Fantasy-Edition-Walmart-Exclusive-CD/17044911123?classType=REGULAR&from=/search"
    },
    {
      name: "Hello82",
      productImage: "https://hello82.com/cdn/shop/files/2-1.hello82_hello82.com.jpg?v=1750709989&width=1920",
      logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Hello82.png",
      link: "https://hello82.com/products/hello82-ateez-golden-hour-part-4?srsltid=AfmBOoqMnMtp5Qiny68KZwL5QuPv-HJq5COmVaxY1yb_OKliX_VPbXTI"
    },
    {
      name: "Choice Music LA",
      productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ_12th_Mini_Album_-_GOLDEN_HOUR_Part.3_In_Your_Fantasy_Edition_hello82_POP-UP_Exclusive_Cover.webp?v=1750952082&width=768",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s",
      link: "https://choicemusicla.com/products/ateez-12th-mini-album-golden-hour-part-3-in-your-fantasy-edition-hello82-pop-up-exclusive?_pos=26&_sid=6190b472e&_ss=r"
    },
    {
      name: "K Place",
      productImage: "https://kplaceshop.com/cdn/shop/files/ateez-golden-hour-part-3-in-your-fantasy-12th-mini-album-pop-up-exclusive-ver-main-image_600x.jpg?v=1750814111",
      logo: "https://kplaceshop.com/cdn/shop/files/kplace-logo_1200x.png?v=1705380088",
      link: "https://kplaceshop.com/products/ateez-golden-hour-part-3-in-your-fantasy-edition-12th-mini-album-pop-up-exclusive-ver"
    }
    ]
  },
  {
    id: "ghp3",
    title: "GOLDEN HOUR : Part.3",
    cover: "https://i.imgur.com/VrauSQg_d.jpeg?maxwidth=520&shape=thumb&fidelity=high",
    stores: [
      {
        name: "Walmart",
        productImage: "https://i5.walmartimages.com/seo/ATEEZ-GOLDEN-HOUR-PART-3-THIRST-Ver-Walmart-Exclusive-CD_66719a13-9101-42a9-8ff3-c4f323fa2ea9.a5bb9f62521d36f43bc6fe4f994b943a.jpeg?odnHeight=2000&odnWidth=2000&odnBg=FFFFFF",
        logo: "https://toppng.com/uploads/preview/walmart-new-vector-logo-free-download-11574013610ep8hruyeqb.png",
        link: "https://www.walmart.com/ip/ATEEZ-GOLDEN-HOUR-PART-3-THIRST-Ver-Walmart-Exclusive-CD/16588800802?classType=REGULAR&from=/search"
      },
      {
        name: "Hello82",
        productImage: "https://hello82.com/cdn/shop/files/Thumbnail_hello82_hello82.com_SET.jpg?v=1748370651&width=1024",
        logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Hello82.png",
        link: "https://hello82.com/collections/ateez/products/hello82-ateez-golden-hour-part3?_pos=20&_fid=dee3981ee&_ss=c"
      },
      {
        name: "Choice Music LA",
        productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ_12th_Mini_Album_-_GOLDEN_HOUR_Part.3_hello82_POP-UP_Exclusive_Cover.webp?v=1748449640&width=768",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s",
        link: "https://choicemusicla.com/products/ateez-12th-mini-album-golden-hour-part-3-hello82-pop-up-exclusive?_pos=14&_sid=6190b472e&_ss=r"
      },
      {
        name: "Choice Music LA",
        productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ_12th_Mini_Album_-_GOLDEN_HOUR_Part.3_Poca_Album_Cover.webp?v=1748447609&width=768",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s",
        link: "https://choicemusicla.com/products/ateez-12th-mini-album-golden-hour-part-3-poca-album?_pos=10&_sid=6190b472e&_ss=r"
      },
      {
        name: "K Place",
        productImage: "https://kplaceshop.com/cdn/shop/files/ateez-golden-hour-part-3-12th-mini-album-pop-up-exclusive-heat-ver_600x.jpg?v=1748412275",
        logo: "https://kplaceshop.com/cdn/shop/files/kplace-logo_1200x.png?v=1705380088",
        link: "https://kplaceshop.com/products/ateez-golden-hour-part-3-12th-mini-album-pop-up-exclusive-ver?variant=51772222669118"
      }
    ]
  },
  {
    id: "ghp2",
    title: "GOLDEN HOUR : Part.2",
    cover: "https://i.imgur.com/bm9fjjr_d.jpeg?maxwidth=520&shape=thumb&fidelity=high",
    stores: [
      {
        name: "Target",
        productImage: "https://target.scene7.com/is/image/Target/GUEST_b6cfdef3-058b-49fb-a6df-624b91c0d839?wid=600&hei=600&qlt=80",
        logo: "https://icon2.cleanpng.com/20180202/ldq/avithxb3s.webp",
        link: "https://www.target.com/p/ateez-golden-hour-part-2-to-ver-target-exclusive-cd/-/A-93619759#lnk=sametab"
      },
      {
        name: "Walmart",
        productImage: "https://i5.walmartimages.com/seo/ATEEZ-GOLDEN-HOUR-PART-2-TO-Ver-Walmart-Exclusive-CD_ed96cc21-9958-4d30-bbe0-538e5b5b2e98.d799bed8e15b1ceab5785d8ade23053f.jpeg?odnHeight=573&odnWidth=573&odnBg=FFFFFF",
        logo: "https://toppng.com/uploads/preview/walmart-new-vector-logo-free-download-11574013610ep8hruyeqb.png",
        link: "https://www.walmart.com/ip/ATEEZ-GOLDEN-HOUR-PART-2-TO-Ver-Walmart-Exclusive-CD/13405452346?classType=REGULAR&from=/search"
      },
      {
        name: "Walmart",
        productImage: "https://i5.walmartimages.com/seo/ATEEZ-GOLDEN-HOUR-PART-2-FOR-Ver-Walmart-Exclusive-CD_3676ff27-5367-4d28-a6de-5d674fcdae0d.419c0e477f6339cb87e74783da0e1f88.jpeg?odnHeight=573&odnWidth=573&odnBg=FFFFFF",
        logo: "https://toppng.com/uploads/preview/walmart-new-vector-logo-free-download-11574013610ep8hruyeqb.png",
        link: "https://www.walmart.com/ip/ATEEZ-GOLDEN-HOUR-PART-2-FOR-Ver-Walmart-Exclusive-CD/13422270931?classType=REGULAR&from=/search"
      },
      {
        name: "Walmart",
        productImage: "https://i5.walmartimages.com/seo/ATEEZ-GOLDEN-HOUR-PART-2-DIARY-Ver-Walmart-Exclusive-CD_19dc698e-75d4-4394-92ad-25a86c58c848.424015d85afff1ea28d64c5d6605e9db.jpeg?odnHeight=573&odnWidth=573&odnBg=FFFFFF",
        logo: "https://toppng.com/uploads/preview/walmart-new-vector-logo-free-download-11574013610ep8hruyeqb.png",
        link: "https://www.walmart.com/ip/ATEEZ-GOLDEN-HOUR-PART-2-DIARY-Ver-Walmart-Exclusive-CD/13410358956?classType=REGULAR&from=/search"
      },
      {
        name: "Walmart",
        productImage: "https://i5.walmartimages.com/seo/ATEEZ-GOLDEN-HOUR-PART-2-11th-EP-Album-POCAALBUM-FOR-Version_bc4c76a6-8033-4dc5-9e3f-d65f94671705.63de2f4a9f1cd741f168882f79683e94.jpeg?odnHeight=2000&odnWidth=2000&odnBg=FFFFFF",
        logo: "https://toppng.com/uploads/preview/walmart-new-vector-logo-free-download-11574013610ep8hruyeqb.png",
        link: "https://www.walmart.com/ip/ATEEZ-GOLDEN-HOUR-PART-2-11th-EP-Album-POCAALBUM-FOR-Version/14247113040?classType=REGULAR&from=/search"
      },
      {
        name: "Hello82",
        productImage: "https://hello82.com/cdn/shop/files/Cover_2-1_Standard_hello82_SET.jpg?v=1729560429&width=1024",
        logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Hello82.png",
        link: "https://hello82.com/collections/ateez/products/ateez-golden-hour-part-2-hello82?_pos=24&_fid=dee3981ee&_ss=c"
      },
      {
        name: "Choice Music LA",
        productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ_11th_Mini_Album_-_GOLDEN_HOUR_Part.2_Cover.webp?v=1729874420&width=768",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s",
        link: "https://choicemusicla.com/products/ateez-11th-mini-album-golden-hour-part-2?_pos=13&_sid=6bc554b2e&_ss=r"
      },
      {
        name: "Choice Music LA",
        productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ_11th_Mini_Album_-_GOLDEN_HOUR_Part.2_Digipack_Ver._Cover.webp?v=1731023528&width=768",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s",
        link: "https://choicemusicla.com/products/ateez-11th-mini-album-golden-hour-part-2-digipack-ver?_pos=12&_sid=6bc554b2e&_ss=r"
      },
      {
        name: "K Place",
        productImage: "https://kplaceshop.com/cdn/shop/files/ateez-golden-hour-part-2-11th-mini-album-pop-up-exclusive-ver-to_600x.jpg?v=1744755433",
        logo: "https://kplaceshop.com/cdn/shop/files/kplace-logo_1200x.png?v=1705380088",
        link: "https://kplaceshop.com/products/ateez-golden-hour-part-2-11th-mini-album-pop-up-exclusive-ver?variant=50670351483198"
      }
    ]
  },
  {
    id: "ghp1",
    title: "GOLDEN HOUR : Part.1",
    cover: "https://i.imgur.com/i11KQQd_d.jpeg?maxwidth=520&shape=thumb&fidelity=high",
    stores: [

      {
        name: "KQ Shop",
        productImage: "https://image.static.bstage.in/cdn-cgi/image/metadata=none,dpr=1,f=auto,width=640/ateez/c95ba46c-9eec-4d36-8b35-faf49ddb6870/f96aa42d-c620-4459-882e-a526e68d1e68/ori.jpg",
        logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/KQ_Entertainment_logo.webp",
        link: "https://ateez.kqent.com/shop/kr/products/65"
      },
      {
        name: "KQ Shop",
        productImage: "https://image.static.bstage.in/cdn-cgi/image/metadata=none,dpr=1,f=auto,width=640/ateez/935f687f-fc16-49a4-bbb7-b5ea260493b1/7e9fc975-b647-45d2-a38f-95bb0243b5d3/ori.jpg",
        logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/KQ_Entertainment_logo.webp",
        link: "https://ateez.kqent.com/shop/kr/products/72"
      },
      {
        name: "KQ Shop",
        productImage: "https://image.static.bstage.in/cdn-cgi/image/metadata=none,dpr=1,f=auto,width=640/ateez/c6ae7079-2b93-4050-9047-73a4d2bea560/126640d2-b1aa-4432-9c36-d97806782916/ori.jpg",
        logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/KQ_Entertainment_logo.webp",
        link: "https://ateez.kqent.com/shop/kr/products/71"
      },
      {
        name: "KQ Shop",
        productImage: "https://image.static.bstage.in/cdn-cgi/image/metadata=none,dpr=1,f=auto,width=640/ateez/6f436344-d2a1-41e5-b72d-0e6953199e65/6364bf29-2c13-413f-8676-b4fc032227d0/ori.jpg",
        logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/KQ_Entertainment_logo.webp",
        link: "https://ateez.kqent.com/shop/kr/products/69"
      },
      {
        name: "KQ Shop",
        productImage: "https://image.static.bstage.in/cdn-cgi/image/metadata=none,dpr=1,f=auto,width=640/ateez/4b91a8bc-1511-433d-8b91-f1afc87e6fa1/9034bacf-ca40-40d4-b857-eff910ed07f2/ori.jpg",
        logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/KQ_Entertainment_logo.webp",
        link: "https://ateez.kqent.com/shop/kr/products/68"
      },
      {
        name: "KQ Shop",
        productImage: "https://image.static.bstage.in/cdn-cgi/image/metadata=none,dpr=1,f=auto,width=640/ateez/d2efd165-93f0-44fb-b74d-e201e3d693d0/363b59ce-1e9d-4cbc-b038-458f5447ca0e/ori.jpg",
        logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/KQ_Entertainment_logo.webp",
        link: "https://ateez.kqent.com/shop/kr/products/70"
      },
      {
        name: "Hello82",
        productImage: "https://hello82.com/cdn/shop/files/hello82_boxset_ATEEZ-05.jpg?v=1713995863&width=1024",
        logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Hello82.png",
        link: "https://hello82.com/collections/ateez/products/us-ateez-golden-hour-h82?_pos=29&_fid=dee3981ee&_ss=c"
      },
      {
        name: "Choice Music LA",
        productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ10thMiniAlbum-GOLDENHOURPart.1.webp?v=1714145431&width=768",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s",
        link: "https://choicemusicla.com/products/ateez-10th-mini-album-golden-hour-part-1?_pos=13&_sid=91321ce5a&_ss=r&variant=43498702799024"
      },
      {
        name: "Choice Music LA",
        productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ10thMiniAlbum-GOLDENHOURPart.1_U.S.Ver._Cover.webp?v=1714409133&width=731",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s",
        link: "https://choicemusicla.com/products/ateez-10th-mini-album-golden-hour-part-1-u-s-ver?_pos=16&_sid=91321ce5a&_ss=r&variant=43499793809584"
      },
      {
        name: "Choice Music LA",
        productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ10thMiniAlbum-GOLDENHOURPart.1.webp?v=1714145431&width=768",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s",
        link: "https://choicemusicla.com/products/ateez-10th-mini-album-golden-hour-part-1?_pos=13&_sid=91321ce5a&_ss=r&variant=43498702799024"
      },
      {
        name: "Choice Music LA",
        productImage: "https://choicemusicla.com/cdn/shop/files/ATEEZ10thMiniAlbum-GOLDENHOURPart.1_DigipackVer._U.S.Ver._Cover.webp?v=1715878981&width=768",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5PCmStI20GnqL-YXKJ1GfjjUpn_rg94p68w&s",
        link: "https://choicemusicla.com/products/ateez-10th-mini-album-golden-hour-part-1-digipack-ver-u-s-ver?_pos=39&_sid=9b1573fef&_ss=r"
      },
      {
        name: "K Place",
        productImage: "https://kplaceshop.com/cdn/shop/files/ateez-golden-hour-part-1-10th-mini-album-blue-hour-version-main-image_600x.jpg?v=1744758056",
        logo: "https://kplaceshop.com/cdn/shop/files/kplace-logo_1200x.png?v=1705380088",
        link: "https://kplaceshop.com/products/ateez-golden-hour-part-1-10th-mini-album?variant=49503215452478"
      }
    ]
  },
  {
    id: "ghp1",
    title: "GOLDEN HOUR : Part.1",
    cover: "https://via.placeholder.com/300x300/ff69b4/000000?text=GHP1",
    stores: []
  }
]

export default function ShopPage() {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [currentStoreIndex, setCurrentStoreIndex] = useState(0)
  const [currentAlbumIndex, setCurrentAlbumIndex] = useState(0)

  const openAlbumModal = (album: Album) => {
    setSelectedAlbum(album)
    setCurrentStoreIndex(0)
  }

  const closeModal = () => {
    setSelectedAlbum(null)
    setCurrentStoreIndex(0)
  }

  const nextStore = () => {
    if (selectedAlbum) {
      setCurrentStoreIndex((prev) =>
        prev === selectedAlbum.stores.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevStore = () => {
    if (selectedAlbum) {
      setCurrentStoreIndex((prev) =>
        prev === 0 ? selectedAlbum.stores.length - 1 : prev - 1
      )
    }
  }

  const nextAlbum = () => {
    setCurrentAlbumIndex((prev) =>
      prev === albums.length - 1 ? 0 : prev + 1
    )
  }

  const prevAlbum = () => {
    setCurrentAlbumIndex((prev) =>
      prev === 0 ? albums.length - 1 : prev - 1
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 pt-24 px-4">
        <div className="container mx-auto max-w-6xl space-y-12">

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-white glow-text">
              ATINYTOWN Shop
            </h1>
            <p className="text-gray-300">
              Find official ATEEZ albums, merch, and more!
            </p>
          </div>

          {/* Albums Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Albums</h2>
            <div className="relative">
              {/* Carousel Container */}
              <div className="overflow-hidden">
                <div
                  className="flex gap-4 transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentAlbumIndex * 280}px)` }}
                >
                  {albums.map((album) => (
                    <div
                      key={album.id}
                      className="flex-shrink-0"
                      style={{ width: '260px' }}
                    >
                      <button
                        onClick={() => openAlbumModal(album)}
                        className="group relative w-full aspect-square rounded-lg overflow-hidden border-2 border-white/20 hover:border-white/50 transition-all hover:scale-105"
                      >
                        <img
                          src={album.cover}
                          alt={album.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Image failed to load:', album.cover)
                            e.currentTarget.src = 'https://via.placeholder.com/300x300/1a1a1a/ffffff?text=Album+Cover'
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white font-bold text-center px-4">
                            Shop Now
                          </p>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              {albums.length > 1 && (
                <>
                  <button
                    onClick={prevAlbum}
                    disabled={currentAlbumIndex === 0}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white transition z-10 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextAlbum}
                    disabled={currentAlbumIndex >= albums.length - 1}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white transition z-10 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </section>

          {/* Other Categories - Placeholder */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Merch</h2>
            <div className="glass-card p-8 text-center">
              <p className="text-gray-400">Coming soon...</p>
            </div>
          </section>

        </div>
      </div>

      {/* Modal */}
      {selectedAlbum && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-gray-900 border border-white/20 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedAlbum.title}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {selectedAlbum.stores.length} available
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Carousel */}
              <div className="p-6">
                <div className="relative">
                  {/* Store Card */}
                  <div className="relative aspect-square rounded-lg overflow-hidden border border-white/20 group">
                    <img
                      src={selectedAlbum.stores[currentStoreIndex].productImage}
                      alt={`${selectedAlbum.title} at ${selectedAlbum.stores[currentStoreIndex].name}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Store Logo Badge */}
                    <div className="absolute top-4 right-4 w-16 h-16 bg-white rounded-lg p-2 shadow-lg">
                      <img
                        src={selectedAlbum.stores[currentStoreIndex].logo}
                        alt={selectedAlbum.stores[currentStoreIndex].name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Shop Button Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a
                        href={selectedAlbum.stores[currentStoreIndex].link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-white hover:bg-gray-200 text-gray-900 rounded-lg font-semibold flex items-center gap-2 transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Shop at {selectedAlbum.stores[currentStoreIndex].name}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  {selectedAlbum.stores.length > 1 && (
                    <>
                      <button
                        onClick={prevStore}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white transition"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextStore}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white transition"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Carousel Indicators */}
                  {selectedAlbum.stores.length > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      {selectedAlbum.stores.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentStoreIndex(index)}
                          className={`w-2 h-2 rounded-full transition ${index === currentStoreIndex
                            ? 'bg-white w-6'
                            : 'bg-white/30'
                            }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Store Info */}
                <div className="mt-6 text-center">
                  <p className="text-white font-semibold text-lg">
                    {selectedAlbum.stores[currentStoreIndex].name}
                  </p>
                  <a
                    href={selectedAlbum.stores[currentStoreIndex].link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mt-2"
                  >
                    Visit Store
                    <ExternalLink className="w-3 h-3" />
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