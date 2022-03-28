import React from 'react';
import ContentLoader from 'react-content-loader';
import {useEffect, useCallback, useRef, useMemo, useState} from "react";

const Placeholder = props => {
  const {style} = props;
  let {width, height, padding, paddingTop, paddingRight, paddingBottom, paddingLeft} = style;

  if (!width && !height) {
    return null;
  }

  const [ourWidth, setOurWidth] = useState(null);
  const [ourHeight, setOurHeight] = useState(null);

  const outerRef = useRef();

  const updateSize = useCallback(() => {
    if (outerRef.current) {
      let parentWidth = outerRef.current.parentNode.offsetWidth;
      let parentHeight = outerRef.current.parentNode.offsetHeight;

      if (width) {
        setOurWidth(width);
      } else {
        setOurWidth(parentWidth);
      }

      if (height) {
        setOurHeight(height);
      } else {
        setOurHeight(parentHeight);
      }
    }
  }, [outerRef]);

  useEffect(() => {
    updateSize();

    if (window) {
      window.addEventListener("resize", updateSize);
    }

    return () => {
      if (window) {
        window.removeEventListener("resize", updateSize);
      }
    }
  }, [updateSize]);

  const overrideStyle = useMemo(() => {
    const s = {
      width: ourWidth,
      height: ourHeight
    }
    if (padding) {
      s.padding = `${padding}px`;
    } else {
      if (paddingTop) {
        s.paddingTop = `${paddingTop}px`;
      }
      if (paddingRight) {
        s.paddingRight = `${paddingRight}px`;
      }
      if (paddingBottom) {
        s.paddingBottom = `${paddingBottom}px`;
      }
      if (paddingLeft) {
        s.paddingLeft = `${paddingLeft}px`;
      }
    }
    return s;
  }, [ourWidth, ourHeight]);

  let contentWidth = ourWidth;
  let contentHeight = ourHeight;

  if (padding) {
    contentWidth -= (2 * padding);
    contentHeight -= (2 * padding);
  } else {
    if (paddingTop) {
      contentHeight -= paddingTop;
    }
    if (paddingRight) {
      contentWidth -= paddingRight;
    }
    if (paddingBottom) {
      contentHeight -= paddingBottom;
    }
    if (paddingLeft) {
      contentWidth -= paddingLeft;
    }
  }

  return (
    <div style={overrideStyle} ref={outerRef}>
      <ContentLoader
        width={contentWidth}
        height={contentHeight}
        viewBox={`0 0 ${contentWidth} ${contentHeight}`}
        speed={1.8}
        backgroundColor="#d9d9d9"
        backgroundOpacity={.17}
        foregroundColor="#ecebeb"
        foregroundOpacity={.21}
        gradientRatio={2}
        interval={.1}
      >
        <rect x={0} y={0} rx={3} ry={3} width={contentWidth} height={contentHeight}/>
      </ContentLoader>
    </div>
  );
}

export default Placeholder;
