import localForage from "localforage";

const DEFAULT_EXPIRE_IN_MILLISECONDS = 60 * 1000; // 1 minute

export class IndexDBCache {
  static async setItem(
    key: string,
    value: unknown,
    options = {
      expireIn: DEFAULT_EXPIRE_IN_MILLISECONDS,
    },
  ) {
    const expirationTime = new Date().getTime() + options.expireIn;
    const item = {
      value,
      expirationTime,
    };

    await localForage.setItem(key, item);
  }

  static async getItem(key: string) {
    const item = await localForage.getItem<{
      value: unknown;
      expirationTime: number;
    }>(key);

    if (item === null) {
      return null;
    }

    if (new Date().getTime() > item.expirationTime) {
      await localForage.removeItem(key);
      return null;
    }

    return item.value;
  }

  static async removeItem(key: string) {
    await localForage.removeItem(key);
  }
}
