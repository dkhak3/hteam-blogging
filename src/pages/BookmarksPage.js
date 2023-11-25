import { ActionDelete, ActionView } from "components/action";
import { Button } from "components/button";
import { Table } from "components/table";
import { useAuth } from "contexts/auth-context";
import { db } from "firebase-app/firebase-config";
import {
  arrayRemove,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import useGetUserIdByEmail from "hooks/useGetUserIdByEmail";
import DashboardHeading from "module/dashboard/DashboardHeading";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { POST_PER_PAGE_5, postStatus } from "utils/constants";

const BookmarksPage = () => {
  const { userInfo } = useAuth();
  const [postList, setPostList] = useState([]);
  const [postPerPage, setPostPerPage] = useState(POST_PER_PAGE_5);
  const navigate = useNavigate();

  // hook get user id by email
  const { userId } = useGetUserIdByEmail(userInfo?.email);

  // fetch data
  useEffect(() => {
    const q =
      userInfo?.bookmarkPostsId?.length > 0
        ? query(
            collection(db, "posts"),
            where(
              "uid",
              "in",
              userInfo?.bookmarkPostsId?.map(function (item) {
                return item["id"];
              })
            ),
            where("status", "==", postStatus.APPROVED)
          )
        : null;

    if (q) {
      try {
        async function fetchData() {
          const querySnapshot = await getDocs(q);
          let results = [];
          querySnapshot.forEach((doc) => {
            results.push({
              id: doc.id,
              ...doc.data(),
            });
          });
          setPostList(results);
        }
        fetchData();
      } catch (e) {}
    } else {
    }
  }, [userInfo?.bookmarkPostsId]);

  // handle delete post in bookmark to uid
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
          bookmarkPostsId: arrayRemove({ id: postId }),
        });
        Swal.fire("Deleted!", "Your post has been deleted.", "success");
      }
    });
  }

  // handle load more btn
  const handleLoadMorePost = () => {
    setPostPerPage(postPerPage + POST_PER_PAGE_5);
  };

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
          {userInfo?.bookmarkPostsId?.length > 0 &&
            postList.length > 0 &&
            postList
              .map((post) => {
                const date = post?.createdAt?.seconds
                  ? new Date(post?.createdAt?.seconds * 1000)
                  : new Date();
                const formatDate = new Date(date).toLocaleDateString("vi-VI");

                return (
                  <tr key={post.id}>
                    <td title={post?.id}>{post.id?.slice(0, 5) + "..."}</td>
                    <td className="!pr-[100px]">
                      <div className="flex items-center gap-x-3">
                        {post.image ? (
                          <img
                            src={post.image}
                            alt=""
                            className="w-[66px] h-[55px] rounded object-cover"
                          />
                        ) : (
                          ""
                        )}
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
                          onClick={() => handleDeletePost(post.uid)}
                        ></ActionDelete>
                      </div>
                    </td>
                  </tr>
                );
              })
              .slice(0, postPerPage)}
        </tbody>
      </Table>
      {postList.length <= 0 || userInfo?.bookmarkPostsId?.length <= 0 ? (
        <div className="text-center mt-10 text-xxl font-semibold text-primary">
          Data is empty
        </div>
      ) : (
        ""
      )}
      {postPerPage < postList.length && (
        <div className="mt-10 text-center">
          <Button className="mx-auto" onClick={handleLoadMorePost}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;
