/**
 * Genre helpers.
 *
 * The catalogue contains casing variants of the same genre (e.g. "Sci-Fi" and
 * "Sci-fi"), so every comparison here is case-insensitive.
 */

export const sameGenre = (a, b) =>
    Boolean(a) && Boolean(b) && a.toLowerCase() === b.toLowerCase();

export const hasGenre = (movie, genreName) =>
    (movie?.genre ?? []).some((g) => sameGenre(g?.genre_name, genreName));

export const genreNames = (movie) =>
    (movie?.genre ?? []).map((g) => g?.genre_name).filter(Boolean);
