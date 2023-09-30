import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "firebase-app/firebase-config";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export function Actions({
  bookmark,
  setBookmark,
  love,
  setLove,
  shareFacebook,
  shareTwitter,
  postInfo,
  userInfo,
}) {
  const [userId, setUserId] = useState("");
  console.log("userId", userId);

  useEffect(() => {
    if (userInfo) {
      async function fetchData() {
        const colRef = query(
          collection(db, "users"),
          where("email", "==", userInfo?.email),
          where("status", "==", 1)
        );

        onSnapshot(colRef, (snapShot) => {
          snapShot.forEach((doc) => {
            setUserId(doc.id);
          });
        });
      }
      fetchData();
    }
  }, [userInfo?.email]);

  // check display love user
  useEffect(() => {
    postInfo?.loveIdUsers?.forEach((item) => {
      if (item === userId) {
        setLove((prev) => setLove(!prev));
      } else {
        setLove(false);
      }
    });
  }, [postInfo.loveIdUsers, setLove, userId]);

  // check display bookmark users
  useEffect(() => {
    if (userInfo) {
      userInfo?.bookmarkPostsId?.forEach((item) => {
        if (item === postInfo?.id) {
          console.log("item", item);
          setBookmark((prev) => setBookmark(!prev));
        } else {
          setBookmark(false);
        }
      });
    }
  }, [postInfo?.id, setBookmark, userInfo]);

  // handle love
  const handleIncreaseLove = async () => {
    if (userInfo) {
      setLove(true);
      const docRef = doc(db, "posts", postInfo?.id);
      await updateDoc(docRef, {
        love: postInfo?.love + 1,
        loveIdUsers: [...postInfo?.loveIdUsers, userId],
      });

      const docRefUser = doc(db, "users", userId);
      await updateDoc(docRefUser, {
        lovePostsId: [...userInfo?.lovePostsId, postInfo?.id],
      });
    }
  };
  const handleReduceLove = async () => {
    if (userInfo) {
      setLove(false);
      const docRef = doc(db, "posts", postInfo?.id);
      await updateDoc(docRef, {
        love: postInfo?.love - 1,
        loveIdUsers: postInfo?.loveIdUsers.filter((e) => e !== userId),
      });
      const docRefUser = doc(db, "users", userId);
      await updateDoc(docRefUser, {
        lovePostsId: userInfo?.lovePostsId.filter((e) => e !== postInfo?.id),
      });
    }
  };

  // handle bookmark
  const hanleSaveBookmark = async () => {
    if (userInfo) {
      const docRefUser = doc(db, "users", userId);
      await updateDoc(docRefUser, {
        bookmarkPostsId: [...userInfo?.bookmarkPostsId, postInfo?.id],
      });
    }
  };

  const handleDeleteBookmark = async () => {
    if (userInfo) {
      const docRefUser = doc(db, "users", userId);
      await updateDoc(docRefUser, {
        bookmarkPostsId: userInfo?.bookmarkPostsId.filter(
          (e) => e !== postInfo?.id
        ),
      });
    }
  };

  return (
    <>
      {/* Love */}
      <div className="love flex items-center justify-center">
        {!love ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
            onClick={() => {
              handleIncreaseLove();
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#ED2B48"
            className="w-6 h-6"
            onClick={() => {
              handleReduceLove();
            }}
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        )}

        <span>{postInfo?.love ? postInfo?.love : 0}</span>
      </div>

      {/* Comment */}
      <div className="comment flex items-center justify-center">
        <span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
            />
          </svg>
        </span>

        <span>{postInfo?.comment ? postInfo?.comment : 0}</span>
      </div>

      {/* Bookmark */}
      <div className="bookmark flex items-center justify-center">
        {!bookmark ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6 hover:text-yellow-400"
            onClick={() => {
              setBookmark(true);
              toast.success("Add to saved folder");
              hanleSaveBookmark();
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#facc15"
            className="w-6 h-6"
            onClick={() => {
              setBookmark(false);
              toast.success("Delete from saved folder");
              handleDeleteBookmark();
            }}
          >
            <path
              fillRule="#facc15"
              d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z"
              clipRule="#facc15"
            />
          </svg>
        )}
      </div>
      {!shareFacebook ? (
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="facebook"
          className="w-6 h-6 hover:text-[#0866FF]"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            fill="currentColor"
            d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.8 90.69 226.4 209.3 245V327.7h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.3 482.4 504 379.8 504 256z"
          />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="facebook"
          className="w-6 h-6"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            fill="#0866FF"
            d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.8 90.69 226.4 209.3 245V327.7h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.3 482.4 504 379.8 504 256z"
          />
        </svg>
      )}
      {!shareTwitter ? (
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="twitter"
          className="w-6 h-6 hover:text-[#0866FF]"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            fill="currentColor"
            d="M459.4 151.7c.325 4.548 .325 9.097 .325 13.65 0 138.7-105.6 298.6-298.6 298.6-59.45 0-114.7-17.22-161.1-47.11 8.447 .974 16.57 1.299 25.34 1.299 49.06 0 94.21-16.57 130.3-44.83-46.13-.975-84.79-31.19-98.11-72.77 6.498 .974 12.99 1.624 19.82 1.624 9.421 0 18.84-1.3 27.61-3.573-48.08-9.747-84.14-51.98-84.14-102.1v-1.299c13.97 7.797 30.21 12.67 47.43 13.32-28.26-18.84-46.78-51.01-46.78-87.39 0-19.49 5.197-37.36 14.29-52.95 51.65 63.67 129.3 105.3 216.4 109.8-1.624-7.797-2.599-15.92-2.599-24.04 0-57.83 46.78-104.9 104.9-104.9 30.21 0 57.5 12.67 76.67 33.14 23.72-4.548 46.46-13.32 66.6-25.34-7.798 24.37-24.37 44.83-46.13 57.83 21.12-2.273 41.58-8.122 60.43-16.24-14.29 20.79-32.16 39.31-52.63 54.25z"
          />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="twitter"
          className="w-6 h-6"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            fill="#0866FF"
            d="M459.4 151.7c.325 4.548 .325 9.097 .325 13.65 0 138.7-105.6 298.6-298.6 298.6-59.45 0-114.7-17.22-161.1-47.11 8.447 .974 16.57 1.299 25.34 1.299 49.06 0 94.21-16.57 130.3-44.83-46.13-.975-84.79-31.19-98.11-72.77 6.498 .974 12.99 1.624 19.82 1.624 9.421 0 18.84-1.3 27.61-3.573-48.08-9.747-84.14-51.98-84.14-102.1v-1.299c13.97 7.797 30.21 12.67 47.43 13.32-28.26-18.84-46.78-51.01-46.78-87.39 0-19.49 5.197-37.36 14.29-52.95 51.65 63.67 129.3 105.3 216.4 109.8-1.624-7.797-2.599-15.92-2.599-24.04 0-57.83 46.78-104.9 104.9-104.9 30.21 0 57.5 12.67 76.67 33.14 23.72-4.548 46.46-13.32 66.6-25.34-7.798 24.37-24.37 44.83-46.13 57.83 21.12-2.273 41.58-8.122 60.43-16.24-14.29 20.79-32.16 39.31-52.63 54.25z"
          />
        </svg>
      )}
    </>
  );
}