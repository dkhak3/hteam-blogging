import Heading from "components/layout/Heading";
import Layout from "components/layout/Layout";
import { db } from "firebase-app/firebase-config";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import React, { useState, useEffect } from "react";

const CategoryPageNoData = ({ slug = "" }) => {
  const [nameCategory, setNameCategory] = useState("");
  console.log("nameCategory", nameCategory);
  useEffect(() => {
    async function fetchData() {
      const colRef = query(
        collection(db, "categories"),
        where("slug", "==", slug),
        where("status", "==", 1)
      );

      onSnapshot(colRef, (snapShot) => {
        snapShot.forEach((doc) => {
          setNameCategory(doc.data().name);
        });
      });
    }
    fetchData();
  }, [slug]);
  return (
    <Layout>
      <div className="container">
        <div className="pt-10"></div>
        <Heading>Danh mục {nameCategory}</Heading>
        <div className="text-center mt-10 text-xxl font-semibold text-primary">
          Data is empty
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPageNoData;
