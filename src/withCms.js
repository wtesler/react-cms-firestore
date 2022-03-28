import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import cmsReadQueue from "./internal/CmsReadQueue";
import {CmsHelper} from "./internal/CmsHelper";
import React from 'react';
import Placeholder from "./internal/placeholder/Placeholder";

// Global singleton which acts as the cms which gets injected into components.
if (!globalThis.cms_firestore) {
  globalThis.cms_firestore = {};
}

/**
 * Injects CMS data into the component.
 * Pass in the cms keys for the data the component needs.
 * Waits until cms data is ready before rendering component.
 *
 * Access data with props.cms from inside component.
 */
export default function withCms(WrappedComponent, keys = [], placeHolderStyle) {
  return props => {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    const rootCms = globalThis.cms_firestore;

    const initialReadyState = keys.length === 0 || keys.every(key => key in rootCms);

    const [isCmsReady, setIsCmsReady] = useState(initialReadyState);

    const mountedRef = useRef(true);
    useEffect(() => {
      return () => {
        mountedRef.current = false
      }
    }, []);

    const readCms = useCallback(async (keys) => {
      cmsReadQueue.add(keys, rootCms);

      const waitPromises = [];
      for (const key of keys) {
        waitPromises.push(cmsReadQueue.waitForData(key, rootCms));
      }

      const dataPerKey = await Promise.all(waitPromises);

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const data = dataPerKey[i];
        CmsHelper.decode(data);
        rootCms[key] = data;
      }

      if (mountedRef.current) {
        setIsCmsReady(true);
      }
    }, []);

    useEffect(() => {
      if (isCmsReady) {
        return;
      }

      readCms(keys);
    }, [isCmsReady, readCms]);

    const content = useMemo(() => {
      if (!isCmsReady || (placeHolderStyle && placeHolderStyle.test)) {
        if (placeHolderStyle) {
          return React.createElement(Placeholder, {style: placeHolderStyle});
        } else {
          return null;
        }
      }
      return React.createElement(WrappedComponent, Object.assign({}, props, {cms: rootCms}));
    }, [props, isCmsReady]);

    return content;
  };
}
