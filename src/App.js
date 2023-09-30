import { AuthProvider } from "./contexts/auth-context";
import { Route, Routes } from "react-router-dom";
import React, { Suspense } from "react";
import UnauthorizePage from "pages/UnauthorizePage";
import RequiredAuthPage from "pages/RequiredAuthPage";
import { permissions } from "constants/permissions";
const CategoryAddNew = React.lazy(() =>
  import("module/category/CategoryAddNew")
);
const CategoryManage = React.lazy(() =>
  import("module/category/CategoryManage")
);
const CategoryPage = React.lazy(() => import("module/category/CategoryPage"));
const CategoryUpdate = React.lazy(() =>
  import("module/category/CategoryUpdate")
);
const DashboardLayout = React.lazy(() =>
  import("module/dashboard/DashboardLayout")
);
const DashboardPage = React.lazy(() => import("pages/DashboardPage"));
const HomePage = React.lazy(() => import("pages/HomePage"));
const PageNotFound = React.lazy(() => import("pages/PageNotFound"));
const PostAddNew = React.lazy(() => import("module/post/PostAddNew"));
const PostDetailsPage = React.lazy(() => import("pages/PostDetailsPage"));
const LatestPostsPage = React.lazy(() => import("pages/LatestPostsPage"));
const FeaturedPostsPage = React.lazy(() => import("pages/FeaturedPostsPage"));
const PostManage = React.lazy(() => import("module/post/PostManage"));
const PostMyManage = React.lazy(() => import("module/post/PostMyManage"));
const PostUpdate = React.lazy(() => import("module/post/PostUpdate"));
const SignInPage = React.lazy(() => import("pages/SignInPage"));
const SignUpPage = React.lazy(() => import("pages/SignUpPage"));
const UserAddNew = React.lazy(() => import("module/user/UserAddNew"));
const UserManage = React.lazy(() => import("module/user/UserManage"));
const UserPage = React.lazy(() => import("module/user/UserPage"));
const PostPage = React.lazy(() => import("module/post/PostPage"));
const UserProfile = React.lazy(() => import("module/user/UserProfile"));
const UserUpdate = React.lazy(() => import("module/user/UserUpdate"));
const ContactPage = React.lazy(() => import("pages/ContactPage"));
const BookmarksPage = React.lazy(() => import("pages/BookmarksPage"));
const PostPendingManage = React.lazy(() =>
  import("module/post/PostPendingManage")
);

function App() {
  return (
    <div>
      <AuthProvider>
        <Suspense>
          <Routes>
            <Route path="/" element={<HomePage></HomePage>}></Route>
            <Route path="/unauthorize" element={<UnauthorizePage />}></Route>
            <Route path="/sign-up" element={<SignUpPage></SignUpPage>}></Route>
            <Route path="/sign-in" element={<SignInPage></SignInPage>}></Route>
            <Route path="*" element={<PageNotFound></PageNotFound>}></Route>
            <Route path="/author/:slug" element={<UserPage></UserPage>}></Route>
            <Route
              path="/category/:slug"
              element={<CategoryPage></CategoryPage>}
            ></Route>
            <Route path="/blogs" element={<PostPage></PostPage>}></Route>
            <Route
              path="/contact"
              element={<ContactPage></ContactPage>}
            ></Route>
            <Route
              path="/featured-posts"
              element={<FeaturedPostsPage></FeaturedPostsPage>}
            ></Route>
            <Route
              path="/latest-posts"
              element={<LatestPostsPage></LatestPostsPage>}
            ></Route>
            <Route
              path="/:slug"
              element={<PostDetailsPage></PostDetailsPage>}
            ></Route>
            <Route element={<DashboardLayout></DashboardLayout>}>
              <Route
                element={
                  <RequiredAuthPage
                    allowPermissions={permissions.userAdmin}
                  ></RequiredAuthPage>
                }
              >
                <Route
                  path="/dashboard"
                  element={<DashboardPage></DashboardPage>}
                ></Route>
                <Route
                  path="/manage/posts"
                  element={<PostManage></PostManage>}
                ></Route>
                <Route
                  path="/manage/pending-posts"
                  element={<PostPendingManage></PostPendingManage>}
                ></Route>
                <Route
                  path="/manage/category"
                  element={<CategoryManage></CategoryManage>}
                ></Route>
                <Route
                  path="/manage/add-category"
                  element={<CategoryAddNew></CategoryAddNew>}
                ></Route>
                <Route
                  path="/manage/update-category"
                  element={<CategoryUpdate></CategoryUpdate>}
                ></Route>
                <Route
                  path="/manage/add-user"
                  element={<UserAddNew></UserAddNew>}
                ></Route>
                <Route
                  path="/manage/user"
                  element={<UserManage></UserManage>}
                ></Route>
                <Route
                  path="/manage/update-user"
                  element={<UserUpdate></UserUpdate>}
                ></Route>
              </Route>

              <Route
                path="/manage/add-post"
                element={<PostAddNew></PostAddNew>}
              ></Route>
              <Route
                path="/profile"
                element={<UserProfile></UserProfile>}
              ></Route>
              <Route
                path="/manage/my-posts"
                element={<PostMyManage></PostMyManage>}
              ></Route>
              <Route
                path="/manage/update-post"
                element={<PostUpdate></PostUpdate>}
              ></Route>
              <Route
                path="/manage/bookmarks"
                element={<BookmarksPage></BookmarksPage>}
              ></Route>
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </div>
  );
}

export default App;
