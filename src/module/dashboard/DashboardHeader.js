import { Button } from "components/button";
import { useAuth } from "contexts/auth-context";
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import styled from "styled-components";
import Sidebar from "./Sidebar";
const DashboardHeaderStyles = styled.div`
  background-color: white;
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  .logo {
    display: flex;
    align-items: center;
    gap: 20px;
    font-size: 18px;
    font-weight: 600;
    img {
      max-width: 40px;
    }
  }
  .header-avatar {
    width: 52px;
    height: 52px;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 100rem;
    }
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .menu-toggle {
    display: none;
  }
  @media screen and (max-width: 1023.98px) {
    .menu-toggle {
      display: block;
    }
    .logo img {
      max-width: 30px;
    }
    .header-avatar {
      width: 30px;
      height: 30px;
    }
    .header-right > a > button {
      height: 30px;
      font-size: 10px;
    }
  }
`;

const DashboardHeader = () => {
  const { userInfo } = useAuth();
  const [open, setOpen] = useState(false);

  const handleToggleMenu = () => {
    setOpen(!open);
  };
  return (
    <>
      <DashboardHeaderStyles>
        <NavLink to="/" className="logo">
          <img srcSet="/logo.png 2x" alt="hteam-blogging" className="logo" />
          <span className="hidden lg:inline-block">Hteam Blogging</span>
        </NavLink>
        <div className="header-right">
          <Button to="/manage/add-post" className="header-button" height="52px">
            Write new post
          </Button>
          <Link to="/profile" className="header-avatar">
            <img
              src={
                userInfo?.avatar === "default-avatar.png"
                  ? "/" + userInfo?.avatar
                  : userInfo?.avatar
              }
              alt={userInfo?.username}
            />
          </Link>
        </div>

        {/* menu mobile */}
        <div className="menu-toggle">
          {open ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-8 h-8"
              onClick={handleToggleMenu}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-8 h-8"
              onClick={handleToggleMenu}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </div>
      </DashboardHeaderStyles>
      {open ? <Sidebar className="!block !w-full"></Sidebar> : ""}
    </>
  );
};

export default DashboardHeader;
