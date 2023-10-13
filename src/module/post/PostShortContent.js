import React from "react";
import PropTypes from "prop-types";

const PostShortContent = ({ dataShortContent = "" }) => {
  return (
    <div className="post-content mt-2">
      <div className="entry-content">{dataShortContent}</div>
    </div>
  );
};

PostShortContent.propTypes = {
  dataShortContent: PropTypes.string,
};
export default PostShortContent;
