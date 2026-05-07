import type { ArtistProfile, Track } from '../types/music';

export const ARTISTS: Record<string, ArtistProfile> = {
  "Nujabes": {
    name: "Nujabes",
    image: "https://picsum.photos/seed/nujabes_port/400/500",
    bio: "Jun Seba, better known as Nujabes, was a Japanese record producer, DJ, composer and arranger. He was the founder of the independent label Hydeout Productions and released two studio albums, Metaphorical Music and Modal Soul. His music is known for a blend of hip hop and jazz samples, often described as 'lo-fi hip hop' or 'chillhop'.",
    topTracks: ["Luv(sic)", "Luv(sic) pt2", "Luv(sic) pt3", "Luv(sic) pt4", "Luv(sic) pt5", "Luv(sic) Grand Finale"]
  },
  "A Tribe Called Quest": {
    name: "A Tribe Called Quest",
    image: "https://picsum.photos/seed/atcq_port/400/500",
    bio: "An American hip hop group formed in St. Albans, Queens, New York, in 1985. The group was composed of Q-Tip, Phife Dawg, Ali Shaheed Muhammad, and Jarobi White. They are regarded as pioneers of alternative hip hop music, having helped to pave the way for numerous jazz rap artists.",
    topTracks: ["Can I Kick It?", "Electric Relaxation", "Check the Rhime", "Jazz (We've Got)"]
  },
  "Digable Planets": {
    name: "Digable Planets",
    image: "https://picsum.photos/seed/digable_port/400/500",
    bio: "Based in Brooklyn, NY, Digable Planets emerged in the early 90s with a unique fusion of jazz and hip hop. Their debut album, Reachin' (A New Refutation of Time and Space), won a Grammy for Best Rap Performance by a Duo or Group.",
    topTracks: ["Rebirth of Slick", "Where I'm From", "Black Ego"]
  },
  "Gang Starr": {
    name: "Gang Starr",
    image: "https://picsum.photos/seed/gangstarr_port/400/500",
    bio: "Gang Starr, formed by DJ Premier and Guru, helped define East Coast hip hop with dusty jazz loops, sharp drums, and understated lyricism. Their catalog remains a cornerstone for boom-bap and jazz-rap listeners.",
    topTracks: ["Mass Appeal", "Moment of Truth", "DWYCK", "Above The Clouds"]
  },
  "Black Star": {
    name: "Black Star",
    image: "https://picsum.photos/seed/blackstar_port/400/500",
    bio: "Black Star is the duo of Mos Def and Talib Kweli. Their 1998 debut fused conscious lyricism with warm jazz and soul sampling, becoming one of the most respected records in underground hip hop.",
    topTracks: ["Respiration", "Definition", "Brown Skin Lady", "Thieves in the Night"]
  }
};

export const TRACKS: Track[] = [
  {
    title: "Feather (feat. Cise Starr & Akin)",
    artist: "Nujabes",
    duration: 178,
    story: "A signature jazz-hop piece from Nujabes, Feather drifts on piano chords and featherlight drums while the verses stay reflective and grounded. It captures the exact late-night calm this project is aiming for.",
    cover: "https://img.youtube.com/vi/hQ5x8pHoIPA/maxresdefault.jpg",
    youtubeVideoId: "hQ5x8pHoIPA"
  },
  {
    title: "Luv(sic) (feat. Shing02)",
    artist: "Nujabes",
    duration: 286,
    story: "The first Luv(sic) sets the whole hexalogy in motion: Shing02 treats music itself like a love letter, while Nujabes builds a warm loop that feels handwritten rather than produced.",
    cover: "https://img.youtube.com/vi/Y4HWvsGs0rY/maxresdefault.jpg",
    youtubeVideoId: "Y4HWvsGs0rY"
  },
  {
    title: "Luv(sic) pt2 (feat. Shing02)",
    artist: "Nujabes",
    duration: 271,
    story: "Part 2 deepens the series with one of Nujabes' most tender grooves. It feels like a memory replayed on vinyl: hopeful, reflective, and quietly resilient.",
    cover: "https://img.youtube.com/vi/orZdl3KqgzU/maxresdefault.jpg",
    youtubeVideoId: "orZdl3KqgzU"
  },
  {
    title: "Luv(sic) pt3 (feat. Shing02)",
    artist: "Nujabes",
    duration: 337,
    story: "Part of the iconic six-part collaboration with Shing02, this track blends melancholic strings and boom-bap drums into one of the most emotional classics in jazz-inflected hip hop.",
    cover: "https://img.youtube.com/vi/Fwv2gnCFDOc/maxresdefault.jpg",
    youtubeVideoId: "Fwv2gnCFDOc"
  },
  {
    title: "Luv(sic) pt4 (feat. Shing02)",
    artist: "Nujabes",
    duration: 312,
    story: "Part 4 sounds like returning to a familiar room after seasons have passed. The writing looks at time, distance, and reconnection while the beat keeps everything softly airborne.",
    cover: "https://img.youtube.com/vi/iKPITQ5Y1-M/maxresdefault.jpg",
    youtubeVideoId: "iKPITQ5Y1-M"
  },
  {
    title: "Luv(sic) pt5 (feat. Shing02)",
    artist: "Nujabes",
    duration: 350,
    story: "Part 5 is the elegy in the cycle: heavier, more spacious, and shaped by loss. It carries the feeling of grief moving through melody without losing tenderness.",
    cover: "https://img.youtube.com/vi/xZGJmTqS4EI/maxresdefault.jpg",
    youtubeVideoId: "xZGJmTqS4EI"
  },
  {
    title: "Luv(sic) Grand Finale (feat. Shing02)",
    artist: "Nujabes",
    duration: 282,
    story: "The Grand Finale closes the hexalogy like a last page left open. It gathers the series' ideas of love, memory, and music into a final, graceful farewell.",
    cover: "https://img.youtube.com/vi/7NYhGM4qoPc/maxresdefault.jpg",
    youtubeVideoId: "7NYhGM4qoPc"
  },
  {
    title: "Electric Relaxation",
    artist: "A Tribe Called Quest",
    duration: 226,
    story: "Built around a buttery Ronnie Foster sample, Electric Relaxation is peak Tribe: conversational flows, clean pocket drums, and an effortless blend of cool and technical precision.",
    cover: "https://img.youtube.com/vi/WHRnvjCkTsw/maxresdefault.jpg",
    youtubeVideoId: "WHRnvjCkTsw"
  },
  {
    title: "Rebirth of Slick (Cool Like Dat)",
    artist: "Digable Planets",
    duration: 261,
    story: "This Grammy-winning single turned upright bass, laid-back swing, and abstract lyricism into an anthem. It is one of the clearest templates for jazz hip hop's cool, left-field identity.",
    cover: "https://img.youtube.com/vi/cM4kqL13jGM/maxresdefault.jpg",
    youtubeVideoId: "cM4kqL13jGM"
  },
  {
    title: "Mass Appeal",
    artist: "Gang Starr",
    duration: 221,
    story: "Premier's vibraphone loop and Guru's detached delivery turned Mass Appeal into a boom-bap staple. It critiques trend-chasing while sounding timeless on every system.",
    cover: "https://img.youtube.com/vi/y9lNbNGbo24/maxresdefault.jpg",
    youtubeVideoId: "y9lNbNGbo24"
  },
  {
    title: "Respiration (feat. Common)",
    artist: "Black Star",
    duration: 366,
    story: "Respiration paints city life with cinematic detail over moody jazz production. Mos Def, Talib Kweli, and Common each bring a different perspective, giving the track a layered, nocturnal energy.",
    cover: "https://img.youtube.com/vi/eeTnog5RRQo/maxresdefault.jpg",
    youtubeVideoId: "eeTnog5RRQo"
  },
];
