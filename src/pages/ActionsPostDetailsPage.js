import { db } from "firebase-app/firebase-config";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FacebookShareButton, TwitterShareButton } from "react-share";
import useGetUserIdByEmail from "hooks/useGetUserIdByEmail";

const ActionsPostDetailsPage = ({ postInfo = [], userInfo = [] }) => {
  const [userId, setUserId] = useState("");
  const urlPost = window.location.href;
  const { userId: userIdByEmail } = useGetUserIdByEmail(userInfo?.email || "");

  // get userid đang login
  useEffect(() => {
    if (userInfo) {
      async function fetchData() {
        const colRef = query(
          collection(db, "users"),
          where("email", "==", userInfo?.email ? userInfo?.email : ""),
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
  }, [userInfo]);

  // handle love
  const handleIncreaseLove = async () => {
    if (userInfo) {
      const docRef = doc(db, "posts", postInfo?.id);
      await updateDoc(docRef, {
        loveIdUsers: [...postInfo?.loveIdUsers, userId],
      });

      const docRefUser = doc(db, "users", userId);
      await updateDoc(docRefUser, {
        lovePostsId: [...userInfo?.lovePostsId, postInfo?.id],
      });
    } else {
      toast.info("Please log in to do it");
    }
  };
  const handleReduceLove = async () => {
    if (userInfo) {
      const docRef = doc(db, "posts", postInfo?.id);
      await updateDoc(docRef, {
        loveIdUsers: postInfo?.loveIdUsers.filter((e) => e !== userId),
      });
      const docRefUser = doc(db, "users", userId);
      await updateDoc(docRefUser, {
        lovePostsId: userInfo?.lovePostsId.filter((e) => e !== postInfo?.id),
      });
    } else {
      toast.info("Please log in to do it");
    }
  };

  // handle bookmark
  const hanleSaveBookmark = async () => {
    if (userInfo) {
      const userRef = doc(db, "users", userIdByEmail || "");

      updateDoc(userRef, {
        bookmarkPostsId: arrayUnion({
          id: postInfo?.uid,
        }),
      })
        .then(() => {
          toast.success("Add to saved folder");
        })
        .catch((error) => {
          toast.error("Cannot add to saved folder");
        });
    } else {
      toast.info("Please log in to do it");
    }
  };
  const handleDeleteBookmark = async () => {
    if (userInfo) {
      const userRef = doc(db, "users", userIdByEmail || "");

      updateDoc(userRef, {
        bookmarkPostsId: arrayRemove({ id: postInfo?.uid }),
      })
        .then((e) => {
          toast.success("Delete from saved folder");
        })
        .catch((error) => {
          toast.error("Cannot delete from saved folder");
        });
    } else {
      toast.info("Please log in to do it");
    }
  };

  const [copied, setCopied] = useState(false);

  function copy() {
    const el = document.createElement("input");
    el.value = window.location.href;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    setCopied(true);
    toast.success("Copy link successfully");
  }

  const handleClickComment = () => {
    if (!userInfo) {
      toast.info("Please log in to do it");
    } else {
      document.body.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  return (
    <>
      {/* Love */}
      <div className="love flex items-center justify-center">
        {userInfo &&
        postInfo?.loveIdUsers?.find((item) => [userId].includes(item)) ? (
          <div title="You liked this post">
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
          </div>
        ) : (
          <div>
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
          </div>
        )}
        <span>{postInfo?.loveIdUsers ? postInfo?.loveIdUsers?.length : 0}</span>
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
            onClick={() => handleClickComment()}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
            />
          </svg>
        </span>

        <span>
          {postInfo?.commentIdUsers ? postInfo?.commentIdUsers.length : 0}
        </span>
      </div>
      {/* Bookmark */}
      <div className="bookmark flex items-center justify-center">
        {userInfo &&
        userInfo?.bookmarkPostsId?.find((item) =>
          [postInfo?.uid].includes(item.id)
        ) ? (
          <div title="You saved this post">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#facc15"
              className="w-6 h-6"
              onClick={() => {
                handleDeleteBookmark();
              }}
            >
              <path
                fillRule="#facc15"
                d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z"
                clipRule="#facc15"
              />
            </svg>
          </div>
        ) : (
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6 hover:text-yellow-400"
              onClick={() => {
                hanleSaveBookmark();
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Drop down */}
      <div className="dropdown inline-block relative">
        <button className="font-semibold py-2 px-4 rounded inline-flex items-center">
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
              d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
        </button>
        <ul className="dropdown-menu absolute hidden pt-1 w-[230px] rounded-lg shadow-[0,-4px,32px,rgba(0,0,0,.2)] text-black">
          <li className="hover:bg-[#f0f0f0]">
            <FacebookShareButton
              url={urlPost}
              quote={postInfo?.title}
              hashtag={postInfo?.category?.name}
            >
              <div className="flex hover:text-black transition-[0.3s] text-2xl pt-3 pb-3 pl-5 pr-5 w-[230px]">
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
                    fill="currentColor"
                    d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.8 90.69 226.4 209.3 245V327.7h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.3 482.4 504 379.8 504 256z"
                  />
                </svg>
                <span className="ml-4 text-sm">Share on Facebook</span>
              </div>
            </FacebookShareButton>
          </li>
          <li className="flex hover:bg-[#f0f0f0]">
            <TwitterShareButton
              url={urlPost}
              quote={postInfo?.title}
              hashtag={postInfo?.category?.name}
            >
              <div className="flex hover:text-black transition-[0.3s] text-2xl pt-3 pb-3 pl-5 pr-5">
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
                    fill="currentColor"
                    d="M459.4 151.7c.325 4.548 .325 9.097 .325 13.65 0 138.7-105.6 298.6-298.6 298.6-59.45 0-114.7-17.22-161.1-47.11 8.447 .974 16.57 1.299 25.34 1.299 49.06 0 94.21-16.57 130.3-44.83-46.13-.975-84.79-31.19-98.11-72.77 6.498 .974 12.99 1.624 19.82 1.624 9.421 0 18.84-1.3 27.61-3.573-48.08-9.747-84.14-51.98-84.14-102.1v-1.299c13.97 7.797 30.21 12.67 47.43 13.32-28.26-18.84-46.78-51.01-46.78-87.39 0-19.49 5.197-37.36 14.29-52.95 51.65 63.67 129.3 105.3 216.4 109.8-1.624-7.797-2.599-15.92-2.599-24.04 0-57.83 46.78-104.9 104.9-104.9 30.21 0 57.5 12.67 76.67 33.14 23.72-4.548 46.46-13.32 66.6-25.34-7.798 24.37-24.37 44.83-46.13 57.83 21.12-2.273 41.58-8.122 60.43-16.24-14.29 20.79-32.16 39.31-52.63 54.25z"
                  />
                </svg>
                <span className="ml-4 text-sm">Share on Twitter</span>
              </div>
            </TwitterShareButton>
          </li>
          <li className="flex hover:bg-[#f0f0f0]" onClick={copy}>
            <div className="flex hover:text-black transition-[0.3s] text-2xl pt-3 pb-3 pl-5 pr-5">
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
                  d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                />
              </svg>
              <span className="ml-4 text-sm">
                {!copied ? "Copy link" : "Copied!"}
              </span>
            </div>
          </li>
        </ul>
      </div>
    </>
  );
};

export default ActionsPostDetailsPage;
