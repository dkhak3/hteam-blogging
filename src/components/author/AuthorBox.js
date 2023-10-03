import { db } from "firebase-app/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import React, { useState, useEffect } from "react";

const AuthorBox = ({ userId = "" }) => {
  const [user, setUser] = useState({});

  useEffect(() => {
    async function fetchUserData() {
      const docRef = doc(db, "users", userId || "");
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.data()) {
        setUser(docSnapshot.data());
      }
    }

    fetchUserData();
  }, [userId]);

  if (!userId) return null;
  return (
    <div className="author overflow-auto">
      <div className="author-image">
        <img src={user?.avatar} alt={user?.username} />
      </div>
      <div className="author-content">
        <h3 className="author-name">{user?.fullname}</h3>
        <p className="author-desc">{user?.description || ""}</p>
      </div>
    </div>
  );
};

export default AuthorBox;
