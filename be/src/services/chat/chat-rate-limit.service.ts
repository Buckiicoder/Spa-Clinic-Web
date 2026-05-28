const requestMap = new Map();

export class ChatRateLimitService {
  static check(key: string, limit: number) {
    const now = Date.now();

    const data = requestMap.get(key);

    if (!data) {
      requestMap.set(key, {
        count: 1,
        start: now,
      });

      return true;
    }

    if (now - data.start > 3600000) {
      requestMap.set(key, {
        count: 1,
        start: now,
      });

      return true;
    }

    if (data.count >= limit) {
      return false;
    }

    data.count++;

    return true;
  }
}