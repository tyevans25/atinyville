export interface Question {
  id: number;
  question: string;
  videoUrl?: string; // YouTube embed URL
  spotifyUrl?: string; // Spotify embed URL
  options: string[];
  correctAnswer: number; // Index of correct answer
  points: number;
  explanation?: string;
}

// Quiz Questions
export const quizQuestions: Question[] = [
  {
    id: 1,
    question: "At the end of the Lemon Drop MV, who opens the trunk?",
    videoUrl: "https://www.youtube.com/embed/H4H99b1CjPU?si=ktuHFCoAZwnf2Crx", // Lemon Drop MV
    options: ["Hongjoong", "Seonghwa", "Yunho", "Yeosang"],
    correctAnswer: 2, // Yunho
    points: 100,
    explanation: "At the end of the Lemon Drop MV, Yunho is the one who opens the trunk, teasing \"In Your Fantasy\"."
  },
  {
    id: 2,
    question: "Which floor does Yunho get off on in the \"Slide to Me\" MV?",
    videoUrl: "https://www.youtube.com/embed/4IVedQnXps0?si=HWMM3nh19r6QVm1V", // Slide to Me MV
    options: ["4", "10", "8", "6"],
    correctAnswer: 1,
    points: 150,
    explanation: "Though it's hard to tell, the last floor we see Yunho on before he exits is the 10th floor."
  },
  {
    id: 3,
    question: "What order are the members shown in right before the bridge in \"In Your Fantasy\"?",
    videoUrl: "https://www.youtube.com/embed/JOF2ZTqvzwY?si=syvyLQvKNtrAAjLP", // In Your Fantasy MV
    options: [
      "Hongjoong, Seonghwa, Yunho, Yeosang, San, Mingi, Wooyoung, Jongho",
      "Seonghwa, Hongjoong, Yeosang, Yunho, Mingi, San, Jongho, Wooyoung", 
      "Seonghwa, Jongho, Yeosang, Hongjoong, San, Yunho, Mingi, Wooyoung",
      "Yunho, Hongjoong, Seonghwa, Yeosang, Mingi, San, Wooyoung, Jongho"
    ],
    correctAnswer: 2,
    points: 200,
    explanation: "At 2:33 in the MV, the order is Seonghwa, Jongho, Yeosang, Hongjoong, San, Yunho, Mingi, Wooyoung."
  },
  {
    id: 4,
    question: "What did Jongho's friends surprise him with in the \"To Be Your Light\" MV?",
    videoUrl:"https://www.youtube.com/embed/DElqg7XL-s4?si=GhcPu-Mv0HzwouXv", // To Be Your Light MV
    options: ["Wine", "A camera", "Dinner", "Cake"],
    correctAnswer: 3,
    points: 50,
    explanation: "His friends surprised him with a cake in the \"To Be Your Light\" MV!"
  },
  {
    id: 5,
    question: "When does the highly anticipated GOLDEN HOUR: Part.4 release?",
    spotifyUrl: "https://open.spotify.com/embed/prerelease/2Mnno3uSsiVdOpKJL4Vz5b?", // GOLDEN HOUR: Part.4 Album Pre-release
    options: ["Feb. 10, 2026", "Feb. 26, 2026", "Feb. 14, 2026", "Feb. 6, 2026"],
    correctAnswer: 3,
    points: 150,
    explanation: "GOLDEN HOUR: Part.4 is set to release on February 6, 2026! Pre-save now!"
  }
];

// INSTRUCTIONS FOR ADDING MORE QUESTIONS:
// 1. Copy one of the question objects above
// 2. Change the id to the next number
// 3. Write your question
// 4. Add YouTube or Spotify embed URLs if needed
//    - YouTube: Use the EMBED url (youtube.com/embed/VIDEO_ID)
//    - Spotify: Right-click song > Share > Embed track, copy the src URL
// 5. List 4 options
// 6. Set correctAnswer to the index (0, 1, 2, or 3) of the right answer
// 7. Set points (harder questions = more points!)
// 8. Add an explanation if you want
