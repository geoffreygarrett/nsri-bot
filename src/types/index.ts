export const BuoyStatus = {
    OK: 'OK',
    MISSING: 'MISSING',
    PROPOSED: 'PROPOSED',
    ATTENTION: 'ATTENTION',
    UNKNOWN: 'UNKNOWN'
};

export type BuoyStatus = (typeof BuoyStatus)[keyof typeof BuoyStatus]