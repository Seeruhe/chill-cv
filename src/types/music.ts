export interface Track {
  title: string;
  artist: string;
  duration: number;
  story: string;
  cover: string;
  youtubeVideoId: string;
}

export interface ArtistProfile {
  name: string;
  image: string;
  bio: string;
  topTracks: string[];
}
