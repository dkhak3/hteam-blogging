import { useEffect } from "react";
import { useState } from "react";

const useReadingProgress = () => {
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const upadteScrollCompletion = () => {
      const scrollProgress = window.scrollY;
      const scrollHeight = document.body.scrollHeight - window.innerHeight;

      if (scrollHeight) {
        setCompletion(Number(scrollProgress / scrollHeight).toFixed(2) * 100);
      }
    };

    window.addEventListener("scroll", upadteScrollCompletion);

    return () => {
      window.removeEventListener("scroll", upadteScrollCompletion);
    };
  }, []);
  return completion;
};

export default useReadingProgress;
