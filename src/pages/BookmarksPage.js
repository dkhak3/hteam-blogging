import { ActionDelete, ActionView } from "components/action";
import Loading from "components/common/Loading";
import { Table } from "components/table";
import { useAuth } from "contexts/auth-context";
import { db } from "firebase-app/firebase-config";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import DashboardHeading from "module/dashboard/DashboardHeading";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { postStatus } from "utils/constants";

const BookmarksPage = () => {
  const { userInfo } = useAuth();
  const [postList, setPostList] = useState([]);
  const [postBookmarkList, setPostBookmarkList] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const colRef = query(
        collection(db, "posts"),
        where("status", "==", postStatus.APPROVED)
      );

      setLoadingTable(true);
      onSnapshot(colRef, (snapshot) => {
        let results = [];
        snapshot.forEach((doc) => {
          results.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setPostList(results);
      });
      setLoadingTable(false);
    }
    fetchData();
  }, []);

  const [userId, setUserId] = useState("");

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

  async function handleDeletePost(postId) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const docRef = doc(db, "users", userId);
        await updateDoc(docRef, {
          bookmarkPostsId: userInfo?.bookmarkPostsId.filter(
            (e) => e !== postId
          ),
        });
        window.location.reload();
        Swal.fire("Deleted!", "Your post has been deleted.", "success");
      }
    });
  }

  useEffect(() => {
    if (userInfo) {
      postList.forEach((item) => {
        userInfo?.bookmarkPostsId?.forEach((item2) => {
          if (item.id === item2) {
            setPostBookmarkList((prev) => [...prev, item]);
          }
        });
      });
    }
  }, [postList, userInfo]);

  return (
    <div>
      <DashboardHeading
        title="All posts"
        desc="Manage all posts"
      ></DashboardHeading>

      <Table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Post</th>
            <th>Category</th>
            <th>Author</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {postBookmarkList.length > 0 &&
            postBookmarkList.map((post) => {
              const date = post?.createdAt?.seconds
                ? new Date(post?.createdAt?.seconds * 1000)
                : new Date();
              const formatDate = new Date(date).toLocaleDateString("vi-VI");

              return (
                <tr key={post.id}>
                  <td title={post?.id}>{post.id?.slice(0, 5) + "..."}</td>
                  <td className="!pr-[100px]">
                    <div className="flex items-center gap-x-3">
                      <img
                        src={post.image}
                        alt=""
                        className="w-[66px] h-[55px] rounded object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{post.title}</h3>
                        <time className="text-sm text-gray-500">
                          Date: {formatDate}
                        </time>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-gray-500">
                      {post.category?.name ? post.category?.name : "null"}
                    </span>
                  </td>
                  <td>
                    <span className="text-gray-500">
                      {post.user?.username ? post.user?.username : "null"}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center text-gray-500 gap-x-3">
                      <ActionView
                        onClick={() => navigate(`/${post.slug}`)}
                      ></ActionView>
                      <ActionDelete
                        onClick={() => handleDeletePost(post.id)}
                      ></ActionDelete>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>
      {loadingTable ? (
        <Loading></Loading>
      ) : postBookmarkList.length <= 0 ? (
        <div className="text-center mt-10 text-xxl font-semibold text-primary">
          Data is empty
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default BookmarksPage;
