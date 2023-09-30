import {
  ActionDelete,
  ActionEdit,
  ActionTick,
  ActionView,
} from "components/action";
import Loading from "components/common/Loading";
import { LabelStatus } from "components/label";
import { Table } from "components/table";
import { useAuth } from "contexts/auth-context";
import { db } from "firebase-app/firebase-config";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { deleteObject, getStorage, ref } from "firebase/storage";
import DashboardHeading from "module/dashboard/DashboardHeading";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { postStatus } from "utils/constants";

const PostPendingManage = () => {
  const { userInfo } = useAuth();
  const [postList, setPostList] = useState([]);
  const [userId, setUserId] = useState("");
  const [loadingTable, setLoadngTable] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const colRef = query(
        collection(db, "posts"),
        where("status", "==", postStatus.PENDING)
      );

      setLoadngTable(true);
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
      setLoadngTable(false);
    }
    fetchData();
  }, []);

  const handleDeleteImage = (imageName) => {
    const storage = getStorage();
    const imageRef = ref(storage, "images/" + imageName);
    deleteObject(imageRef)
      .then(() => {})
      .catch((error) => {});
  };

  //   get userId
  useEffect(() => {
    if (userInfo) {
      async function fetchData() {
        const colRef = query(
          collection(db, "users"),
          where("email", "==", userInfo?.email)
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
        const docRefUser = doc(db, "users", userId);
        await updateDoc(docRefUser, {
          bookmarkPostsId: userInfo?.bookmarkPostsId.filter(
            (e) => e !== post.id
          ),
        });
        Swal.fire("Deleted!", "Your post has been deleted.", "success");
      }
    });
  }
  const renderPostStatus = (status) => {
    switch (status) {
      case postStatus.APPROVED:
        return <LabelStatus type="success">Approved</LabelStatus>;
      case postStatus.PENDING:
        return <LabelStatus type="warning">Pending</LabelStatus>;
      case postStatus.REJECTED:
        return <LabelStatus type="danger">Rejected</LabelStatus>;

      default:
        break;
    }
  };

  const handleTickPost = async (postId) => {
    const docRef = doc(db, "posts", postId);
    await updateDoc(docRef, {
      status: postStatus.APPROVED,
    });
    toast.success("Post public successfully!");
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
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {postList.length > 0 &&
            postList.map((post) => {
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
                      <ActionTick
                        onClick={() => handleTickPost(post.id)}
                      ></ActionTick>

                      <ActionDelete
                        onClick={() => handleDeletePost(post)}
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
      ) : postList.length <= 0 ? (
        <div className="text-center mt-10 text-xxl font-semibold text-primary">
          Data is empty
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default PostPendingManage;
