# Adding Spotify Embeds 🎵

Want to embed Spotify tracks instead of (or in addition to) YouTube videos? Here's how!

## Getting Spotify Embed Code

### Step 1: Find Your Song on Spotify
1. Open Spotify (web or desktop app)
2. Find the ATEEZ song you want
3. Click the three dots (...)
4. Click "Share"
5. Click "Embed track"

### Step 2: Get the Spotify URI
From the embed code, you'll see something like:
```html
<iframe src="https://open.spotify.com/embed/track/1234567890"></iframe>
```

The part you need is: `1234567890` (the track ID)

Or right-click → Share → Copy Spotify URI: `spotify:track:1234567890`

## Updating Your Questions

### Option 1: Just Spotify (No YouTube)

In `data/questions.js`:

```javascript
{
  id: 1,
  question: "Listen to this song and identify the album:",
  spotifyTrackId: "5EwrDeGvfIpFvfTKGvKq1c", // Guerrilla example
  options: [
    "THE WORLD EP.1: Movement",
    "ZERO: FEVER Part.3",
    "THE WORLD EP.2: Outlaw",
    "THE WORLD EP.FIN: Will"
  ],
  correctAnswer: 0,
  points: 100,
  timeLimit: 30
}
```

### Option 2: Both YouTube and Spotify

```javascript
{
  id: 1,
  question: "Listen to this song:",
  youtubeId: "FIInyEWWW-s",
  spotifyTrackId: "5EwrDeGvfIpFvfTKGvKq1c",
  options: ["Option 1", "Option 2", "Option 3", "Option 4"],
  correctAnswer: 0,
  points: 100,
  timeLimit: 30
}
```

## Updating the Question Component

Edit `components/Question.js` and add this after the YouTube embed section:

```javascript
{/* Spotify Embed if track ID is provided */}
{question.spotifyTrackId && (
  <div className="w-full rounded-2xl overflow-hidden bg-black/50 shadow-2xl">
    <iframe
      style={{ borderRadius: '12px' }}
      src={`https://open.spotify.com/embed/track/${question.spotifyTrackId}?utm_source=generator`}
      width="100%"
      height="152"
      frameBorder="0"
      allowFullScreen={false}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  </div>
)}
```

## Finding ATEEZ Track IDs

Here are some popular ATEEZ songs with their Spotify IDs:

```javascript
// Copy these into your questions!

const ateezSpotifyIds = {
  "Guerrilla": "5EwrDeGvfIpFvfTKGvKq1c",
  "Bouncy": "4V6UAuEYGBdGOx5LnqLy6b",
  "Crazy Form": "7mvggGMn2lN9ltCN5p8xA1",
  "WORK": "3TlvVDjH1qZqFBxFdJlvqB",
  "Wonderland": "2Zi7Caqj3oXD8wB6E8gCVH",
  "Halazia": "1Z7TDnVFEJ0qwrQGzq0xGZ",
  "Deja Vu": "3DTYJ8sxtYMYY7wFEJIKDQ",
  "The Real": "2HGxfPBpHLQRPgj3qjPkYN",
  "Turbulence": "1YhE9j3uNvwcIISQZWD5D2",
  "Inception": "39VczlC9D3FfLUfIBQ8nLW"
}
```

## Full Example Question with Spotify

```javascript
{
  id: 1,
  question: "Listen to this track and identify the correct album:",
  spotifyTrackId: "5EwrDeGvfIpFvfTKGvKq1c", // Guerrilla
  options: [
    "THE WORLD EP.1: Movement",
    "ZERO: FEVER Part.3",
    "THE WORLD EP.2: Outlaw",
    "TREASURE EP.FIN: All To Action"
  ],
  correctAnswer: 0,
  points: 100,
  timeLimit: 30
}
```

## Styling Options

### Compact Player (Default)
Height: 152px - Shows artwork, title, play button

### Full Player
Height: 352px - Shows artwork, title, description, and controls

```javascript
height="352"  // Use this for the full player
```

### Theme Options

Add `theme=0` for light theme (default is dark):
```javascript
src={`https://open.spotify.com/embed/track/${question.spotifyTrackId}?utm_source=generator&theme=0`}
```

## Autoplay Considerations

**Note**: Spotify embeds don't autoplay due to browser policies. Users must click play.

If you want to encourage interaction:
1. Add text: "Click play to listen before answering"
2. Add a visual indicator
3. Disable the answer buttons until they've clicked play (advanced)

## Advanced: Track Play Detection

Want to know when someone starts playing? Add this:

```javascript
// In your Question component
const [hasPlayed, setHasPlayed] = useState(false)

// Disable answers until they play
<button
  disabled={!hasPlayed}
  // ... rest of button code
>
```

Then use the Spotify Web Playback SDK (advanced topic).

## Mixing YouTube and Spotify

Give users choice:

```javascript
{question.youtubeId && question.spotifyTrackId && (
  <div className="flex gap-4 mb-4">
    <button 
      onClick={() => setActivePlayer('youtube')}
      className={activePlayer === 'youtube' ? 'active' : ''}
    >
      Watch on YouTube
    </button>
    <button 
      onClick={() => setActivePlayer('spotify')}
      className={activePlayer === 'spotify' ? 'active' : ''}
    >
      Listen on Spotify
    </button>
  </div>
)}
```

## Benefits of Spotify Embeds

✅ Official streaming counts
✅ Better audio quality
✅ No video distractions
✅ Lighter page load
✅ Spotify algorithm boost

## Benefits of YouTube Embeds

✅ Music videos
✅ Performance videos  
✅ More engaging visually
✅ Autoplay support
✅ No Spotify account needed

## Recommendation

Use YouTube for:
- Music videos
- Performance questions
- Choreography questions

Use Spotify for:
- Audio-only questions
- Album identification
- Quick listening

Use both for maximum engagement! 🎵

---

**Pro Tip**: Alternate between YouTube and Spotify across questions to keep variety and maximize streaming on both platforms!
