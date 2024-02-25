import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "firebase-app/firebase-config";
import { useParams } from "react-router-dom";
import AuthorBox from "components/author/AuthorBox";
import Layout from "components/layout/Layout";
import PageNotFound from "./PageNotFound";
import parse from "html-react-parser";
import PostCategory from "module/post/PostCategory";
import PostImage from "module/post/PostImage";
import PostMeta from "module/post/PostMeta";
import PostRelated from "module/post/PostRelated";
import React, { Fragment, useEffect, useState } from "react";
import styled from "styled-components";
import { useAuth } from "contexts/auth-context";
import ActionsPostDetailsPage from "./ActionsPostDetailsPage";
import CommentPostDetailsPage from "./CommentPostDetailsPage";
import useCheckPostByUserDoesNotExist from "hooks/useCheckPostByUserDoesNotExist";
import Header from "components/layout/Header";
import Footer from "components/layout/Footer";

const PostDetailsPageStyles = styled.div`
  .post {
    &-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 40px;
      margin: 40px 0;
    }
    &-feature {
      width: 100%;
      max-width: 640px;
      height: 466px;
      border-radius: 20px;
    }
    &-heading {
      font-weight: bold;
      font-size: 36px;
      margin-bottom: 16px;
    }
    &-info {
      flex: 1;
    }
    &-content {
      max-width: 700px;
      margin: 80px auto;
    }
  }
  .author {
    margin-top: 40px;
    margin-bottom: 80px;
    display: flex;
    border-radius: 20px;
    background-color: ${(props) => props.theme.grayF3};
    &-image {
      width: 100px;
      height: 100px;
      flex-shrink: 0;
      border-radius: inherit;
    }
    &-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: inherit;
    }
    &-content {
      flex: 1;
      padding: 20px;
    }
    &-name {
      font-weight: bold;
      margin-bottom: 10px;
      font-size: 20px;
    }
    &-desc {
      font-size: 14px;
      line-height: 2;
    }
  }
  @media screen and (max-width: 1023.98px) {
    padding-bottom: 40px;
    .post {
      &-header {
        flex-direction: column;
      }
      &-feature {
        height: auto;
      }
      &-heading {
        font-size: 26px;
      }
      &-content {
        /* margin: 40px 0; */
      }
    }
    .author {
      flex-direction: row;
      &-image {
        /* width: 100%; */
        width: 100px;
        /* height: auto; */
      }
    }
  }
`;

const PostDetailsPage = () => {
  const { slug } = useParams();
  const [postInfo, setPostInfo] = useState({});

  const { userInfo } = useAuth();

  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      const colRef = query(collection(db, "posts"), where("slug", "==", slug));
      onSnapshot(colRef, (snapshot) => {
        snapshot.forEach((doc) => {
          doc.data() && setPostInfo({ id: doc.id, ...doc.data() });
        });
      });
    }

    fetchData();
  }, [slug]);

  useEffect(() => {
    document.body.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [slug]);

  if (!slug) return <PageNotFound></PageNotFound>;
  if (!postInfo.title) return null;
  return (
    <PostDetailsPageStyles>
      <Layout>
        <div className="container">
          <div className="post-header">
            {postInfo?.image ? (
              <PostImage
                url={postInfo?.image}
                className="post-feature"
              ></PostImage>
            ) : (
              ""
            )}
            <div className="post-info">
              <PostCategory className="mb-6" to={postInfo.category?.slug}>
                {postInfo?.category?.name}
              </PostCategory>
              <h1 className="post-heading">{postInfo?.title}</h1>
              <PostMeta
                authorName={postInfo.user?.fullname}
                date={
                  postInfo?.createdAt?.seconds
                    ? new Date(
                        postInfo?.createdAt?.seconds * 1000
                      ).toLocaleDateString("vi-VI")
                    : new Date().toLocaleDateString("vi-VI")
                }
                to={postInfo.user?.username}
              ></PostMeta>
              <div className="flex mt-6 gap-x-6 cursor-pointer">
                <ActionsPostDetailsPage
                  postInfo={postInfo}
                  userInfo={userInfo}
                ></ActionsPostDetailsPage>
              </div>
            </div>
          </div>
          <div className="post-content">
            <div className="entry-content">
              {parse(postInfo?.content || "")}
            </div>
            <AuthorBox
              userId={postInfo?.user?.id ? postInfo?.user?.id : ""}
            ></AuthorBox>
          </div>
          <PostRelated categoryId={postInfo?.category?.id}></PostRelated>
          <CommentPostDetailsPage
            postInfo={postInfo}
            userInfo={userInfo}
          ></CommentPostDetailsPage>
        </div>
      </Layout>
    </PostDetailsPageStyles>
  );
};

export default PostDetailsPage;
