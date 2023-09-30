import Layout from "components/layout/Layout";
import HomeBanner from "module/home/HomeBanner";
import HomeFeature from "module/home/HomeFeature";
import HomeNewest from "module/home/HomeNewest";
import { React, useEffect } from "react";
import styled from "styled-components";

const HomePageStyles = styled.div``;

const HomePage = () => {
  useEffect(() => {
    document.title = "HTeam Blogging App";
  }, []);
  return (
    <HomePageStyles>
      <Layout>
        <HomeBanner></HomeBanner>
        <HomeFeature></HomeFeature>
        <HomeNewest></HomeNewest>
      </Layout>
    </HomePageStyles>
  );
};

export default HomePage;
