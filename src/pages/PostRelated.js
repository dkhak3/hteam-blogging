import Heading from "components/layout/Heading";
import React, { useEffect, useState } from "react";
import PostItem from "./PostItem";
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { db } from "firebase-app/firebase-config";
import { Button } from "components/button";

const POTS_PER_PAGE = 4;

const PostRelated = ({ categoryId = "" }) => {
  const [postList, setPostList] = useState([]);
  const [lastDoc, setLastDoc] = useState();
  const [total, setTotal] = useState(0);

  const handleLoadMorePost = async () => {
    const nextRef = query(
      collection(db, "posts"),
      where("category.id", "==", categoryId),
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
        where("category.id", "==", categoryId),
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
  }, [categoryId]);

  if (postList.length <= 0) return null;

  return (
    <div className="post-related mb-[80px]">
      <Heading>Bài viết liên quan của {postList[0].category.name}</Heading>
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
  );
};

export default PostRelated;
