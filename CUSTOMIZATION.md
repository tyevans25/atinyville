# Customization Guide 🎨

Want to make the quiz your own? Here's how to customize different aspects!

## Changing Colors

### Option 1: Quick Color Change (Easiest)

Open `app/globals.css` and find this line:
```css
--primary: 262 83% 58%;
```

Replace those numbers with your color in HSL format. Here are some examples:

**Purple** (current): `262 83% 58%`
**Pink**: `330 81% 60%`
**Blue**: `210 100% 56%`
**Orange**: `25 95% 53%`
**Red**: `0 84% 60%`
**Green**: `142 71% 45%`

Use a color picker tool like https://hslpicker.com/ to find your perfect color!

### Option 2: Complete Theme Change

Want to change everything? Edit these in `app/globals.css`:

```css
:root {
  --background: 0 0% 100%;          /* Page background */
  --foreground: 222.2 84% 4.9%;     /* Text color */
  --primary: 262 83% 58%;           /* Main brand color */
  --secondary: 210 40% 96.1%;       /* Secondary elements */
  /* ... etc */
}
```

## Changing the Gradient Background

Open `app/page.tsx` and find:
```jsx
className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800"
```

Change the colors:
- `from-purple-600` → starting color
- `via-purple-700` → middle color
- `to-indigo-800` → ending color

Available colors: red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose

Numbers: 50 (lightest) to 950 (darkest)

Example for pink gradient:
```jsx
className="min-h-screen bg-gradient-to-br from-pink-500 via-pink-600 to-purple-700"
```

## Customizing Questions

Open `data/questions.ts`. Here's what you can change:

### Add More Questions
Copy this template and fill it in:
```typescript
{
  id: 6, // Increment this number
  question: "Your question here?",
  videoUrl: "https://www.youtube.com/embed/VIDEO_ID", // Optional
  spotifyUrl: "https://open.spotify.com/embed/track/TRACK_ID", // Optional
  options: [
    "Option A",
    "Option B",
    "Option C",
    "Option D"
  ],
  correctAnswer: 0, // 0 = first option, 1 = second, etc.
  points: 100,
  explanation: "Explanation after they answer" // Optional
}
```

### Question Types You Can Create

**Video-based**: Include a `videoUrl` (YouTube embed)
**Audio-based**: Include a `spotifyUrl` 
**Text-only**: Leave out both URLs
**Mixed**: Include both video and audio!

## Changing Timer Settings

Open `components/Quiz.tsx` and find:

### Question Time Limit
```typescript
const [timeLeft, setTimeLeft] = useState(30) // 30 seconds
```
Change `30` to anything you want (in seconds)

### Speed Bonus Points
Find the `calculateSpeedBonus` function:
```typescript
const calculateSpeedBonus = () => {
  const timeUsed = 30 - timeLeft
  if (timeUsed <= 5) return 50    // Super fast = 50 points
  if (timeUsed <= 10) return 30   // Fast = 30 points
  if (timeUsed <= 15) return 10   // Okay = 10 points
  return 0                         // Slow = 0 points
}
```

Change the numbers to adjust difficulty!

## Changing Text Content

### Landing Page Text
Open `app/page.tsx` and modify:
- Title: Change `"ATEEZ"` 
- Subtitle: Change `"Streaming Quiz"`
- Description paragraph
- Feature card text

### Quiz Results Text
Open `components/Quiz.tsx` and find the results section (starts with `if (quizCompleted)`).

Change:
- "Quiz Complete!"
- "Great job, ATINY! 🏴‍☠️"
- Tweet text

## Advanced Customizations

### Add Background Image
In `app/page.tsx`, replace the gradient background with:
```jsx
className="min-h-screen bg-cover bg-center"
style={{ backgroundImage: "url('/your-image.jpg')" }}
```
Put your image in the `public` folder first!

### Change Fonts
In `app/layout.tsx`, import a different Google Font:
```typescript
import { Inter } from "next/font/google"; // Change this
```

Browse fonts at https://fonts.google.com/

### Add Sound Effects
You'll need to add audio files to the `public` folder and use the Web Audio API. This is more advanced - search for "React audio tutorial" to learn more!

## Testing Your Changes

After making changes:
1. Save the file (Ctrl+S or Cmd+S)
2. Check the terminal for errors
3. Refresh your browser
4. Test thoroughly before deploying!

## Tips

- **Make one change at a time** so you know what broke if something goes wrong
- **Keep backups** of working code
- **Test on mobile** - open `http://localhost:3000` on your phone when on the same WiFi
- **Use browser dev tools** (F12) to see errors

## Need More Help?

- React documentation: https://react.dev
- Tailwind CSS docs: https://tailwindcss.com/docs
- Next.js docs: https://nextjs.org/docs

Remember: Don't be afraid to experiment! You can always undo changes or re-download the original. 💜
