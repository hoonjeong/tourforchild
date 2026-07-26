# TourForChild — Content Generation Spec (RICH stories)

You write content for **TourForChild**, a site where parents read fun, vivid travel
stories to their kids **before** a trip. Think bedtime-story energy about real places:
warm, playful, full of wonder — but the facts are TRUE.

## Tone
- Tell an actual STORY, not a dry summary. Hook the reader, build a little, end with wonder.
- Fun and light, but with real substance — the "why is this place amazing / what happened here".
- Short, bright sentences a parent can read aloud. No jargon, no dates-dumping, no scary/violent detail.
- Natural, native-quality writing in EACH language (ko / en / ja / zh) — not literal translations.

## File to write (one per city)
`C:\Users\hoonj\project\tourforchild\data\raw\<id>.json`

Read `C:\Users\hoonj\project\tourforchild\data\raw\pompeii.json` and `gyeongju.json` FIRST
as the gold-standard for structure, depth, and tone. Match that depth.

## EXACT schema
```json
{
  "id": "<id>",
  "country": "<country code>",
  "coords": [lat, lng],
  "name":    { "ko": "", "en": "", "ja": "", "zh": "" },
  "tagline": { "ko": "", "en": "", "ja": "", "zh": "" },
  "story": {
    "ko": ["para1", "para2", "para3", "para4"],
    "en": ["...", "...", "...", "..."],
    "ja": ["...", "...", "...", "..."],
    "zh": ["...", "...", "...", "..."]
  },
  "funFacts": { "ko": ["...x6"], "en": ["...x6"], "ja": ["...x6"], "zh": ["...x6"] },
  "kidQuestion": { "ko": "", "en": "", "ja": "", "zh": "" },
  "places": [
    { "name": {4 langs}, "blurb": {4 langs}, "coords": [lat, lng] }
  ]
}
```

## Requirements (STRICT)
- Valid JSON only (UTF-8, no comments, no trailing commas). Verify each file parses.
- Every localized object has all 4 keys: `ko`, `en`, `ja`, `zh`.
- **story**: an array of **4 paragraphs** per language (3 minimum). Each paragraph = 2–4 sentences.
  Together they tell the place's real story — the history, the legend, why it's special, the "wow".
  Same number of paragraphs in every language, same order/meaning.
- **tagline**: one short catchy line.
- **funFacts**: **6** short surprising "did you know?!" facts per language (5 minimum).
  SAME count across all 4 languages, same order/meaning.
- **kidQuestion**: one playful question to spark a kid's curiosity.
- **places**: **3–4** real landmarks/spots tied to the story (not restaurants/hotels).
  Each blurb = 2–3 sentences on why it's cool and how it connects to the story. Real-ish coords.
- **coords**: real latitude/longitude for the city center and each place.
- Keep everything TRUE, kid-appropriate, and genuinely interesting. For beach/resort or theme-park
  spots, lean into nature wonders, legends, records, and "how/why" curiosities.

When done, reply with ONE line listing the files written. Do NOT paste JSON back.
