import { Button } from "components/button";
import Heading from "components/layout/Heading";
import Layout from "components/layout/Layout";
import { db } from "firebase-app/firebase-config";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { debounce } from "lodash";
import PostItem from "module/post/PostItem";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { POST_PER_PAGE_8, postStatus } from "utils/constants";

const PostPageStyles = styled.header`
  padding: 20px 0;
  .search {
    margin-left: auto;
    padding: 15px 25px;
    border: 1px solid #ccc;
    border-radius: 8px;
    width: 100%;
    max-width: 320px;
    display: flex;
    align-items: center;
    position: relative;
    margin-right: 20px;
  }
  .search-input {
    flex: 1;
    padding-right: 45px;
    font-weight: 500;
  }
  .search-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 25px;
  }
`;

const PostPage = () => {
  const [postList, setPostList] = useState([]);

  const [filter, setFilter] = useState("");
  const [postPerPage, setPostPerPage] = useState(POST_PER_PAGE_8);

  useEffect(() => {
    async function fetchData() {
      const colRef = collection(db, "posts");
      const newRef = filter
        ? query(
            colRef,
            where("status", "==", postStatus.APPROVED),
            where("title", ">=", filter),
            where("title", "<=", filter + "utf8")
          )
        : query(
            colRef,
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
  }, [filter]);

  const handleLoadMorePost = () => {
    setPostPerPage(postPerPage + POST_PER_PAGE_8);
  };

  const handleSearchPost = debounce((e) => {
    setFilter(e.target.value);
  }, 500);

  return (
    <Layout>
      <PostPageStyles>
        <div className="container">
          <div className="pt-10"></div>
          <Heading>Posts</Heading>
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
          {postList.length <= 0 ? (
            <div className="text-center mt-10 text-xxl font-semibold text-primary">
              Data is empty
            </div>
          ) : (
            <div className="grid-layout grid-layout--primary">
              {postList
                .map((item) => <PostItem key={item.id} data={item}></PostItem>)
                .slice(0, postPerPage)}
            </div>
          )}
          {postPerPage < postList.length && (
            <div className="mt-10 mb-10">
              <Button className="mx-auto" onClick={handleLoadMorePost}>
                Load more
              </Button>
            </div>
          )}
        </div>
      </PostPageStyles>
    </Layout>
  );
};

export default PostPage;
