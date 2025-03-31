import { Request, Response } from "express";
import { Item } from "../models/item.model";

export const getAllItems = async (req: Request, res: Response) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: `Error fetching items ${error}` });
  }
}
