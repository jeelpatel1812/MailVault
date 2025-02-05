import React from "react";
import { Pagination, Stack } from "@mui/material";

const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
  const handleChange = (event, value) => {
    onPageChange(value);
  };

  return (
    <Stack spacing={2} alignItems="center">
      <Pagination 
        count={totalPages} 
        page={currentPage} 
        onChange={handleChange} 
        color="primary" 
        size="medium" 
        shape="rounded" 
      />
    </Stack>
  );
};

export default PaginationComponent;
