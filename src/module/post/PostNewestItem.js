import React from "react";
import styled from "styled-components";
import PostCategory from "./PostCategory";
import PostImage from "./PostImage";
import PostMeta from "./PostMeta";
import PostTitle from "./PostTitle";
import PostShortContent from "./PostShortContent";
const PostNewestItemStyles = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
  padding-bottom: 28px;
  border-bottom: 1px solid #ddd;
  overflow-y: auto;
  &:last-child {
    padding-bottom: 0;
    margin-bottom: 0;
    border-bottom: 0;
  }
  .post {
    &-image {
      display: block;
      flex-shrink: 0;
      width: 180px;
      height: 130px;
      border-radius: 12px;
    }
    &-category {
      margin-bottom: 8px;
    }
    &-content {
      flex: 1;
    }

    &-title {
      margin-bottom: 8px;
    }
  }
  @media screen and (max-width: 1023.98px) {
    margin-bottom: 14px;
    padding-bottom: 14px;
    .post {
      &-image {
        width: 140px;
        height: 100px;
      }
    }
  }
`;
const PostNewestItem = ({ data }) => {
  if (!data || !data.id) return null;
  const date = data?.createdAt?.seconds
    ? new Date(data?.createdAt?.seconds * 1000)
    : new Date();
  const formatDate = new Date(date).toLocaleDateString("vi-VI");
  return (
    <PostNewestItemStyles>
      <PostImage
        url={data?.image}
        alt={data?.title}
        to={data?.slug}
      ></PostImage>

      <div className="post-content">
        {data?.category?.name && (
          <PostCategory to={data?.category?.slug} type="secondary">
            {data?.category?.name}
          </PostCategory>
        )}
        <PostTitle to={data?.slug}>{data?.title}</PostTitle>
        <PostMeta
          to={data?.user?.username}
          authorName={data?.user?.fullname}
          date={formatDate}
        ></PostMeta>
        <PostShortContent
          dataShortContent={data?.shortContent}
        ></PostShortContent>
      </div>
    </PostNewestItemStyles>
  );
};

export default PostNewestItem;
