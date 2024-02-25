import { db } from "firebase-app/firebase-config";
import Heading from "components/layout/Heading";
import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import PostFeatureItem from "module/post/PostFeatureItem";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Button } from "components/button";
import { postStatus } from "utils/constants";
import useCheckPostByUserDoesNotExist from "hooks/useCheckPostByUserDoesNotExist";
const HomeFeatureStyles = styled.div``;

const HomeFeature = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const colRef = collection(db, "posts");
    const queries = query(
      colRef,
      where("status", "==", postStatus.APPROVED),
      where("hot", "==", true),
      orderBy("createdAt", "desc"),
      limit(3)
    );
    onSnapshot(queries, (snapshot) => {
      const results = [];
      snapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setPosts(results);
    });
  }, []);

  if (posts.length <= 0) return null;
  return (
    <HomeFeatureStyles className="home-block">
      <div className="container">
        <div className="flex justify-between">
          <Heading>Featured posts</Heading>
          <Button kind="secondary" onClick={() => navigate("/featured-posts")}>
            Show all
          </Button>
        </div>
        <div className="grid-layout">
          {posts.map((post) => (
            <PostFeatureItem key={post.id} data={post}></PostFeatureItem>
          ))}
        </div>
      </div>
    </HomeFeatureStyles>
  );
};

export default HomeFeature;
