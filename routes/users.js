import { Router } from "express";
import {
  showIndex,
  showUser,
  createUser,
  renderForm,
  renderEditPage,
  updateUser,
  deleteUser,
} from "./user_controllers.js";


const router = Router();


router.get("/", showIndex);
router.get("/new", renderForm);
router.post("/", createUser);
router.get("/:id", showUser);
router.get("/:id/edit", renderEditPage);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
