import Loading from "components/common/Loading";
import { permissions } from "constants/permissions";
import { useAuth } from "contexts/auth-context";
import React from "react";
import { Outlet } from "react-router-dom";

const RequiredAuthPage = ({ allowPermissions = [] }) => {
  const { userInfo } = useAuth();

  if (!userInfo) return <Loading></Loading>;
  if (String(userInfo.permissions) === String(permissions.userAdmin)) {
    const userPermissions = userInfo?.permissions || [];
    return userPermissions.find((p) => allowPermissions?.includes(p)) ||
      allowPermissions.length <= 0 ? (
      <Outlet></Outlet>
    ) : (
      ""
    );
  }
};

export default RequiredAuthPage;
