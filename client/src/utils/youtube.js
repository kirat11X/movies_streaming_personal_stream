export function getYouTubeId(value) {
    if (!value) return '';

    const rawValue = String(value).trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(rawValue)) return rawValue;

    try {
        const url = new URL(rawValue);
        if (url.hostname === 'youtu.be') {
            return url.pathname.slice(1).split('/')[0];
        }
        if (url.hostname.endsWith('youtube.com')) {
            return url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop() || '';
        }
    } catch {
        return '';
    }

    return '';
}
