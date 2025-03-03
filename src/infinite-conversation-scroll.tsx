"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
export interface KeyedItem {
  id: string | number;
}
type APIType = {
  endPoint: string;
  preCallback?: () => void;
  onThen?: (data: any) => Promise<any>;
  onCatch?: (error: any) => void;
  onFinally?: () => void;
};
interface InfiniteConversationScrollProps<T extends KeyedItem> {
  items: T[];
  savedPages: Set<number | string>;
  renderItem: (props: {
    item: T;
    effect?: "added" | "deleted";
  }) => React.ReactNode; // Function to render each item
  scrollContainerClassNames?: string;
  scrollContainerStyles?: React.CSSProperties;
  getItemsOnMount: APIType;
  getItemsOnScrollToOlder: APIType;
  getItemsOnScrollToNewer?: APIType;
  onLoadingStateChange?: (isLoading: boolean) => void;
}

export const InfiniteConversationScroll = <T extends KeyedItem>(
  props: InfiniteConversationScrollProps<T>
) => {
  const scrollContainerStyles: React.CSSProperties = {
    height: "100%",
    overflowY: "scroll",
    padding: "10px",
    minWidth: "20rem",
    width: "100%",
    display: "flex",
    paddingBottom: "2rem",
    flexDirection: "column",
    flexGrow: 1,
    ...props.scrollContainerStyles,
  };
  const [savedPages, setSavedPages] = useState<Set<number | string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomTestRefStick = useRef<HTMLDivElement>(null);
  const [hasInitialItemsRendered, setHasInitialItemsRendered] = useState(false);
  const [currOldestPage, setCurrOldestPage] = useState<number | null>(null);
  const [lastStickTop, setLastStickTop] = useState<number | null>(null);
  const [onMountApiRunning, setOnMountApiRunning] = useState(true);
  const [isGetmoreItemsApiRunning, setIsGetmoreItemsApiRunning] =
    useState(false);
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    const { endPoint, preCallback, onThen, onCatch, onFinally } =
      props.getItemsOnMount;
    preCallback?.();
    fetch(endPoint)
      .then((res) => {
        onThen?.(res);
        return res.json();
      })
      .then((data: Array<any>) => {
        setCurrOldestPage(data[0].page);
        setSavedPages((prev) => {
          const newSet = new Set(prev);
          newSet.add(data[0].page);
          newSet.add(data[1].page);
          return newSet;
        });
        const incItems: typeof items = [];
        data.forEach((pageData) => {
          incItems.push(...pageData.thread);
        });

        setItems(incItems);

        setTimeout(() => {
          setHasInitialItemsRendered(true);
        }, 10);
      })
      .catch(onCatch)
      .finally(() => {
        onFinally?.();
        setOnMountApiRunning(false);
      });
  }, []);

  const getMoreItems = (curOldestPage: string) => {
    const { endPoint } = props.getItemsOnScrollToOlder;
    setIsGetmoreItemsApiRunning(true);
    fetch(`${endPoint}${curOldestPage}`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setLastStickTop(
          bottomTestRefStick.current?.getBoundingClientRect().top ?? null
        );
        setItems((prevItems) => [...data.thread, ...prevItems]);
        setCurrOldestPage(data.page);
        setSavedPages((prev) => new Set([...prev, data.page]));
      })
      .finally(() => {
        setIsGetmoreItemsApiRunning(false);
      });
  };

  const addItemsOnTop = () => {
    setSavedPages((prev) => {
      setCurrOldestPage((incOldestPage) => {
        setIsGetmoreItemsApiRunning((incApiRunningState) => {
          if (
            !incApiRunningState &&
            incOldestPage != null &&
            !prev.has(incOldestPage - 1)
          )
            getMoreItems((incOldestPage - 1).toString());
          return incApiRunningState;
        });

        return incOldestPage;
      });

      return prev;
    });
  };

  const moveScrollTopToLastPosition = (newTop: number, lastTop: number) => {
    let updatedTop = bottomTestRefStick.current?.getBoundingClientRect().top;
    if (newTop >= lastTop) {
      do {
        const scrollTop = containerRef.current;
        if (scrollTop) {
          scrollTop.scrollTop += 1;
          updatedTop = bottomTestRefStick.current?.getBoundingClientRect().top;
        }
      } while (updatedTop && Math.abs(updatedTop - lastTop) > 1);
    } else {
      do {
        const scrollTop = containerRef.current;
        if (scrollTop) {
          scrollTop.scrollTop -= 1;
          updatedTop = bottomTestRefStick.current?.getBoundingClientRect().top;
        }
      } while (updatedTop && Math.abs(updatedTop - lastTop) < 1);
    }
  };

  useLayoutEffect(() => {
    const newStickTop =
      bottomTestRefStick.current?.getBoundingClientRect().top ?? null;
    if (lastStickTop && newStickTop) {
      moveScrollTopToLastPosition(newStickTop, lastStickTop);
      setLastStickTop(null);
    }
  }, [items, lastStickTop]);

  const handlePrevThreadFetching = () => {
    addItemsOnTop();
  };

  const handleNextThreadFetching = () => {};

  const handleScroll = () => {
    const scrollTop = containerRef?.current?.scrollTop;
    const scrollboxHeight = containerRef?.current?.scrollHeight;

    if (scrollTop != undefined && scrollTop < 10000) {
      debouncePrevDataFetching();
    }
    if (
      scrollTop != undefined &&
      scrollboxHeight &&
      scrollboxHeight - scrollTop < 1000
    ) {
      handleNextThreadFetching();
    }
  };

  const debouncePrevDataFetching = useCallback(
    debounce(handlePrevThreadFetching, 500, true),
    []
  );

  const keepScrollingToBottom = () => {
    const scrollTop = containerRef.current?.scrollTop;
    const scrollboxHeight = containerRef.current?.scrollHeight;
    if (
      scrollTop != undefined &&
      scrollboxHeight != undefined &&
      containerRef.current &&
      scrollboxHeight - scrollTop != 0
    ) {
      containerRef.current.scrollTo({
        top: scrollboxHeight,
        behavior: "smooth",
      });

      setTimeout(() => {
        containerRef?.current?.scrollTo({
          top: scrollboxHeight,
          behavior: "smooth",
        });
      }, 500);
    }
  };

  useLayoutEffect(() => {
    const scrollboxHeight = containerRef?.current?.scrollHeight;
    if (
      containerRef?.current?.scrollTop !== undefined &&
      containerRef.current.scrollTop !== null &&
      hasInitialItemsRendered &&
      scrollboxHeight != undefined
    ) {
      keepScrollingToBottom();
    }
  }, [hasInitialItemsRendered]);

  useEffect(() => {
    props.onLoadingStateChange?.(onMountApiRunning);
  }, [onMountApiRunning]);

  useEffect(() => {
    props.onLoadingStateChange?.(isGetmoreItemsApiRunning);
  }, [isGetmoreItemsApiRunning]);

  return (
    <div
      ref={containerRef}
      style={scrollContainerStyles}
      onScroll={handleScroll}
    >
      {items.map((item) => {
        return props.renderItem({ item: item });
      })}
      <div
        ref={bottomTestRefStick}
        style={{ visibility: "hidden", width: "100%" }}
      />
    </div>
  );
};

const debounce = (
  func: Function,
  delay: number = 300,
  triggerFirstCall = false
) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  let iCount = 0;
  return function (this: any, ...args: any[]) {
    const context = this;
    const [value] = args;
    if (triggerFirstCall && iCount === 0) {
      func.apply(context, [value]);
    }
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (!triggerFirstCall) {
        func.apply(context, [value]);
      }
      iCount = 0;
    }, delay);
    iCount++;
  };
};

