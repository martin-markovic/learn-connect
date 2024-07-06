import { Router } from "express";
import {
  mockRegisterUser,
  mockLoginUser,
} from "../../controller/mockUserController.js";

const mockUserRoutes = Router();

mockUserRoutes.post("/", mockRegisterUser);
mockUserRoutes.post("/login", mockLoginUser);

export default mockUserRoutes;
