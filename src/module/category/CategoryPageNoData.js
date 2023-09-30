import Heading from "components/layout/Heading";
import Layout from "components/layout/Layout";
import React from "react";
import { useParams } from "react-router-dom";

const CategoryPageNoData = () => {
  const params = useParams();
  return (
    <Layout>
      <div className="container">
        <div className="pt-10"></div>
        <Heading>Danh mục {params.slug}</Heading>
        <div className="text-center mt-10 text-xxl font-semibold text-primary">
          Data is empty
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPageNoData;
