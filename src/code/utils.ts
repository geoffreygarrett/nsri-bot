export function toSnakeCase(str: string): string {
    return str
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()
        .replace(/^_/, '');
}

export function convertKeysToSnakeCase(obj: any, depth = 0, seen = new WeakSet()): any {
    if (depth > 10) { // Set a reasonable limit to recursion depth
        return obj;
    }

    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (seen.has(obj)) {
        // Circular reference detected
        return obj;
    }
    seen.add(obj);

    if (Array.isArray(obj)) {
        return obj.map(item => convertKeysToSnakeCase(item, depth + 1, seen));
    }

    return Object.keys(obj).reduce((result: any, key: string) => {
        const newKey = toSnakeCase(key);
        result[newKey] = convertKeysToSnakeCase(obj[key], depth + 1, seen);
        return result;
    }, {});
}