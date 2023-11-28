import { ActionDelete, ActionEdit, ActionView } from "components/action";
import { Button } from "components/button";
import { db } from "firebase-app/firebase-config";
import { Table } from "components/table";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { debounce } from "lodash";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  POST_PER_PAGE_5,
  renderLabelStatus,
  renderRoleLable,
  userStatus,
} from "utils/constants";
import { deleteObject, getStorage, ref } from "firebase/storage";

const UserTable = () => {
  const [userList, setUserList] = useState([]);
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const [postPerPage, setPostPerPage] = useState(POST_PER_PAGE_5);

  // fetch data
  useEffect(() => {
    async function fetchData() {
      const colRef = collection(db, "users");
      const newRef = filter
        ? query(
            colRef,
            where("fullname", ">=", filter),
            where("fullname", "<=", filter + "utf8")
          )
        : query(colRef, orderBy("createdAt", "desc"));

      onSnapshot(newRef, (snapShot) => {
        let result = [];

        snapShot.forEach((doc) => {
          result.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setUserList(result);
      });
    }
    fetchData();
  }, [filter]);

  // handle delete avatar
  const handleDeleteImage = (imageName) => {
    const storage = getStorage();
    const imageRef = ref(storage, "images/" + imageName);
    deleteObject(imageRef)
      .then(() => {})
      .catch((error) => {});
  };

  // handle detele user
  const handleDeleteUser = async (user) => {
    const colRef = doc(db, "users", user.id);
    const imageRegex = /%2F(\S+)\?/gm.exec(user.avatar);
    let imageName = "";
    if (user.avatar === "default-avatar.png") {
      imageName = user.avatar;
    } else {
      imageName = imageRegex?.length > 0 ? imageRegex[1] : "";
    }

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
        await deleteDoc(colRef);
        handleDeleteImage(imageName);
        Swal.fire("Deleted!", "Your user has been deleted.", "success");
      }
    });
  };

  // handle search
  const handleInputFilter = debounce((e) => {
    setFilter(e.target.value);
  }, 500);

  // handle load more btn
  const handleLoadMoreCategory = async () => {
    setPostPerPage(postPerPage + POST_PER_PAGE_5);
  };

  return (
    <div>
      <div className="flex justify-end gap-5 mb-10">
        <div className="w-full max-w-[300px]">
          <input
            type="text"
            className="w-full p-4 border border-gray-300 border-solid rounded-lg"
            placeholder="Search for post name..."
            onChange={handleInputFilter}
          />
        </div>
      </div>
      <Table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Info</th>
            <th>Username</th>
            <th>Email address</th>
            <th>Status</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {userList.length > 0 &&
            userList.map((user) => (
              <tr key={user?.id}>
                <td title={user?.id}>{user?.id.slice(0, 5) + "..."}</td>
                <td className="!pr-[35px] max-w-xs w-96">
                  <div className="flex items-center gap-x-3 truncate !text-clip">
                    <img
                      src={
                        user?.avatar === "default-avatar.png"
                          ? "/" + user?.avatar
                          : user?.avatar
                      }
                      alt=""
                      className="flex-shrink-0 w-10 h-10 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 title={user?.fullname} className="font-semibold">
                        {user?.fullname}
                      </h3>
                      <time
                        title={new Date(
                          user?.createdAt?.seconds * 1000
                        ).toLocaleDateString("vi-VI")}
                        className="text-sm text-gray-300"
                      >
                        {new Date(
                          user?.createdAt?.seconds * 1000
                        ).toLocaleDateString("vi-VI")}
                      </time>
                    </div>
                  </div>
                </td>
                <td>{user?.username}</td>
                <td title={user?.email}>{user?.email.slice(0, 5) + "..."}</td>
                <td>{renderLabelStatus(Number(user?.status))}</td>
                <td>{renderRoleLable(Number(user?.role))}</td>
                <td>
                  <div className="flex items-center gap-x-3">
                    <ActionView
                      onClick={() => navigate(`/author/${user?.username}`)}
                    ></ActionView>
                    <ActionEdit
                      onClick={() =>
                        navigate(`/manage/update-user?id=${user?.id}`)
                      }
                    ></ActionEdit>
                    <ActionDelete
                      onClick={() => handleDeleteUser(user)}
                    ></ActionDelete>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
      {userList.length <= 0 ? (
        <div className="text-center mt-10 text-xxl font-semibold text-primary">
          Data is empty
        </div>
      ) : (
        ""
      )}
      {postPerPage < userList.length && (
        <div className="mt-10 text-center">
          <Button className="mx-auto" onClick={handleLoadMoreCategory}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserTable;
