import { useAuth } from "contexts/auth-context";
import { db } from "firebase-app/firebase-config";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import DashboardHeading from "module/dashboard/DashboardHeading";
import React, { useEffect, useState } from "react";
import { postStatus } from "utils/constants";

const DashboardPage = () => {
  const { userInfo } = useAuth();
  const [postList, setPostList] = useState([]);

  const [categoryList, setCategoryList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [postPendingList, setPostPendingList] = useState([]);

  useEffect(() => {
    // postList
    const colRefPost = collection(db, "posts");
    onSnapshot(colRefPost, (snapshot) => {
      let results = [];
      snapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setPostList(results);
    });

    // categoryList
    const colRefCategory = collection(db, "categories");
    onSnapshot(colRefCategory, (snapshot) => {
      let results = [];
      snapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setCategoryList(results);
    });

    // userList
    const colRefUser = collection(db, "users");
    onSnapshot(colRefUser, (snapshot) => {
      let results = [];
      snapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setUserList(results);
    });

    const colRefPendingPost = query(
      collection(db, "posts"),
      where("status", "==", postStatus.PENDING)
    );
    onSnapshot(colRefPendingPost, (snapshot) => {
      let results = [];
      snapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setPostPendingList(results);
    });
  }, []);

  return (
    <div>
      <DashboardHeading
        title="Dashboard"
        desc="Overview dashboard monitor"
      ></DashboardHeading>
      <div className="grid lg:grid-cols-4 grid-cols-2 lg:gap-x-3 gap-x-3 gap-y-3 text-xl font-medium text-[#1DC071]">
        <div className="bg-[#f1fbf7] rounded-lg h-[255px] flex items-center justify-center gap-x-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span className="h-[25px]">{postList?.length}</span>
        </div>
        <div className="bg-[#f1fbf7] rounded-lg h-[255px] flex items-center justify-center gap-x-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
          <span className="h-[25px]">{categoryList?.length}</span>
        </div>
        <div className="bg-[#f1fbf7] rounded-lg h-[255px] flex items-center justify-center gap-x-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span className="h-[25px]">{userList?.length}</span>
        </div>
        <div className="bg-[#f1fbf7] rounded-lg h-[255px] flex items-center justify-center gap-x-3">
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
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
            />
          </svg>

          <span className="h-[25px]">
            {userInfo?.bookmarkPostsId ? userInfo?.bookmarkPostsId?.length : 0}
          </span>
        </div>
        <div className="bg-[#f1fbf7] rounded-lg h-[255px] flex items-center justify-center gap-x-3">
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
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>

          <span className="h-[25px]">{postPendingList?.length}</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
