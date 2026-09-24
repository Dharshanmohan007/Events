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

    const requiredFields = [
      { key: "programType", label: "Program type" },
      { key: "programName", label: "Program name" },
      { key: "numberOfParticipants", label: "Number of participants" },
      { key: "programFromDate", label: "Program from date" },
      { key: "programToDate", label: "Program to date" },
      { key: "onDutyFrom", label: "On-duty from date" },
      { key: "onDutyTo", label: "On-duty to date" },
    ];

    const missingFields = requiredFields.filter(({ key, label }) => {
      const value = payload[key];
      if (key === "numberOfParticipants") {
        return Number(value) <= 0;
      }
      return value === undefined || value === null || String(value).trim() === "";
    }).map(({ label }) => label);

    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
      return;
    }

    const nextIqacNumber =
      records.reduce((highest, item) => Math.max(highest, Number(item.iqacNumber) || 0), 0) + 1;
    const iqacNumber = String(nextIqacNumber).padStart(3, "0");
    const generatedId = globalThis.crypto?.randomUUID?.() ?? `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const record = {
      id: generatedId,
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
