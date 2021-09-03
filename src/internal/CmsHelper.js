/**
 * Static helpers which make it easier to work with CMS data.
 */
export class CmsHelper {

  /**
   * Strings are actually encoded as 1-key maps with a key of '_'
   * We decode them back into strings here.
   */
  static decode(data) {
    for (const key of Object.keys(data)) {
      const item = data[key];
      const itemKeys = Object.keys(item);
      if (itemKeys.length === 1 && itemKeys[0] === '_') {
        data[key] = item[itemKeys[0]];
      }
    }
  }
}
