import { ActionDelete, ActionEdit, ActionView } from "components/action";
import { Button } from "components/button";
import { Table } from "components/table";
import { useAuth } from "contexts/auth-context";
import { db } from "firebase-app/firebase-config";
import {
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { deleteObject, getStorage, ref } from "firebase/storage";
import useGetUserIdByEmail from "hooks/useGetUserIdByEmail";
import { debounce } from "lodash";
import DashboardHeading from "module/dashboard/DashboardHeading";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { POST_PER_PAGE_5, postStatus, renderPostStatus } from "utils/constants";

const PostMyManage = () => {
  const { userInfo } = useAuth();
  const [postList, setPostList] = useState([]);
  const [filter, setFilter] = useState("");
  const [postPerPage, setPostPerPage] = useState(POST_PER_PAGE_5);
  const navigate = useNavigate();

  // hook get user id by email login
  const { userId } = useGetUserIdByEmail(userInfo?.email || "");

  // handle fetch all data with status = appoved
  useEffect(() => {
    if (!userId) return;
    async function fetchData() {
      const colRef = collection(db, "posts");
      const newRef = filter
        ? query(
            colRef,
            where("user.id", "==", userId || ""),
            where("status", "==", postStatus.APPROVED),
            where("title", ">=", filter),
            where("title", "<=", filter + "utf8")
          )
        : query(
            colRef,
            where("user.id", "==", userId || ""),
            where("status", "==", postStatus.APPROVED),
            orderBy("createdAt", "desc")
          );
      onSnapshot(newRef, (snapShot) => {
        let result = [];

        snapShot.forEach((doc) => {
          result.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setPostList(result);
      });
    }
    fetchData();
  }, [filter, userId]);

  // handle delete image post
  const handleDeleteImage = (imageName) => {
    const storage = getStorage();
    const imageRef = ref(storage, "images/" + imageName);
    deleteObject(imageRef)
      .then(() => {})
      .catch((error) => {});
  };

  // handle delete post by post id
  async function handleDeletePost(post) {
    const docRef = doc(db, "posts", post.id);
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
        await deleteDoc(docRef);
        handleDeleteImage(post.image_name);
        const userRef = doc(db, "users", userId);
        updateDoc(userRef, {
          bookmarkPostsId: arrayRemove({ id: post?.uid }),
        })
          .then((e) => {})
          .catch((error) => {});
        Swal.fire("Deleted!", "Your post has been deleted.", "success");
      }
    });
  }

  // handle search element by title
  const handleSearchPost = debounce((e) => {
    setFilter(e.target.value);
  }, 250);

  // handle load more btm
  const handleLoadMorePost = async () => {
    setPostPerPage(postPerPage + POST_PER_PAGE_5);
  };

  if (!userInfo) return;

  return (
    <div>
      <DashboardHeading
        title="All posts"
        desc="Manage all posts"
      ></DashboardHeading>
      <div className="flex justify-end gap-5 mb-10">
        <div className="w-full max-w-[300px]">
          <input
            type="text"
            className="w-full p-4 border border-gray-300 border-solid rounded-lg"
            placeholder="Search for post name..."
            onChange={handleSearchPost}
          />
        </div>
      </div>
      <Table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Post</th>
            <th>Category</th>
            <th>Author</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {postList.length > 0 &&
            postList
              .map((post) => {
                const date = post?.createdAt?.seconds
                  ? new Date(post?.createdAt?.seconds * 1000)
                  : new Date();
                const formatDate = new Date(date).toLocaleDateString("vi-VI");

                return (
                  <tr key={post.id}>
                    <td title={post?.id}>{post.id?.slice(0, 5) + "..."}</td>
                    <td className="!pr-[35px] max-w-xs">
                      <div className="flex items-center gap-x-3 truncate !text-clip">
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
                          <h3 title={post.title} className="font-semibold">
                            {post.title}
                          </h3>
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
                    <td>{renderPostStatus(post.status)}</td>
                    <td>
                      <div className="flex items-center text-gray-500 gap-x-3">
                        <ActionView
                          onClick={() => navigate(`/${post.slug}`)}
                        ></ActionView>
                        <ActionEdit
                          onClick={() =>
                            navigate(`/manage/update-post?id=${post.id}`)
                          }
                        ></ActionEdit>
                        <ActionDelete
                          onClick={() => handleDeletePost(post)}
                        ></ActionDelete>
                      </div>
                    </td>
                  </tr>
                );
              })
              .slice(0, postPerPage)}
        </tbody>
      </Table>

      {postList.length <= 0 ? (
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

export default PostMyManage;
