export const debounce = (
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
