import { ActionDelete, ActionEdit, ActionView } from "components/action";
import { Button } from "components/button";
import { db } from "firebase-app/firebase-config";
import { LabelStatus } from "components/label";
import { Table } from "components/table";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { debounce } from "lodash";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { userRole, userStatus } from "utils/constants";
import { deleteObject, getStorage, ref } from "firebase/storage";
import Loading from "components/common/Loading";

const USER_PER_PAGE = 5;

const UserTable = () => {
  const [userList, setUserList] = useState([]);
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const [lastDoc, setLastDoc] = useState();
  const [total, setTotal] = useState(0);
  const [loadingTable, setLoadingTable] = useState(false);

  const handleLoadMoreUser = async () => {
    const nextRef = query(
      collection(db, "users"),
      startAfter(lastDoc),
      limit(USER_PER_PAGE)
    );

    onSnapshot(nextRef, (snapShot) => {
      let result = [];

      snapShot.forEach((doc) => {
        result.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setUserList([...userList, ...result]);
    });

    const documentSnapshots = await getDocs(nextRef);
    const lastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    setLastDoc(lastVisible);
  };

  useEffect(() => {
    async function fetchData() {
      const colRef = collection(db, "users");
      const newRef = filter
        ? query(
            colRef,
            where("fullname", ">=", filter),
            where("fullname", "<=", filter + "utf8")
          )
        : query(colRef, limit(USER_PER_PAGE));

      const documentSnapshots = await getDocs(newRef);
      const lastVisible =
        documentSnapshots.docs[documentSnapshots.docs.length - 1];

      onSnapshot(colRef, (snapShot) => {
        setTotal(snapShot.size);
      });

      setLoadingTable(true);
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

      setLoadingTable(false);
      setLastDoc(lastVisible);
    }
    fetchData();
  }, [filter]);

  const renderLabelStatus = (status) => {
    switch (status) {
      case userStatus.ACTIVE:
        return <LabelStatus type="success">Active</LabelStatus>;
      case userStatus.PENDING:
        return <LabelStatus type="warning">Pending</LabelStatus>;
      case userStatus.BAN:
        return <LabelStatus type="danger">Rejected</LabelStatus>;
      default:
        break;
    }
  };

  const renderRoleLable = (role) => {
    switch (role) {
      case userRole.ADMIN:
        return "Admin";
      case userRole.MOD:
        return "Moderator";
      case userRole.USER:
        return "User";
      default:
        break;
    }
  };

  const handleDeleteImage = (imageName) => {
    const storage = getStorage();
    const imageRef = ref(storage, "images/" + imageName);
    deleteObject(imageRef)
      .then(() => {})
      .catch((error) => {});
  };

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

  const handleInputFilter = debounce((e) => {
    setFilter(e.target.value);
  }, 500);

  return (
    <div>
      <div className="mb-10 flex justify-end">
        <input
          type="text"
          placeholder="Search user..."
          className="px-5 py-4 border border-gray-300 rounded-lg outline-none"
          onChange={handleInputFilter}
        />
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
                <td className="whitespace-nowrap">
                  <div className="flex items-center gap-x-3">
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
                      <h3>{user?.fullname}</h3>
                      <time className="text-sm text-gray-300">
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
      {loadingTable ? (
        <Loading></Loading>
      ) : userList.length <= 0 ? (
        <div className="text-center mt-10 text-xxl font-semibold text-primary">
          Data is empty
        </div>
      ) : (
        ""
      )}
      {total > userList.length && (
        <div className="mt-10">
          <Button onClick={handleLoadMoreUser} className="mx-auto">
            Load more
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserTable;
