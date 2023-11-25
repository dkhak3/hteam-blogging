import { useEffect } from "react";
import { useState } from "react";

const useConverArrObjToArrString = (array = "") => {
  const [arrString, setArrString] = useState("");

  // Convert array object to array string
  useEffect(() => {
    if (array.length > 0) {
      const arrayOfStrings = array?.map((obj) => `${obj.id}`);
      setArrString(arrayOfStrings);
    }
  }, [array]);

  return { arrString };
};

export default useConverArrObjToArrString;
