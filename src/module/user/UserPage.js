import { Button } from "components/button";
import Heading from "components/layout/Heading";
import Layout from "components/layout/Layout";
import { db } from "firebase-app/firebase-config";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import PostItem from "module/post/PostItem";
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import UserPageNoData from "./UserPageNoData";
import { debounce } from "lodash";
import { POST_PER_PAGE_8, postStatus } from "utils/constants";

const UserPage = () => {
  const params = useParams();
  const [postList, setPostList] = useState([]);
  const [filter, setFilter] = useState("");
  const [postPerPage, setPostPerPage] = useState(POST_PER_PAGE_8);

  useEffect(() => {
    async function fetchData() {
      const colRef = collection(db, "posts");
      const newRef = filter
        ? query(
            colRef,
            where("user.username", "==", params.slug),
            where("status", "==", postStatus.APPROVED),
            where("title", ">=", filter),
            where("title", "<=", filter + "utf8")
          )
        : query(
            colRef,
            where("user.username", "==", params.slug),
            where("status", "==", postStatus.APPROVED),
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
  }, [filter, params.slug]);

  // handle search element by title
  const handleSearchPost = debounce((e) => {
    setFilter(e.target.value);
  }, 250);

  // handle load more btm
  const handleLoadMorePost = async () => {
    setPostPerPage(postPerPage + POST_PER_PAGE_8);
  };

  if (postList.length <= 0) {
    return <UserPageNoData></UserPageNoData>;
  }
  return (
    <Layout>
      <div className="container">
        <div className="pt-10"></div>
        <Heading>{postList[0].user.fullname}'s posts</Heading>
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
        <div className="grid-layout grid-layout--primary">
          {postList
            .map((item) => <PostItem key={item.id} data={item}></PostItem>)
            .slice(0, postPerPage)}
        </div>
        {postPerPage < postList.length && (
          <div className="mt-10 text-center">
            <Button className="mx-auto" onClick={handleLoadMorePost}>
              Load more
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserPage;
