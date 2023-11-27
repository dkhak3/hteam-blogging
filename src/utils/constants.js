import { LabelStatus } from "components/label";
import { db } from "firebase-app/firebase-config";
import { collection, getDocs, query, where } from "firebase/firestore";

export const theme = {
  primary: "#1DC071",
  secondary: "#A4D96C",
  grayDark: "#292D32",
  grayLight: "#E7ECF3",
  tertiary: "#3A1097",
  accent: "#00D1ED",
  grayF3: "#F3EDFF",
  gray6B: "#6B6B6B",
  gray23: "#232323",
  gray4b: "#4B5264",
  grayf1: "#F1F1F3",
  gray80: "#808191",
  black: "#171725",
};

export const postStatus = {
  APPROVED: 1,
  PENDING: 2,
  REJECTED: 3,
};

export const categoryStatus = {
  APPROVED: 1,
  UNAPPROVED: 2,
};

export const userStatus = {
  ACTIVE: 1,
  PENDING: 2,
  BAN: 3,
};

export const userRole = {
  ADMIN: 1,
  MOD: 2,
  USER: 3,
};

export const POST_PER_PAGE_5 = 5;
export const POST_PER_PAGE_8 = 8;

export const renderPostStatus = (status) => {
  switch (status) {
    case postStatus.APPROVED:
      return <LabelStatus type="success">Approved</LabelStatus>;
    case postStatus.PENDING:
      return <LabelStatus type="warning">Pending</LabelStatus>;
    case postStatus.REJECTED:
      return <LabelStatus type="danger">Rejected</LabelStatus>;

    default:
      break;
  }
};

export const renderLabelStatus = (status) => {
  switch (status) {
    case userStatus.ACTIVE:
      return <LabelStatus type="success">Active</LabelStatus>;
    case userStatus.PENDING:
      return <LabelStatus type="warning">Pending</LabelStatus>;
    case userStatus.BAN:
      return <LabelStatus type="danger">Rejected</LabelStatus>;
    default:
      break;
  }
};

export const renderRoleLable = (role) => {
  switch (role) {
    case userRole.ADMIN:
      return "Admin";
    case userRole.MOD:
      return "Moderator";
    case userRole.USER:
      return "User";
    default:
      break;
  }
};

export const checkUsernameExistsByUid = async (username = "", userId = "") => {
  try {
    const usersCollectionRef = collection(db, "users");
    const q = query(
      usersCollectionRef,
      where("username", "==", username),
      where("uid", "!=", userId)
    );
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty; // Returns true if username exists, false otherwise
  } catch (error) {
    console.error("Error checking username existence:", error);
    throw error;
  }
};
export const checkEmailExistsByUid = async (email = "", userId = "") => {
  try {
    const usersCollectionRef = collection(db, "users");
    const q = query(
      usersCollectionRef,
      where("email", "==", email),
      where("uid", "!=", userId)
    );
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty; // Returns true if username exists, false otherwise
  } catch (error) {
    console.error("Error checking username existence:", error);
    throw error;
  }
};
