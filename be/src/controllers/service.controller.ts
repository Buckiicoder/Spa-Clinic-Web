import { Request, Response } from "express";
import * as serviceServices from "../services/service.service.js"

export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await serviceServices.getAllServices();
    return res.json(services);
  } catch (err: any) {
    return res.status(500).json({message: "Lấy dịch vụ thất bại"})
  }
};