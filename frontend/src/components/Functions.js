import dateFormat from 'dateformat';

export function ownDateFormat(date) {
    console.log(Date.parse(date))
    return dateFormat(Date.parse(date), 'ddd dd mmm, HH:MM')
}

export function unixFormat(unix) {
    unix = parseInt(unix);
    const d = Math.floor(unix / 8 / 3600);
    const h = Math.floor(unix % (8 * 3600) / 3600);
    const m = Math.floor(unix % (8 * 3600) % 3600 / 60);
    const s = Math.floor(unix % (8 * 3600) % 3600 % 60);
    if (d > 0) {
        return(`${d}d ${h}h ${m}m`)
    } else if (h > 0) {
        return(`${h}h ${m}m`)
    } else if (m > 0) {
        return(`${m}m ${s}s`)
    } else if (s > 0) {
        return(`${s}s`)
    } else {
        return('---')
    }
}