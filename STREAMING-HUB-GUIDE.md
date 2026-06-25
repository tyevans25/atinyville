# Customizing Your ATEEZ Streaming Hub 🎨

## Quick Overview

Your landing page is now a full **streaming campaign hub** with:
- ✅ Carousel for campaign updates (pre-saves, pre-orders, etc.)
- ✅ Calendar showing upcoming events
- ✅ Quick action buttons
- ✅ Quiz as one of several features

## Where to Edit: `app/page.tsx`

Open this file in VS Code to customize everything!

---

## 📢 Editing Campaign Updates (Carousel)

Find this section at the top of the file (around line 10):

```typescript
const campaignUpdates = [
  {
    id: 1,
    title: "🎵 Pre-Save New Album",
    description: "Pre-save the upcoming album on Spotify & Apple Music!",
    link: "https://orcd.co/ateez", // ← Change this to your actual link
    platform: "Spotify & Apple Music",
    urgent: true  // ← Set to true for urgent campaigns (shows red badge)
  },
  // ... more campaigns
]
```

### Adding a New Campaign:

### Adding an Image Slide:

```typescript
{
  id: 4,
  title: "📸 Teaser Poster Out Now",
  description: "New teaser image just dropped - share it everywhere!",
  imageUrl: "https://your-cdn.com/path/to/poster.jpg",
  imageAlt: "ATEEZ teaser poster",
  links: [{ url: "https://x.com/...", label: "View Post" }],
  urgent: true
}
```

Notes:
- Use `imageUrl` for jpg/png/webp/gif campaign art.
- `imageAlt` is optional but recommended for accessibility.
- If a slide has `videoUrl`, that still takes priority over `imageUrl`.

```typescript
{
  id: 5,  // Increment this number
  title: "🎤 Vote on Music Shows",
  description: "Vote for ATEEZ on Mnet, SBS, KBS!",
  link: "https://yourlink.com",
  platform: "Music Shows",
  urgent: true  // Show URGENT badge
}
```

### Tips:
- Use emojis in titles for visual appeal
- Set `urgent: true` for time-sensitive campaigns
- Keep descriptions short (1-2 sentences)
- Update links regularly

---

## 📅 Editing the Events Calendar

Find this section (around line 40):

```typescript
const upcomingEvents = [
  {
    id: 1,
    date: "2026-02-01",  // ← Format: YYYY-MM-DD
    title: "Album Release",
    description: "New album drops!",
    type: "release"  // Can be: release, performance, concert, etc.
  },
  // ... more events
]
```

### Adding a New Event:

```typescript
{
  id: 4,
  date: "2026-04-15",
  title: "Fan Meeting",
  description: "Online fan meeting at 8PM KST",
  type: "fanmeeting"
}
```

### The calendar will automatically:
- Calculate "days until" countdown
- Sort events chronologically
- Show date in a nice format

---

## ⚡ Editing Quick Action Buttons

Find the Quick Actions section (around line 250 in the return statement).

### Changing a Button:

```typescript
<Button 
  className="w-full justify-start bg-green-100 text-green-700 hover:bg-green-200"
  variant="outline"
  onClick={() => window.open('YOUR_LINK_HERE', '_blank')}
>
  <Music className="w-4 h-4 mr-2" />
  Your Button Text
</Button>
```

### Adding a New Button:

Just copy one of the existing buttons and change:
1. The colors (`bg-green-100`, `text-green-700`, etc.)
2. The link in `window.open()`
3. The icon and text

**Available colors:**
- Green: `bg-green-100 text-green-700`
- Red: `bg-red-100 text-red-700`
- Blue: `bg-blue-100 text-blue-700`
- Purple: `bg-purple-100 text-purple-700`
- Orange: `bg-orange-100 text-orange-700`
- Pink: `bg-pink-100 text-pink-700`

---

## 🎨 Changing Colors & Styling

### Gradient Background:
Find this line (around line 17):
```typescript
<div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
```

Change colors:
- `from-purple-600` → starting color
- `via-purple-700` → middle color
- `to-indigo-800` → ending color

**Available gradient colors:** 
red, orange, yellow, green, blue, indigo, purple, pink, rose, teal, cyan

**Intensities:** 
100 (lightest) to 900 (darkest)

### Card Header Colors:
```typescript
// Carousel header
className="bg-gradient-to-r from-purple-600 to-indigo-600"

// Calendar header
className="bg-gradient-to-r from-indigo-600 to-purple-600"

// Quick Actions header
className="bg-gradient-to-r from-purple-600 to-pink-600"
```

---

## 🔄 Carousel Settings

### Change Auto-Advance Speed:

Find this (around line 20):
```typescript
const interval = setInterval(() => {
  setCurrentSlide((prev) => (prev + 1) % campaignUpdates.length)
}, 5000) // ← Change this number (milliseconds)
```

- `3000` = 3 seconds
- `5000` = 5 seconds (default)
- `10000` = 10 seconds

### Disable Auto-Advance:

Comment out the entire useEffect block:
```typescript
/*
useEffect(() => {
  // ... carousel code
}, [])
*/
```

---

## 🎯 Real-World Examples

### Example 1: Album Comeback Campaign

```typescript
const campaignUpdates = [
  {
    id: 1,
    title: "🎵 Pre-Save 'GOLDEN HOUR: Part.3'",
    description: "Pre-save on all platforms before 2/1!",
    link: "https://orcd.co/ateez-goldenhour3",
    platform: "All Platforms",
    urgent: true
  },
  {
    id: 2,
    title: "📺 Stream 'Enough' MV",
    description: "Let's hit 50M in the first week!",
    link: "https://youtu.be/example",
    platform: "YouTube",
    urgent: true
  },
  {
    id: 3,
    title: "🎧 Create Streaming Playlists",
    description: "Add all title tracks to your daily playlists",
    link: "https://open.spotify.com/playlist/example",
    platform: "Spotify",
    urgent: false
  }
]
```

### Example 2: Concert Tour Calendar

```typescript
const upcomingEvents = [
  {
    id: 1,
    date: "2026-03-15",
    title: "ATEEZ World Tour - Los Angeles",
    description: "Night 1 at Crypto.com Arena",
    type: "concert"
  },
  {
    id: 2,
    date: "2026-03-16",
    title: "ATEEZ World Tour - Los Angeles",
    description: "Night 2 at Crypto.com Arena",
    type: "concert"
  },
  {
    id: 3,
    date: "2026-03-20",
    title: "ATEEZ World Tour - New York",
    description: "Madison Square Garden",
    type: "concert"
  }
]
```

---

## 📱 Mobile Responsiveness

The hub automatically adapts to mobile! But you can test it:

1. Run `npm run dev`
2. Open `http://localhost:3000` on your phone (same WiFi)
3. Or in browser: Press F12 → Click phone icon → Select a device

---

## 🚀 Testing Your Changes

1. Edit `app/page.tsx`
2. Save (Ctrl+S or Cmd+S)
3. Refresh your browser
4. Check that:
   - All links work
   - Dates are correct
   - Carousel advances properly
   - Mobile layout looks good

---

## 💡 Pro Tips

**Keep campaigns fresh:**
- Update carousel weekly with new campaigns
- Remove old/expired campaigns
- Mark time-sensitive ones as `urgent: true`

**Calendar management:**
- Add events as soon as they're announced
- Include ticket sale dates
- Add timezone info in descriptions (e.g., "8PM KST")

**Link shortening:**
- Use bit.ly or similar to track clicks
- Easier to update if links change
- Looks cleaner in tweets

**Visual hierarchy:**
- Put most urgent campaign first in carousel
- Keep 3-5 campaigns max (too many = overwhelming)
- Order events chronologically (code does this automatically)

---

## 🆘 Troubleshooting

**Carousel not advancing:**
- Check console for errors (F12)
- Make sure all campaigns have unique IDs

**Calendar dates wrong:**
- Use format `YYYY-MM-DD` exactly
- Example: `"2026-03-15"` not `"3/15/2026"`

**Links not working:**
- Test each link in a new tab first
- Use full URLs with `https://`

**Changes not showing:**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Check that you saved the file

---

## 🎉 Ready to Launch!

Once you've customized everything:

1. Test all links and features
2. Check on mobile
3. Deploy to Vercel
4. Share your hub with ATINYs!

Your streaming hub is now the central place for all ATEEZ campaigns! 🏴‍☠️💜
