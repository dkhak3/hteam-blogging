import { Button } from "components/button";
import { useAuth } from "contexts/auth-context";
import useReadingProgress from "hooks/useReadingProgress";
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { userRole } from "utils/constants";
const menuLinks = [
  {
    url: "/",
    title: "Home",
  },
  {
    url: "/blogs",
    title: "Blog",
  },
  {
    url: "/contact",
    title: "Contact",
  },
];

const HeaderStyles = styled.header`
  z-index: 9999;
  padding: 4px 0;
  background-color: #fff;
  .header-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .header-auth {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .logo {
    display: block;
    max-width: 40px;
  }
  .menu {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-left: 40px;
    list-style: none;
    font-weight: 500;
  }
  .search {
    margin-left: auto;
    padding: 15px 25px;
    border: 1px solid #ccc;
    border-radius: 8px;
    width: 100%;
    max-width: 320px;
    display: flex;
    align-items: center;
    position: relative;
    margin-right: 20px;
  }
  .search-input {
    flex: 1;
    padding-right: 45px;
    font-weight: 500;
  }
  .search-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 25px;
  }
  .menu-toggle {
    display: none;
  }
  @media screen and (max-width: 1023.98px) {
    padding: 10px 0;
    .menu-toggle {
      display: block;
      cursor: pointer;
      padding: 10px;
    }
    .logo {
      max-width: 30px;
    }
    .menu,
    .search,
    .header-button,
    .header-auth {
      display: none;
    }
  }
`;
const Header = () => {
  const { userInfo } = useAuth();
  const [open, setOpen] = useState(false);
  const completion = useReadingProgress();

  const handleToggleMenu = () => {
    setOpen(!open);
  };
  return (
    <HeaderStyles className="sticky top-0">
      <div className="container">
        <div className="header-main">
          <NavLink to="/">
            <img srcSet="/logo.png 2x" alt="hteam-blogging" className="logo" />
          </NavLink>
          <ul className="menu">
            {menuLinks.map((item) => (
              <li className="menu-item" key={item.title}>
                <NavLink to={item.url} className="menu-link">
                  {item.title}
                </NavLink>
              </li>
            ))}
          </ul>
          {!userInfo ? (
            <Button
              type="button"
              height="56px"
              className="header-button"
              to="/sign-in"
            >
              Login
            </Button>
          ) : (
            <div className="header-auth">
              {userInfo.role === userRole.ADMIN ? (
                <Button
                  type="button"
                  height="56px"
                  className="header-button"
                  to="/dashboard"
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  type="button"
                  height="56px"
                  className="header-button"
                  to="/manage/my-posts"
                >
                  Dashboard
                </Button>
              )}
            </div>
          )}

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
        </div>
        {open ? (
          <div className="menu-mobile">
            <ul className="flex flex-col gap-y-3 text-right">
              {menuLinks.map((item) => (
                <li className="menu-item" key={item.title}>
                  <NavLink to={item.url} className="menu-link">
                    {item.title}
                  </NavLink>
                </li>
              ))}
            </ul>
            {!userInfo ? (
              <div className="flex items-end justify-end">
                <Button
                  type="button"
                  height="44px"
                  className="mt-3"
                  to="/sign-in"
                >
                  Login
                </Button>
              </div>
            ) : (
              <div className="flex items-end justify-end">
                {userInfo.role === userRole.ADMIN ? (
                  <Button
                    type="button"
                    height="44px"
                    className="mt-3"
                    to="/dashboard"
                  >
                    Dashboard
                  </Button>
                ) : (
                  <Button
                    type="button"
                    height="44px"
                    className="mt-3"
                    to="/manage/my-posts"
                  >
                    Dashboard
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          ""
        )}
      </div>
      <span
        style={{ transform: `translateX(${completion - 100}%)` }}
        className="absolute bg-primary h-1 w-full bottom-[-4px]"
      ></span>
    </HeaderStyles>
  );
};

export default Header;
