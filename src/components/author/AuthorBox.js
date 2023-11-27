import { db } from "firebase-app/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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
        <Link to={`/author/${user.username}`}>
          <img
            src={user?.avatar ? user?.avatar : "./default-avatar.png"}
            alt={user?.username}
          />
        </Link>
      </div>
      <div className="author-content">
        <Link to={`/author/${user.username}`}>
          <h3 className="author-name">
            {user?.fullname ? user?.fullname : "Blog user"}
          </h3>
        </Link>

        <p className="author-desc">{user?.description || ""}</p>
      </div>
    </div>
  );
};

export default AuthorBox;
