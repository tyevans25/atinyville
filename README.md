# ATEEZ Streaming Quiz 🏴‍☠️

A gamified quiz app that encourages ATINYs to stream ATEEZ music while testing their knowledge!

## Features ✨

- **Embedded Media**: Questions include YouTube MVs and Spotify tracks
- **Timed Questions**: 30 seconds per question with countdown timer
- **Speed Bonuses**: Earn extra points for answering quickly
- **Score Tracking**: Real-time score updates
- **Social Sharing**: Share your results on Twitter
- **Responsive Design**: Works on mobile and desktop
- **Beautiful UI**: Polished purple theme inspired by modern apps

## Getting Started 🚀

### Prerequisites

You need to have Node.js installed on your computer. Download it from [nodejs.org](https://nodejs.org/) (get the LTS version).

### Installation

1. **Download this project** (or clone it if you know git)

2. **Open your terminal/command prompt** and navigate to the project folder:
   ```bash
   cd ateez-streaming-quiz
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and go to `http://localhost:3000`

You should see your quiz running! 🎉

## Customizing the Quiz 🎨

### Adding/Editing Questions

Open `data/questions.ts` and modify the questions array. Each question looks like this:

```typescript
{
  id: 1,
  question: "What year did ATEEZ debut?",
  videoUrl: "https://www.youtube.com/embed/VIDEO_ID", // Optional
  spotifyUrl: "https://open.spotify.com/embed/track/TRACK_ID", // Optional
  options: ["2017", "2018", "2019", "2020"],
  correctAnswer: 1, // Index of correct answer (0-3)
  points: 100,
  explanation: "ATEEZ debuted in 2018!" // Optional
}
```

**To add a YouTube video:**
1. Find the video on YouTube
2. Copy the video ID from the URL (e.g., `FIInyEWWW-s` from `youtube.com/watch?v=FIInyEWWW-s`)
3. Use format: `https://www.youtube.com/embed/VIDEO_ID`

**To add a Spotify song:**
1. Right-click the song in Spotify
2. Click "Share" → "Embed track"
3. Copy the `src` URL from the embed code

### Changing Colors

Open `tailwind.config.ts` and modify the color values. The current theme uses purple, but you can change it to any color!

### Changing Timer Duration

In `components/Quiz.tsx`, find this line:
```typescript
const [timeLeft, setTimeLeft] = useState(30)
```
Change `30` to however many seconds you want.

### Changing Speed Bonus Thresholds

In `components/Quiz.tsx`, find the `calculateSpeedBonus` function and modify the time thresholds and bonus points.

## Deploying to Vercel (Free!) 🌐

1. **Create a GitHub account** if you don't have one at [github.com](https://github.com)

2. **Upload your code to GitHub**:
   - Create a new repository on GitHub
   - Follow the instructions to upload your code (GitHub will guide you)

3. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Deploy"

That's it! Vercel will give you a URL like `your-quiz.vercel.app` that you can share on Twitter! 🎉

## File Structure 📁

```
ateez-streaming-quiz/
├── app/
│   ├── page.tsx          # Landing page
│   ├── layout.tsx        # App layout
│   └── globals.css       # Global styles
├── components/
│   ├── Quiz.tsx          # Main quiz component
│   └── ui/               # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       └── progress.tsx
├── data/
│   └── questions.ts      # Quiz questions (EDIT THIS!)
├── lib/
│   └── utils.ts          # Utility functions
├── package.json          # Dependencies
└── README.md            # This file!
```

## Learning Resources 📚

Want to learn more about the tech used? Check out:

- **JavaScript**: [javascript.info](https://javascript.info)
- **React**: [react.dev/learn](https://react.dev/learn)
- **Next.js**: [nextjs.org/learn](https://nextjs.org/learn)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)

## Tips for Customization 💡

1. **Start small**: Change one thing at a time
2. **Save often**: Use Ctrl+S (Windows) or Cmd+S (Mac)
3. **Check the browser**: Refresh to see your changes
4. **Read error messages**: They usually tell you what's wrong
5. **Ask for help**: The developer community is friendly!

## Future Ideas 🚀

Want to add more features? Here are some ideas:

- [ ] Global leaderboard (requires a database)
- [ ] Daily/weekly challenges
- [ ] Different quiz categories (by album, era, etc.)
- [ ] User accounts to track progress
- [ ] Achievements/badges
- [ ] Multiplayer mode

## Support 💜

If you have questions or need help:
- Open an issue on GitHub
- Ask in ATINY developer communities
- Search for answers on Stack Overflow

## License

Free to use and modify! Share with other ATINYs! 🏴‍☠️

---

Made with 💜 by ATINYs, for ATINYs
