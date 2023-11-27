import { ActionDelete, ActionEdit, ActionView } from "components/action";
import { Button } from "components/button";
import { LabelStatus } from "components/label";
import { Table } from "components/table";
import { db } from "firebase-app/firebase-config";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import DashboardHeading from "module/dashboard/DashboardHeading";
import React, { useEffect, useState } from "react";
import { POST_PER_PAGE_5, categoryStatus, userRole } from "utils/constants";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import { useAuth } from "contexts/auth-context";
import Loading from "components/common/Loading";

const CategoryManage = () => {
  const [categoryList, setCategoryList] = useState([]);
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const [postPerPage, setPostPerPage] = useState(POST_PER_PAGE_5);
  const [loadingTable, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const colRef = collection(db, "categories");
      const newRef = filter
        ? query(
            colRef,
            where("status", "==", categoryStatus.APPROVED),
            where("name", ">=", filter),
            where("name", "<=", filter + "utf8")
          )
        : query(
            colRef,
            where("status", "==", categoryStatus.APPROVED),
            orderBy("createdAt", "desc")
          );

      setLoading(true);
      onSnapshot(newRef, (snapshot) => {
        let results = [];
        snapshot.forEach((doc) => {
          results.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setCategoryList(results);
      });
      setLoading(false);
    }
    fetchData();
  }, [filter]);

  const handleDeleteCategory = async (docId) => {
    const colRef = doc(db, "categories", docId);

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
        Swal.fire("Deleted!", "Your post has been deleted.", "success");
      }
    });
  };

  const handleInputFilter = debounce((e) => {
    setFilter(e.target.value);
  }, 500);

  const handleLoadMoreCategory = async () => {
    setPostPerPage(postPerPage + POST_PER_PAGE_5);
  };

  const { userInfo } = useAuth();
  if (Number(userInfo.role) !== userRole.ADMIN) return null;

  return (
    <div>
      <DashboardHeading title="Categories" desc="Manage your category">
        <Button kind="ghost" height="60px" to="/manage/add-category">
          Create category
        </Button>
      </DashboardHeading>
      <div className="flex justify-end gap-5 mb-10">
        <div className="w-full max-w-[300px]">
          <input
            type="text"
            placeholder="Search for category name..."
            className="w-full p-4 border border-gray-300 border-solid rounded-lg"
            onChange={handleInputFilter}
          />
        </div>
      </div>
      <Table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Slug</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categoryList.length > 0 &&
            categoryList
              .map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td
                    title={category.name}
                    className="max-w-xs truncate !text-clip"
                  >
                    <h3 title={category.name} className="font-semibold">
                      {category.name}
                    </h3>
                  </td>
                  <td className="max-w-xs truncate !text-clip">
                    <span className="italic text-gray-400">
                      {category.slug}
                    </span>
                  </td>
                  <td>
                    {Number(category.status) === categoryStatus.APPROVED && (
                      <LabelStatus type="success">Approved</LabelStatus>
                    )}
                    {Number(category.status) === categoryStatus.UNAPPROVED && (
                      <LabelStatus type="warning">Unapproved</LabelStatus>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-x-3">
                      <ActionView
                        onClick={() => navigate(`/category/${category.slug}`)}
                      ></ActionView>
                      <ActionEdit
                        onClick={() =>
                          navigate(`/manage/update-category?id=${category.id}`)
                        }
                      ></ActionEdit>
                      <ActionDelete
                        onClick={() => handleDeleteCategory(category.id)}
                      ></ActionDelete>
                    </div>
                  </td>
                </tr>
              ))
              .slice(0, postPerPage)}
        </tbody>
      </Table>
      {loadingTable ? (
        <Loading></Loading>
      ) : categoryList.length <= 0 ? (
        <div className="text-center mt-10 text-xxl font-semibold text-primary">
          Data is empty
        </div>
      ) : (
        ""
      )}

      {postPerPage < categoryList.length && (
        <div className="mt-10 text-center">
          <Button className="mx-auto" onClick={handleLoadMoreCategory}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
};

export default CategoryManage;
