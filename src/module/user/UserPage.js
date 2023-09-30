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
import RequiredAuthPage from "pages/RequiredAuthPage";
import UnauthorizePage from "pages/UnauthorizePage";
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import UserPageNoData from "./UserPageNoData";

const POTS_PER_PAGE = 8;

const UserPage = () => {
  const params = useParams();
  const [postList, setPostList] = useState([]);
  const [lastDoc, setLastDoc] = useState();
  const [total, setTotal] = useState(0);
  const handleLoadMorePost = async () => {
    const nextRef = query(
      collection(db, "posts"),
      where("user.username", "==", params.slug),
      where("status", "==", 1),
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
      const colRef = query(
        collection(db, "posts"),
        where("user.username", "==", params.slug),
        where("status", "==", 1)
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

      setLastDoc(lastVisible);
    }
    fetchData();
  }, [params.slug]);

  if (postList.length <= 0) {
    return <UserPageNoData></UserPageNoData>;
  }
  return (
    <Layout>
      <div className="container">
        <div className="pt-10"></div>
        <Heading>Các bài viết của {postList[0].user.fullname}</Heading>
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
    </Layout>
  );
};

export default UserPage;
