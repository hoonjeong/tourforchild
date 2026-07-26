/* ============================================================
   TourForChild — themes.js  (curated story trails across cities)
   window.TFC_THEMES: [{ id, emoji, name{4}, desc{4}, cityIds:[...] }]
   cityIds are matched against TFC_INDEX; unknown ids are ignored.
   ============================================================ */
window.TFC_THEMES = [
  {
    id: "volcano", emoji: "🌋",
    name: { ko: "화산과 불의 이야기", en: "Volcanoes & Fire", ja: "火山と炎の物語", zh: "火山与烈火的故事" },
    desc: { ko: "땅속 불이 만든 놀라운 도시와 섬들", en: "Amazing cities and islands shaped by fire from below",
            ja: "地の底の炎が生んだ驚きの街と島", zh: "地底烈火造就的神奇城市与岛屿" },
    cityIds: ["pompeii", "naples", "santorini", "reykjavik", "lafortuna", "honolulu", "maui", "hakone", "jeju", "bali"]
  },
  {
    id: "ancient", emoji: "🏛️",
    name: { ko: "옛 왕국과 사라진 문명", en: "Ancient Kingdoms", ja: "古代王国と失われた文明", zh: "古老王国与失落文明" },
    desc: { ko: "수천 년 전 사람들이 남긴 놀라운 흔적", en: "Amazing traces left by people thousands of years ago",
            ja: "数千年前の人々が残した驚きの跡", zh: "数千年前人们留下的惊人痕迹" },
    cityIds: ["gyeongju", "rome", "athens", "cairo", "luxor", "aswan", "cusco", "xian", "petra", "siemreap", "agra", "ayutthaya", "easterisland"]
  },
  {
    id: "islandbeach", emoji: "🏝️",
    name: { ko: "반짝이는 바다와 섬", en: "Sparkling Seas & Islands", ja: "きらめく海と島", zh: "闪耀的大海与海岛" },
    desc: { ko: "물놀이와 모래놀이가 기다리는 곳", en: "Where splashing and sandcastles await",
            ja: "水遊びと砂遊びが待つ場所", zh: "戏水与堆沙堡的乐园" },
    cityIds: ["maldives", "bali", "phuket", "krabi", "boracay", "okinawa", "jeju", "mauritius", "fiji", "santorini", "cancun", "puntacana", "nassau", "zanzibar", "sardinia", "palma"]
  },
  {
    id: "winter", emoji: "❄️",
    name: { ko: "눈과 겨울 왕국", en: "Snow & Winter Wonders", ja: "雪と冬の王国", zh: "冰雪与冬日王国" },
    desc: { ko: "눈싸움과 반짝이는 겨울 풍경", en: "Snowball fights and glittering winter scenes",
            ja: "雪合戦ときらめく冬景色", zh: "打雪仗与闪亮的冬景" },
    cityIds: ["sapporo", "harbin", "reykjavik", "rovaniemi", "zermatt", "queenstown", "interlaken", "banff"]
  },
  {
    id: "themepark", emoji: "🎢",
    name: { ko: "신나는 테마파크", en: "Thrilling Theme Parks", ja: "わくわくテーマパーク", zh: "刺激的主题乐园" },
    desc: { ko: "롤러코스터와 마법 같은 하루", en: "Roller coasters and a day full of magic",
            ja: "ジェットコースターと魔法の一日", zh: "过山车与充满魔法的一天" },
    cityIds: ["orlando", "losangeles", "tokyo", "osaka", "hongkong", "guangzhou", "shenzhen", "nassau", "goldcoast", "lasvegas"]
  },
  {
    id: "wonder", emoji: "✨",
    name: { ko: "세계의 불가사의", en: "Wonders of the World", ja: "世界のふしぎ", zh: "世界奇观" },
    desc: { ko: "'어떻게 만들었지?' 싶은 놀라운 것들", en: "Amazing things that make you ask 'how?!'",
            ja: "「どうやって作ったの？」な驚き", zh: "让人惊叹“怎么做到的”的奇迹" },
    cityIds: ["agra", "cusco", "petra", "cairo", "rome", "xian", "easterisland", "zhangjiajie", "grandcanyon", "halong", "foziguacu", "pamukkale"]
  },
  {
    id: "wildlife", emoji: "🦁",
    name: { ko: "동물 친구들을 만나요", en: "Meet the Animals", ja: "動物のなかまに会おう", zh: "去见动物朋友" },
    desc: { ko: "사자, 판다, 바닷속 친구들까지", en: "Lions, pandas, and friends under the sea",
            ja: "ライオン、パンダ、海の仲間まで", zh: "狮子、熊猫，还有海底的朋友" },
    cityIds: ["masaimara", "kruger", "chengdu", "sandiego", "guangzhou", "cairns", "bohol", "capetown"]
  }
];
