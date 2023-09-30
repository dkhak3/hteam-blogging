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
  query,
  startAfter,
  where,
} from "firebase/firestore";
import PostItem from "module/post/PostItem";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

const FeaturedPostsPageStyles = styled.header`
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

const POST_PER_PAGE = 8;

const FeaturedPostsPage = () => {
  const [postList, setPostList] = useState([]);
  const [lastDoc, setLastDoc] = useState();
  const [total, setTotal] = useState(0);

  const handleLoadMorePost = async () => {
    const nextRef = query(
      collection(db, "posts"),
      where("hot", "==", true),
      where("status", "==", 1),
      startAfter(lastDoc),
      limit(POST_PER_PAGE)
    );

    onSnapshot(nextRef, (snapShot) => {
      let result = [];

      snapShot.forEach((doc) => {
        result.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setPostList([...postList, ...result]);
    });

    const documentSnapshots = await getDocs(nextRef);
    const lastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    setLastDoc(lastVisible);
  };

  useEffect(() => {
    async function fetchData() {
      const colRef = query(
        collection(db, "posts"),
        where("hot", "==", true),
        where("status", "==", 1)
      );
      const newRef = query(colRef, limit(POST_PER_PAGE));

      const documentSnapshots = await getDocs(newRef);
      const lastVisible =
        documentSnapshots.docs[documentSnapshots.docs.length - 1];

      onSnapshot(colRef, (snapShot) => {
        setTotal(snapShot.size);
      });

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

      setLastDoc(lastVisible);
    }
    fetchData();
  }, []);

  return (
    <Layout>
      <FeaturedPostsPageStyles>
        <div className="container">
          <div className="pt-10"></div>
          <Heading>Tất cả featured post</Heading>
          {postList.length <= 0 && <Loading></Loading>}
          <div className="grid-layout grid-layout--primary">
            {postList.map((item) => (
              <PostItem key={item.id} data={item}></PostItem>
            ))}
          </div>

          {total > postList.length && (
            <div className="mt-10 mb-10">
              <Button onClick={handleLoadMorePost} className="mx-auto">
                Load more
              </Button>
            </div>
          )}
        </div>
      </FeaturedPostsPageStyles>
    </Layout>
  );
};

export default FeaturedPostsPage;
