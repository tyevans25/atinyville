export type AwardResult = "pending" | "nominated" | "won" | "lost"

export interface SocialVoteSource {
  id: string
  label: string
  platform: string
  url: string
  hashtag: string
  pollIntervalSeconds: number
}

export interface AwardNomination {
  id: string
  awardShow: string
  category: string
  year: number
  result: AwardResult
  details?: string
  officialUrl?: string
  socialVoteSourceId?: string
}

export interface AwardCampaign {
  id: string
  title: string
  summary: string
  nominations: AwardNomination[]
}

export const SOCIAL_VOTE_SOURCES: SocialVoteSource[] = [
  {
    id: "amas-best-male-kpop-artist-instagram",
    label: "AMAs Instagram Hashtag",
    platform: "Instagram",
    url: "https://www.instagram.com/p/DXHH2kplOBV/",
    hashtag: "#malekpopateez",
    pollIntervalSeconds: 600,
  },
]

export const AWARD_CAMPAIGNS: AwardCampaign[] = [
  {
    id: "amas-2026",
    title: "AMAs 2026",
    summary: "Track ATEEZ nomination status, results, and social vote activity.",
    nominations: [
      {
        id: "amas-2026-best-male-kpop-artist",
        awardShow: "American Music Awards",
        category: "Best Male K-Pop Artist",
        year: 2026,
        result: "nominated",
        details: "Voting is active on AMAs channels.",
        officialUrl: "https://www.theamas.com/",
        socialVoteSourceId: "amas-best-male-kpop-artist-instagram",
      },
    ],
  },
]

export function getSocialSourceById(sourceId: string): SocialVoteSource | undefined {
  return SOCIAL_VOTE_SOURCES.find((source) => source.id === sourceId)
}
