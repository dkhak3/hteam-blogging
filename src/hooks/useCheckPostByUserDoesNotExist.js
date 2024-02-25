import { doc, getDoc } from "firebase/firestore";
import { useEffect } from "react";
import { useState } from "react";
import { db } from "firebase-app/firebase-config";

const useCheckPostByUserDoesNotExist = (posts = "") => {
  console.log("🚀 ~ useCheckPostByUserDoesNotExist ~ posts:", posts);
  const [user, setUser] = useState({});
  console.log("🚀 ~ useCheckPostByUserDoesNotExist ~ user:", user);

  useEffect(() => {
    async function fetchUserData() {
      const docRef = doc(db, "users", posts?.user?.id || "");
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.data()) {
        setUser(docSnapshot.data());
      }
    }

    fetchUserData();
  }, [posts?.user?.id]);

  return { user };
};

export default useCheckPostByUserDoesNotExist;
