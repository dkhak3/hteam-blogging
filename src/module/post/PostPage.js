import { Button } from "components/button";
import Loading from "components/common/Loading";
import Heading from "components/layout/Heading";
import Layout from "components/layout/Layout";
import { db } from "firebase-app/firebase-config";
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
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
  const [loadingPage, setLoadingPage] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoadingPage(true);
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
      setLoadingPage(false);
    }
    fetchData();
  }, [filter]);

  const handleLoadMorePost = () => {
    setPostPerPage(postPerPage + POST_PER_PAGE_8);
  };

  const handleInputFilter = debounce((e) => {
    setFilter(e.target.value);
  }, 500);

  return (
    <Layout>
      <PostPageStyles>
        <div className="container">
          <div className="search">
            <input
              type="text"
              className="search-input"
              placeholder="Search for post name..."
              onChange={handleInputFilter}
            />
            <span className="search-icon">
              <svg
                width="18"
                height="17"
                viewBox="0 0 18 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <ellipse
                  cx="7.66669"
                  cy="7.05161"
                  rx="6.66669"
                  ry="6.05161"
                  stroke="#999999"
                  strokeWidth="1.5"
                />
                <path
                  d="M17.0001 15.5237L15.2223 13.9099L14.3334 13.103L12.5557 11.4893"
                  stroke="#999999"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M11.6665 12.2964C12.9671 12.1544 13.3706 11.8067 13.4443 10.6826"
                  stroke="#999999"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </div>
          <div className="pt-10"></div>
          <Heading>Posts</Heading>
          {loadingPage ? (
            <Loading></Loading>
          ) : postList.length <= 0 ? (
            <div className="text-center mt-10 text-xxl font-semibold text-primary">
              Data is empty
            </div>
          ) : (
            ""
          )}
          <div className="grid-layout grid-layout--primary">
            {postList
              .map((item) => <PostItem key={item.id} data={item}></PostItem>)
              .slice(0, postPerPage)}
          </div>

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
