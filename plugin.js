// Contenido de 1shows — plugin de Kino
// Catálogo (películas, series, anime): API de www.1shows.org (tipo TMDB).
// Video: servidores de viduki (la dirección del video la arma la página con sus
//          propios scripts, así que resolve() usa el navegador oculto de Kino).
// TV en vivo: listas IPTV de iptv-org/iptv en GitHub.
// Todo lo que la persona lee está en español de Bogotá; los textos que el código
// arma (títulos de filas, mensajes) siguen kino.lang.

const API = "https://www.1shows.org";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const HEADERS = {
  "User-Agent": UA,
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "es-CO,es;q=0.9,en;q=0.8",
  Referer: "https://www.1shows.org/",
  Origin: "https://www.1shows.org",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
};
const PROVIDERS_API = "https://api.viduki.net/embed_providers?site=1shows";
const IPTV_RAW = "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/";
const TMDB_IMG = "https://image.tmdb.org/t/p/";
const CAPTURE_MATCH =
  "m3u8|mpd|mp4|webm|mkv|mov|videoplayback|master.txt|/hls/|/media/";

// Los servidores de video, por si la API de proveedores no responde.
const FALLBACK_PROVIDERS = [
  {
    id: "MAIN_1",
    label: "Main 1",
    movie: "https://www.viduki.net/1/movie/{id}?color=0278fd",
    tv: "https://www.viduki.net/1/tv/{id}/{s}/{e}?color=0278fd",
  },
  {
    id: "MAIN_2",
    label: "Main 2",
    movie: "https://vidy.st/movie/{id}?color=0278fd&overlay=true",
    tv: "https://vidy.st/tv/{id}/{s}/{e}?color=0278fd&episodeSelector=false&nextEpisode=false&autoplayNextEpisode=false&overlay=true",
  },
  {
    id: "MAIN_3",
    label: "Main 3",
    movie: "https://vidfast.pro/movie/{id}?autoPlay=true&title=true&poster=true&theme=0278fd",
    tv: "https://vidfast.pro/tv/{id}/{s}/{e}?autoPlay=true&title=true&poster=true&theme=0278fd&nextButton=false&autoNext=false",
  },
  {
    id: "MAIN_4",
    label: "Main 4",
    movie: "https://vidlink.pro/movie/{id}?primaryColor=0278fd&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=jw&title=true&poster=true&autoplay=true&nextbutton=false",
    tv: "https://vidlink.pro/tv/{id}/{s}/{e}?primaryColor=0278fd&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=jw&title=true&poster=true&autoplay=true&nextbutton=false",
  },
  {
    id: "MAIN_5",
    label: "Main 5",
    movie: "https://vidrock.to/movie/{id}?theme=0278fd&autoplay=true&autonext=false&download=false&nextbutton=false&episodeselector=false",
    tv: "https://vidrock.to/tv/{id}/{s}/{e}?theme=0278fd&autoplay=true&autonext=false&download=false&nextbutton=false&episodeselector=false",
  },
  {
    id: "MAIN_6",
    label: "Main 6",
    movie: "https://player.vidzee.wtf/embed/movie/{id}?color=0278fd",
    tv: "https://player.vidzee.wtf/embed/tv/{id}/{s}/{e}?color=0278fd",
  },
  {
    id: "MULTILANGUAGE",
    label: "Multi-language",
    movie: "https://www.viduki.net/2/movie/{id}?color=0278fd",
    tv: "https://www.viduki.net/2/tv/{id}/{s}/{e}?color=0278fd",
  },
  {
    id: "PREMIUM_EMBEDS",
    label: "Premium embeds",
    movie: "https://www.viduki.net/4/movie/{id}?color=0278fd",
    tv: "https://www.viduki.net/4/tv/{id}/{s}/{e}?color=0278fd",
  },
];

// Géneros de TMDB (los resultados de búsqueda solo traen los ids).
const GENRE_MAP = {
  28: "Acción",
  12: "Aventura",
  16: "Animación",
  35: "Comedia",
  80: "Crimen",
  99: "Documental",
  18: "Drama",
  10751: "Familia",
  14: "Fantasía",
  36: "Historia",
  27: "Terror",
  10402: "Música",
  9648: "Misterio",
  10749: "Romance",
  878: "Ciencia ficción",
  10770: "Película de TV",
  53: "Suspenso",
  10752: "Bélico",
  37: "Oeste",
  10759: "Acción y aventura",
  10762: "Infantil",
  10765: "Ciencia ficción y fantasía",
  10769: "Extranjero",
};

// Países de TV en vivo (código ISO, nombre en español).
const COUNTRIES = [
  ["us", "Estados Unidos", "US"],
  ["gb", "Reino Unido", "GB"],
  ["es", "España", "ES"],
  ["mx", "México", "MX"],
  ["ar", "Argentina", "AR"],
  ["co", "Colombia", "CO"],
  ["cl", "Chile", "CL"],
  ["pe", "Perú", "PE"],
  ["ve", "Venezuela", "VE"],
  ["ec", "Ecuador", "EC"],
  ["bo", "Bolivia", "BO"],
  ["py", "Paraguay", "PY"],
  ["uy", "Uruguay", "UY"],
  ["pa", "Panamá", "PA"],
  ["cr", "Costa Rica", "CR"],
  ["gt", "Guatemala", "GT"],
  ["do", "República Dominicana", "DO"],
  ["cu", "Cuba", "CU"],
  ["ca", "Canadá", "CA"],
  ["br", "Brasil", "BR"],
  ["de", "Alemania", "DE"],
  ["fr", "Francia", "FR"],
  ["it", "Italia", "IT"],
  ["pt", "Portugal", "PT"],
  ["nl", "Países Bajos", "NL"],
  ["be", "Bélgica", "BE"],
  ["ch", "Suiza", "CH"],
  ["at", "Austria", "AT"],
  ["se", "Suecia", "SE"],
  ["no", "Noruega", "NO"],
  ["dk", "Dinamarca", "DK"],
  ["fi", "Finlandia", "FI"],
  ["pl", "Polonia", "PL"],
  ["ie", "Irlanda", "IE"],
  ["cz", "República Checa", "CZ"],
  ["hu", "Hungría", "HU"],
  ["ro", "Rumania", "RO"],
  ["bg", "Bulgaria", "BG"],
  ["gr", "Grecia", "GR"],
  ["hr", "Croacia", "HR"],
  ["rs", "Serbia", "RS"],
  ["sk", "Eslovaquia", "SK"],
  ["si", "Eslovenia", "SI"],
  ["ee", "Estonia", "EE"],
  ["lv", "Letonia", "LV"],
  ["lt", "Lituania", "LT"],
  ["lu", "Luxemburgo", "LU"],
  ["mt", "Malta", "MT"],
  ["cy", "Chipre", "CY"],
  ["is", "Islandia", "IS"],
  ["ua", "Ucrania", "UA"],
  ["ru", "Rusia", "RU"],
  ["by", "Bielorrusia", "BY"],
  ["ge", "Georgia", "GE"],
  ["am", "Armenia", "AM"],
  ["az", "Azerbaiyán", "AZ"],
  ["kz", "Kazajistán", "KZ"],
  ["jp", "Japón", "JP"],
  ["kr", "Corea del Sur", "KR"],
  ["cn", "China", "CN"],
  ["tw", "Taiwán", "TW"],
  ["hk", "Hong Kong", "HK"],
  ["sg", "Singapur", "SG"],
  ["my", "Malasia", "MY"],
  ["id", "Indonesia", "ID"],
  ["th", "Tailandia", "TH"],
  ["vn", "Vietnam", "VN"],
  ["ph", "Filipinas", "PH"],
  ["in", "India", "IN"],
  ["pk", "Pakistán", "PK"],
  ["bd", "Bangladés", "BD"],
  ["lk", "Sri Lanka", "LK"],
  ["np", "Nepal", "NP"],
  ["mn", "Mongolia", "MN"],
  ["tr", "Turquía", "TR"],
  ["il", "Israel", "IL"],
  ["ae", "Emiratos Árabes", "AE"],
  ["sa", "Arabia Saudita", "SA"],
  ["qa", "Qatar", "QA"],
  ["kw", "Kuwait", "KW"],
  ["jo", "Jordania", "JO"],
  ["lb", "Líbano", "LB"],
  ["za", "Sudáfrica", "ZA"],
  ["ng", "Nigeria", "NG"],
  ["ke", "Kenia", "KE"],
  ["gh", "Ghana", "GH"],
  ["eg", "Egipto", "EG"],
  ["ma", "Marruecos", "MA"],
  ["dz", "Argelia", "DZ"],
  ["tn", "Túnez", "TN"],
  ["au", "Australia", "AU"],
  ["nz", "Nueva Zelanda", "NZ"],
];

// Filas de Inicio: identificador, título (es, en), género de Kino, endpoint de la API.
const ROWS = [
  ["tr-m", ["Tendencias · Películas", "Trending · Movies"], "peliculas", "trending/movie/day"],
  ["tr-t", ["Tendencias · Series", "Trending · TV Shows"], "series", "trending/tv/day"],
  ["pop-m", ["Populares · Películas", "Popular · Movies"], "peliculas", "movie/popular"],
  ["np", ["En cartelera", "Now Playing"], "peliculas", "movie/now_playing"],
  ["pop-t", ["Populares · Series", "Popular · TV Shows"], "series", "tv/popular"],
  ["air", ["Al aire hoy", "Airing Today"], "series", "tv/airing_today"],
  ["top-m", ["Mejor valoradas · Películas", "Top Rated · Movies"], "peliculas", "movie/top_rated"],
  ["top-t", ["Mejor valoradas · Series", "Top Rated · TV Shows"], "series", "tv/top_rated"],
  ["an-m", ["Anime · Películas", "Anime · Movies"], "anime", "discover/movie?with_genres=16"],
  ["an-t", ["Anime · Series", "Anime · TV Shows"], "anime", "discover/tv?with_genres=16&with_original_language=ja"],
];

// ---------- ayudantes ----------

// El idioma de la persona (Kino 0.9.54 puede ser "en-US").
function T(es, en) {
  try {
    return kino.lang === "en-US" ? en : es;
  } catch (e) {
    return es;
  }
}

function img(path, w) {
  return path ? TMDB_IMG + "w" + w + path : undefined;
}

function genreNames(ids) {
  if (!Array.isArray(ids)) return undefined;
  const out = [];
  for (let i = 0; i < ids.length && out.length < 5; i++) {
    const n = GENRE_MAP[ids[i]];
    if (n && out.indexOf(n) < 0) out.push(n);
  }
  return out.length ? out : undefined;
}

function safeStr(v, max) {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  if (!s) return undefined;
  return s.length > max ? s.slice(0, max) : s;
}

function mimeOf(url) {
  const u = String(url).split("?")[0].split("#")[0].toLowerCase();
  if (u.indexOf(".m3u8") >= 0) return "application/x-mpegurl";
  if (u.indexOf(".mpd") >= 0) return "application/dash+xml";
  if (u.indexOf(".webm") >= 0) return "video/webm";
  if (u.indexOf(".mkv") >= 0) return "video/x-matroska";
  if (u.indexOf(".mov") >= 0) return "video/quicktime";
  return "video/mp4";
}

function fmtOf(url) {
  const u = String(url).split("?")[0].split("#")[0].toLowerCase();
  if (u.indexOf(".srt") >= 0) return "srt";
  return "vtt";
}

function guessLang(url) {
  const u = String(url).toLowerCase();
  if (u.indexOf("espa") >= 0 || u.indexOf("/es") >= 0 || u.indexOf(".es.") >= 0) return "es";
  if (u.indexOf("eng") >= 0 || u.indexOf("/en") >= 0 || u.indexOf(".en.") >= 0) return "en";
  return "es";
}

// Petición JSON con las cabeceras que la API de 1shows exige.
async function fetchJson(url, headers, timeoutMs) {
  const r = await kino.fetch(url, {
    headers: headers || HEADERS,
    timeoutMs: timeoutMs || 20000,
  });
  if (!r.ok) return null;
  try {
    return r.json();
  } catch (e) {
    return null;
  }
}

async function api(path, timeoutMs) {
  const sep = path.indexOf("?") >= 0 ? "&" : "?";
  return fetchJson(API + "/api/" + path + sep + "language=es", HEADERS, timeoutMs);
}

// Límite de peticiones en vuelo (Kino permite 6 a la vez).
async function parallelLimit(items, limit, fn) {
  const out = new Array(items.length);
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx;
      idx++;
      try {
        out[i] = await fn(items[i], i);
      } catch (e) {
        out[i] = null;
      }
    }
  }
  const workers = [];
  const n = limit < items.length ? limit : items.length;
  for (let i = 0; i < n; i++) workers.push(worker());
  await Promise.all(workers);
  return out;
}

// ---------- referencias ----------

// Película: "m:<id>"; serie: "t:<id>"; capítulo: "e:<id>:<temporada>:<capítulo>".
// Un servidor concreto se añade al final: "...:<servidor>".
function mRef(id, srv) {
  return "m:" + id + (srv ? ":" + srv : "");
}
function tRef(id, srv) {
  return "t:" + id + (srv ? ":" + srv : "");
}
function eRef(id, s, e, srv) {
  return "e:" + id + ":" + s + ":" + e + (srv ? ":" + srv : "");
}
function browseRef(endpoint) {
  return "b:" + endpoint;
}

function parseRef(ref) {
  if (typeof ref !== "string" || !ref) return null;
  const parts = ref.split(":");
  if (parts.length < 2) return null;
  const k = parts[0];
  if (k === "m" && parts.length >= 2) {
    return { k: "m", id: parts[1], srv: parts.length > 2 ? parts[2] : null };
  }
  if (k === "t" && parts.length >= 2) {
    return { k: "t", id: parts[1], srv: parts.length > 2 ? parts[2] : null };
  }
  if (k === "e" && parts.length >= 4) {
    return {
      k: "e",
      id: parts[1],
      s: parseInt(parts[2]) || 1,
      e: parseInt(parts[3]) || 1,
      srv: parts.length > 4 ? parts[4] : null,
    };
  }
  return null;
}

// ---------- ítems ----------

function toItem(r) {
  if (!r) return null;
  const isMovie =
    r.media_type === "movie" ||
    (r.media_type !== "tv" && r.title !== undefined && r.name === undefined);
  const idNum = r.id;
  if (typeof idNum !== "number") return null;
  const id = (isMovie ? "m" : "t") + idNum;
  const title = safeStr(r.title || r.name, 200);
  if (!title) return null;
  const item = { id: id, ref: isMovie ? mRef(idNum) : tRef(idNum), title: title, kind: isMovie ? "movie" : "series" };
  const year = safeStr(r.release_date || r.first_air_date || "", 4);
  if (year) item.year = year;
  const poster = img(r.poster_path, 500);
  if (poster) item.poster = poster;
  const backdrop = img(r.backdrop_path, 780);
  if (backdrop) item.backdrop = backdrop;
  const overview = safeStr(r.overview, 2000);
  if (overview) item.overview = overview;
  const ot = safeStr(r.original_title || r.original_name, 200);
  if (ot && ot !== title) item.originalTitle = ot;
  const genres = genreNames(r.genre_ids);
  if (genres) item.genres = genres;
  if (typeof r.vote_average === "number" && r.vote_average > 0) item.rating = r.vote_average;
  if (r.adult === true) item.adult = true;
  const ids = { tmdb: idNum };
  if (typeof r.imdb_id === "string" && r.imdb_id) ids.imdb = r.imdb_id;
  item.ids = ids;
  return item;
}

function mapItems(results) {
  const out = [];
  if (!Array.isArray(results)) return out;
  for (let i = 0; i < results.length && out.length < 100; i++) {
    const it = toItem(results[i]);
    if (it) out.push(it);
  }
  return out;
}

// ---------- capacidades ----------

export async function search(query) {
  await null;
  const q = safeStr(query && query.q, 200);
  if (!q) return [];
  const page = query && query.cursor ? parseInt(query.cursor) || 1 : 1;
  const data = await api(
    "search/query?query=" + encodeURIComponent(q) + "&page=" + page,
    14000
  );
  if (!data) return [];
  let items = mapItems(data.results);
  const type = query && query.type;
  if (type === "movie" || type === "series") {
    const want = type === "movie" ? "movie" : "series";
    items = items.filter(function (it) {
      return it.kind === want;
    });
  }
  if (!items.length) return [];
  const next =
    items.length >= 20 && page < 100 ? String(page + 1) : null;
  return { items: items, next: next };
}

export async function home() {
  await null;
  const answers = await parallelLimit(ROWS, 5, function (row) {
    return api(row[3], 15000).then(function (d) {
      if (!d) return null;
      const items = mapItems(d.results);
      if (!items.length) return null;
      return {
        id: row[0],
        title: T(row[1][0], row[1][1]),
        genre: row[2],
        items: items,
        ref: browseRef(row[3]),
      };
    });
  });
  const rows = [];
  for (let i = 0; i < answers.length; i++) {
    if (answers[i]) rows.push(answers[i]);
  }
  return rows;
}

export async function browse(ref, cursor) {
  await null;
  if (typeof ref !== "string" || ref.slice(0, 2) !== "b:") {
    throw kino.error("not_found", "bad-browse-ref", {
      userMessage: T("No se encontró esta página.", "This page was not found."),
    });
  }
  const endpoint = ref.slice(2);
  const page = cursor ? parseInt(cursor) || 1 : 1;
  const sep = endpoint.indexOf("?") >= 0 ? "&" : "?";
  const data = await api(endpoint + sep + "page=" + page, 18000);
  if (!data) {
    throw kino.error("unavailable", "browse-failed", {
      userMessage: T("No se pudo cargar esta lista.", "This list could not be loaded."),
    });
  }
  const items = mapItems(data.results);
  const next =
    items.length >= 20 && page < 200 ? String(page + 1) : null;
  return { items: items, next: next };
}

export async function episodes(ref) {
  await null;
  const p = parseRef(ref);
  if (!p || p.k !== "t") {
    throw kino.error("not_found", "bad-series-ref", {
      userMessage: T("No se encontró esta serie.", "This series was not found."),
    });
  }
  const info = await api("tv/" + p.id + "?append_to_response=images", 18000);
  if (!info || !info.name) {
    throw kino.error("not_found", "series-missing", {
      userMessage: T("No se encontró esta serie.", "This series was not found."),
    });
  }
  const series = { title: safeStr(info.name, 200) };
  const poster = img(info.poster_path, 500);
  if (poster) series.poster = poster;
  const backdrop = img(info.backdrop_path, 780);
  if (backdrop) series.backdrop = backdrop;
  const overview = safeStr(info.overview, 2000);
  if (overview) series.overview = overview;
  const g = [];
  if (Array.isArray(info.genres)) {
    for (let i = 0; i < info.genres.length && g.length < 5; i++) {
      if (info.genres[i] && info.genres[i].name) g.push(info.genres[i].name);
    }
  }
  if (g.length) series.genres = g;
  const year = safeStr(info.first_air_date, 4);
  if (year) series.year = year;
  if (typeof info.vote_average === "number" && info.vote_average > 0) series.rating = info.vote_average;
  const ids = { tmdb: p.id };
  if (typeof info.imdb_id === "string" && info.imdb_id) ids.imdb = info.imdb_id;
  series.ids = ids;

  const total = Math.min(info.number_of_seasons || 0, 50);
  const eps = [];
  const t0 = Date.now();
  const seasons = [];
  for (let s = 1; s <= total; s++) seasons.push(s);
  const results = await parallelLimit(seasons, 4, function (s) {
    return api("tv/" + p.id + "/season/" + s, 18000);
  });
  for (let i = 0; i < results.length; i++) {
    const data = results[i];
    if (!data || !Array.isArray(data.episodes)) continue;
    const s = seasons[i];
    for (let j = 0; j < data.episodes.length; j++) {
      const ep = data.episodes[j];
      if (!ep || typeof ep.episode_number !== "number" || ep.episode_number < 1) continue;
      const e = {
        season: ep.season_number || s,
        number: ep.episode_number,
        ref: eRef(p.id, ep.season_number || s, ep.episode_number),
      };
      const t = safeStr(ep.name, 200);
      if (t) e.title = t;
      const still = img(ep.still_path, 500);
      if (still) e.still = still;
      const ov = safeStr(ep.overview, 2000);
      if (ov) e.overview = ov;
      const ad = safeStr(ep.air_date, 10);
      if (ad && /^\d{4}-\d{2}-\d{2}$/.test(ad)) e.airDate = ad;
      if (typeof ep.runtime === "number" && ep.runtime > 0) e.runtimeMinutes = ep.runtime;
      eps.push(e);
      if (eps.length >= 5000) break;
    }
    if (eps.length >= 5000) break;
    if (Date.now() - t0 > 17000) break;
  }
  return { series: series, episodes: eps };
}

// Lista de servidores de video (con caché por si la API tarda).
let providersCache = null;
async function getProviders() {
  try {
    const r = await kino.fetch(PROVIDERS_API, {
      headers: HEADERS,
      timeoutMs: 12000,
    });
    if (r.ok) {
      const d = r.json();
      if (d && Array.isArray(d.providers) && d.providers.length) {
        providersCache = d.providers;
        return d.providers;
      }
    }
  } catch (e) {
    // La API de proveedores está protegida: usamos la lista de respaldo.
  }
  if (providersCache) return providersCache;
  return FALLBACK_PROVIDERS;
}

function embedUrl(prov, p) {
  const t = p.k === "m" ? prov.movie : prov.tv;
  if (typeof t !== "string" || !t) return null;
  return t
    .replace("{id}", p.id)
    .replace("{s}", String(p.s || 1))
    .replace("{e}", String(p.e || 1));
}

function capture(embedUrlStr) {
  const opts = {
    timeoutMs: 20000,
    headers: { Referer: "https://www.1shows.org/" },
    match: CAPTURE_MATCH,
  };
  if (kino.browser && kino.browser.captureAll === true) {
    opts.captureAll = true;
  }
  return kino.browser.capture(embedUrlStr, opts);
}

export async function resolve(ref, options) {
  await null;
  const p = parseRef(ref);
  if (!p) {
    throw kino.error("not_found", "bad-ref", {
      userMessage: T("No se encontró este video.", "This video was not found."),
    });
  }
  const providers = await getProviders();
  if (!Array.isArray(providers) || !providers.length) {
    throw kino.error("unavailable", "no-providers", {
      userMessage: T("Los servidores no están disponibles ahora.", "The servers are unavailable right now."),
    });
  }
  const tried = [];
  const maxTry = p.srv ? 1 : 3;
  let captured = null;
  let used = null;
  for (let i = 0; i < providers.length && tried.length < maxTry; i++) {
    const prov = providers[i];
    if (p.srv && prov.id !== p.srv) continue;
    const url = embedUrl(prov, p);
    if (!url) continue;
    tried.push(prov.id);
    let c = null;
    try {
      c = await capture(url);
    } catch (e) {
      c = null;
    }
    if (c && Array.isArray(c.media) && c.media.length) {
      captured = c;
      used = prov;
      break;
    }
  }
  if (!captured || !used) {
    throw kino.error("unavailable", "no-media", {
      userMessage: T("Este video no está disponible ahora.", "This video is unavailable right now."),
    });
  }
  const m = captured.media[0];
  const stream = { url: m.url };
  if (m.mime) stream.mime = m.mime;
  else stream.mime = mimeOf(m.url);
  if (m.headers) stream.headers = m.headers;
  // Subtítulos que la página pidió (.vtt / .srt).
  if (Array.isArray(captured.subtitles) && captured.subtitles.length) {
    const subs = [];
    for (let i = 0; i < captured.subtitles.length && subs.length < 30; i++) {
      const s = captured.subtitles[i];
      if (s && typeof s.url === "string" && s.url) {
        subs.push({ lang: s.lang || guessLang(s.url), url: s.url, format: fmtOf(s.url) });
      }
    }
    if (subs.length) stream.subtitles = subs;
  }
  // Los demás servidores, como copias diferidas (la persona elige en el menú Servidor).
  const rest = [];
  for (let i = 0; i < providers.length && rest.length < 8; i++) {
    if (tried.indexOf(providers[i].id) < 0) rest.push(providers[i]);
  }
  if (rest.length) {
    stream.alternatives = rest.map(function (prov) {
      const aref =
        p.k === "m"
          ? mRef(p.id, prov.id)
          : p.k === "t"
            ? tRef(p.id, prov.id)
            : eRef(p.id, p.s, p.e, prov.id);
      return { label: safeStr(prov.label, 48) || prov.id, ref: aref };
    });
  }
  return stream;
}

export async function liveCategories() {
  await null;
  const out = [];
  for (let i = 0; i < COUNTRIES.length; i++) {
    out.push({ id: COUNTRIES[i][0], title: COUNTRIES[i][1], country: COUNTRIES[i][2] });
  }
  return out;
}

const m3uCache = {};
async function channelList(cc) {
  if (m3uCache[cc]) return m3uCache[cc];
  const r = await kino.fetch(IPTV_RAW + cc + ".m3u", {
    headers: { "User-Agent": UA },
    timeoutMs: 25000,
  });
  if (!r.ok) return [];
  const text = r.text();
  const lines = text.split("\n");
  const out = [];
  let name = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.indexOf("#EXTINF") === 0) {
      const comma = line.lastIndexOf(",");
      name = comma >= 0 ? line.slice(comma + 1).trim() : "";
    } else if (line.indexOf("http://") === 0 || line.indexOf("https://") === 0) {
      if (name) {
        out.push({ id: cc + "." + out.length, title: name, url: line });
      }
      name = null;
    }
  }
  m3uCache[cc] = out;
  return out;
}

export async function liveChannels(arg) {
  await null;
  const cc = arg && arg.categoryId;
  if (!cc || !/^[a-z]{2}$/.test(cc)) {
    throw kino.error("not_found", "bad-country", {
      userMessage: T("No se encontró este país.", "This country was not found."),
    });
  }
  const list = await channelList(cc);
  const start = arg && arg.cursor ? parseInt(arg.cursor) || 0 : 0;
  const page = list.slice(start, start + 500);
  const items = page.map(function (c) {
    return {
      id: c.id,
      title: c.title,
      stream: { url: c.url, mime: "application/x-mpegurl" },
    };
  });
  const next = start + 500 < list.length ? String(start + 500) : null;
  return { items: items, next: next };
}
