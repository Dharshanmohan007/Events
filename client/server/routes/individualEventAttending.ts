import { Router, type Request, type Response } from "express";

const router = Router();

const records: Array<Record<string, any>> = [];

router.get("/", (req: Request, res: Response): void => {
  try {
    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error("Error fetching individual event attending records:", error);
    res.status(500).json({ success: false, message: "Failed to fetch records" });
  }
});

router.get("/:id", (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const record = records.find((item) => item.id === id);

    if (!record) {
      res.status(404).json({
        success: false,
        message: `Individual event attending record with id ${id} not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error("Error fetching individual event attending record:", error);
    res.status(500).json({ success: false, message: "Failed to fetch record" });
  }
});

router.post("/", (req: Request, res: Response): void => {
  try {
    const payload = req.body || {};
    const nextIqacNumber =
      records.reduce((highest, item) => Math.max(highest, Number(item.iqacNumber) || 0), 0) + 1;
    const iqacNumber = String(nextIqacNumber).padStart(3, "0");
    const record = {
      id: crypto.randomUUID(),
      ...payload,
      iqacNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    records.push(record);

    res.status(201).json({
      success: true,
      message: "Individual event attending request created successfully",
      data: record,
    });
  } catch (error) {
    console.error("Error creating individual event attending record:", error);
    res.status(500).json({ success: false, message: "Failed to create record" });
  }
});

export default router;
