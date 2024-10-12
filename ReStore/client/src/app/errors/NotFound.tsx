import { Container, Divider, Paper, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <Container component={Paper} style={{ height: 400 }}>
      <Typography gutterBottom variant={"h3"}>
        OOPs - We could not find what your are looking for
      </Typography>
      <Divider></Divider>
      <Button fullWidth component={Link} to="/catalog">
        Go back to shop
      </Button>
    </Container>
  );
}
