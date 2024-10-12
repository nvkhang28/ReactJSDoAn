import { Box, Backdrop, CircularProgress, Typography } from "@mui/material";

interface Props {
  message?: string; // Thuộc tính này để thống báo chuỗi
}

export default function LoadingComponent({ message = "Loading ..." }: Props) {
  return (
    <Backdrop open={true} invisible={true}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress size={100} color="secondary"></CircularProgress>
        <Typography
          variant="h4"
          sx={{ justifyContent: "center", position: "fixed", top: "60%" }}
        >
          {message}
        </Typography>
      </Box>
    </Backdrop>
  );
}
