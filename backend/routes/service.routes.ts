import { Router } from "express";
import { createService, deleteService, getAllServices, getServiceById } from "../controllers/service.controller";

const router = Router();
router.get("/", getAllServices);
router.get("/:id", getServiceById);
router.post("/", createService);
// router.put("/:id", updateStore);
router.delete("/:id", deleteService);

export default router;
