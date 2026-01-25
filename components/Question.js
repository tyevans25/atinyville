'use client'

export default function Question({ question, onAnswer, selectedAnswer }) {
  return (
    <div className="space-y-6">
      {/* YouTube Embed if video ID is provided */}
      {question.youtubeId && (
        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black/50 shadow-2xl">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${question.youtubeId}?autoplay=1&mute=0`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}

      {/* Question Text */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">
          {question.question}
        </h2>

        {/* Answer Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswer(index)}
              disabled={selectedAnswer !== null}
              className={`
                w-full text-left p-4 rounded-xl font-medium transition-all
                ${selectedAnswer === null 
                  ? 'bg-white/10 hover:bg-white/20 text-white border-2 border-transparent hover:border-purple-400' 
                  : selectedAnswer === index
                    ? index === question.correctAnswer
                      ? 'bg-green-500 text-white border-2 border-green-300'
                      : 'bg-red-500 text-white border-2 border-red-300'
                    : index === question.correctAnswer
                      ? 'bg-green-500/50 text-white border-2 border-green-300'
                      : 'bg-white/5 text-white/50 border-2 border-transparent'
                }
                ${selectedAnswer !== null && 'cursor-not-allowed'}
              `}
            >
              <span className="text-lg">{option}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Points Display */}
      <div className="bg-purple-500/20 backdrop-blur rounded-xl p-4 text-center border border-purple-400/30">
        <p className="text-purple-200 text-sm mb-1">Question Value</p>
        <p className="text-white text-2xl font-bold">{question.points} points</p>
        <p className="text-purple-300 text-xs mt-1">+ Speed bonus available</p>
      </div>
    </div>
  )
}
