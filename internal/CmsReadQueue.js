import rootCms from "./RootCms";
import {CmsClient} from "../CmsClient";

class CmsReadQueue {
  constructor() {
    this._keys = [];
    this._promises = {}
    this._resolutions = {}
    this._coalesceTimeout = null;
  }

  add(keys) {
    for (const key of keys) {
      if (!(key in rootCms) && !(key in this._keys) && !(key in this._resolutions)) {
        this._keys.push(key);
        this._promises[key] = new Promise((resolve, reject) => {
          this._resolutions[key] = resolve;
        });
      }
    }

    // We wait a very small time to allow coalesced fetches of the cms sections.
    if (!this._coalesceTimeout) {
      this._coalesceTimeout = setTimeout(async() => {
        this._coalesceTimeout = null;
        await this._readCms();
      }, 20);
    }
  }

  async waitForData(key) {
    if (key in rootCms) {
      return rootCms[key];
    }

    if (!(key in this._promises)) {
      throw new Error("Need to first request data before you can wait for it.");
    }

    return this._promises[key];
  }

  async _readCms() {
    const keysCopy = [...this._keys];
    let dataPerKey = keysCopy.map(() => {
      return {};
    });
    this._keys = [];

    try {
      if (keysCopy.length === 0) {
        return;
      }

      console.log(`fetching cms keys: [${keysCopy}]`);
      const startTime = Date.now();
      dataPerKey = await CmsClient.readCms(keysCopy);
      const endTime = Date.now();
      console.log(`fetched cms keys [${keysCopy}] in ${endTime - startTime}ms`);
    } catch (e) {
      console.error(e);
    } finally {
      for (let i = 0; i < keysCopy.length; i++) {
        const key = keysCopy[i];
        const data = dataPerKey[i];
        this._resolutions[key](data);
        delete this._resolutions[key];
        delete this._promises[key];
      }
    }
  }
}

export default new CmsReadQueue();
