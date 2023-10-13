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
import { useParams } from "react-router-dom";
import styled from "styled-components";
import PageNotFound from "pages/PageNotFound";
import { categoryStatus, postStatus } from "utils/constants";

const CategoryPageStyles = styled.header`
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
const POTS_PER_PAGE = 8;

const CategoryPage = () => {
  const { slug } = useParams();
  const [postList, setPostList] = useState([]);
  const [lastDoc, setLastDoc] = useState();
  const [total, setTotal] = useState(0);
  const [loadingPage, setLoadingPage] = useState(false);
  const [nameCategory, setNameCategory] = useState("");
  console.log("nameCategory", nameCategory);

  const handleLoadMorePost = async () => {
    const nextRef = query(
      collection(db, "posts"),
      where("category.slug", "==", slug),
      where("category.status", "==", categoryStatus.APPROVED),
      where("status", "==", postStatus.APPROVED),
      startAfter(lastDoc),
      limit(POTS_PER_PAGE)
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
      setLoadingPage(true);
      const colRef = query(
        collection(db, "posts"),
        where("category.slug", "==", slug),
        where("category.status", "==", categoryStatus.APPROVED),
        where("status", "==", postStatus.APPROVED)
      );

      const newRef = query(colRef, limit(POTS_PER_PAGE));

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
      setLoadingPage(false);

      setLastDoc(lastVisible);
    }
    fetchData();
  }, [slug]);

  useEffect(() => {
    async function fetchData() {
      const colRef = query(
        collection(db, "categories"),
        where("slug", "==", slug),
        where("status", "==", categoryStatus.APPROVED)
      );

      onSnapshot(colRef, (snapShot) => {
        snapShot.forEach((doc) => {
          setNameCategory(doc.data().name);
        });
      });
    }
    fetchData();
  }, [slug]);

  if (!slug) return <PageNotFound></PageNotFound>;
  return (
    <Layout>
      <CategoryPageStyles>
        <div className="container">
          <div className="pt-10"></div>
          <Heading>Danh mục {postList ? nameCategory : ""}</Heading>
          {loadingPage ? (
            <Loading></Loading>
          ) : postList.length <= 0 ? (
            <div className="text-center mt-10 text-xxl font-semibold text-primary">
              Data is empty
            </div>
          ) : (
            <div className="grid-layout grid-layout--primary">
              {postList.map((item) => (
                <PostItem key={item.id} data={item}></PostItem>
              ))}
            </div>
          )}
          {total > postList.length && (
            <div className="mt-10 mb-10">
              <Button onClick={handleLoadMorePost} className="mx-auto">
                Load more
              </Button>
            </div>
          )}
        </div>
      </CategoryPageStyles>
    </Layout>
  );
};

export default CategoryPage;
