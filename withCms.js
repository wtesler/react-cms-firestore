import {useCallback, useEffect, useMemo, useState} from "react";
import rootCms from "./internal/RootCms";
import cmsReadQueue from "./internal/CmsReadQueue";
import {CmsHelper} from "./internal/CmsHelper";

/**
 * Injects CMS data into the component.
 * Pass in the cms keys for the data the component needs.
 * Waits until cms data is ready before rendering component.
 *
 * Access data with props.cms from inside component.
 */
export default function withCms(WrappedComponent, keys = []) {
  return props => {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    const initialReadyState = keys.length === 0 || keys.every(key => key in rootCms);

    const [isCmsReady, setIsCmsReady] = useState(initialReadyState);

    const readCms = useCallback(async (keys) => {
      cmsReadQueue.add(keys);

      const waitPromises = [];
      for (const key of keys) {
        waitPromises.push(cmsReadQueue.waitForData(key));
      }

      const dataPerKey = await Promise.all(waitPromises);

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const data = dataPerKey[i];
        CmsHelper.decode(data);
        rootCms[key] = data;
      }

      setIsCmsReady(true);
    }, []);

    useEffect(() => {
      if (isCmsReady) {
        return;
      }

      readCms(keys);
    }, [isCmsReady, readCms]);

    const content = useMemo(() => {
      if (!isCmsReady) {
        return null;
      }
      return <WrappedComponent {...props} cms={rootCms}/>;
    }, [props, isCmsReady]);

    return content;
  };
}