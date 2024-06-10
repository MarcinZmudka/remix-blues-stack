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
    const isBlocked = await this.getItem("block");
    if (isBlocked) {
      return;
    }
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

  static async block() {
    this.setItem("block", true, { expireIn: 1000 * 60 * 60 * 24 });
  }

  static async unblock() {
    this.removeItem("block");
  }
}
