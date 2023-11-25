import { db } from "firebase-app/firebase-config";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect } from "react";
import { useState } from "react";
import { userStatus } from "utils/constants";

const useGetUserIdByEmail = (email = "") => {
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function fetchData() {
      const colRef = query(
        collection(db, "users"),
        where("email", "==", email),
        where("status", "==", userStatus.ACTIVE)
      );

      onSnapshot(colRef, (snapshot) => {
        let results = [];
        snapshot.forEach((doc) => {
          results.push({
            id: doc.id,
            ...doc.data(),
          });
          doc.data() && setUserId(doc.id);
        });
      });
    }
    fetchData();
  }, [email]);

  return { userId };
};

export default useGetUserIdByEmail;
