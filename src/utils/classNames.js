export default function classNames(...args) {
  return args
    .reduce((acc, val) => {
      // string
      if (typeof val === "string") {
        return acc.concat(val.split(" "));
      }
      // Object
      return acc.concat(Object.values(val));
    }, [])
    .join(" ");
}

// w-full py-4 px-6 -> ["w-full", "py-4", "px-6"] -> "w-full py-4 px-6"
