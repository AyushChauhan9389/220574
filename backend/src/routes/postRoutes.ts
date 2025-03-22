import { Router } from "express";
import { getPosts } from "../controllers/postsController";

const router = Router();

router.get("/", getPosts);

export default router;
