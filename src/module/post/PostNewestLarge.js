import React from "react";
import styled from "styled-components";
import PostCategory from "./PostCategory";
import PostImage from "./PostImage";
import PostMeta from "./PostMeta";
import PostTitle from "./PostTitle";
import PostShortContent from "./PostShortContent";
const PostNewestLargeStyles = styled.div`
  .post {
    &-image {
      display: block;
      margin-bottom: 20px;
      height: 433px;
      border-radius: 16px;
    }
    &-category {
      margin-bottom: 10px;
    }
    &-title {
      margin-bottom: 20px;
    }
    @media screen and (max-width: 1023.98px) {
      &-image {
        height: 250px;
      }
    }
  }
`;

const PostNewestLarge = ({ data }) => {
  if (!data || !data.id) return null;

  const date = data?.createdAt?.seconds
    ? new Date(data?.createdAt?.seconds * 1000)
    : new Date();
  const formatDate = new Date(date).toLocaleDateString("vi-VI");
  return (
    <PostNewestLargeStyles>
      {data?.image ? (
        <PostImage
          url={data?.image}
          alt={data?.title}
          to={data?.slug}
        ></PostImage>
      ) : (
        ""
      )}
      {data?.category?.name && (
        <PostCategory to={data?.category?.slug}>
          {data?.category?.name}
        </PostCategory>
      )}
      <PostTitle size="big" to={data?.slug}>
        {data?.title}
      </PostTitle>
      <PostMeta
        authorName={data?.user?.fullname}
        date={formatDate}
        to={data?.user?.username}
      ></PostMeta>
      <div className="mt-[20px]">
        <PostShortContent
          dataShortContent={data?.shortContent}
        ></PostShortContent>
      </div>
    </PostNewestLargeStyles>
  );
};

export default PostNewestLarge;
