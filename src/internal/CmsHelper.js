/**
 * Static helpers which make it easier to work with CMS data.
 */
export class CmsHelper {

  static decode(data) {
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          let item = value[i];
          value[i] = CmsHelper._simplifyStrings(item);
        }
      } else {
        data[key] = CmsHelper._simplifyStrings(value);
      }
    }
  }

  /**
   * Strings are actually encoded as 1-key maps with a key of '_'
   * We decode them back into strings here.
   */
  static _simplifyStrings(item) {
    const itemKeys = Object.keys(item);
    if (itemKeys.length === 1 && itemKeys[0] === '_') {
      return item[itemKeys[0]];
    } else {
      return item;
    }
  }
}
