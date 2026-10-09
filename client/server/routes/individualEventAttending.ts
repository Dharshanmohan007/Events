import { Router, type Request, type Response } from "express";

const router = Router();

const records: Array<Record<string, any>> = [];

const readMultipartBody = (req: Request) =>
  new Promise<{
    fields: Record<string, string>;
    file?: { name: string; type: string; size: number; data: string };
  }>((resolve, reject) => {
    const contentType = req.headers["content-type"] || "";
    const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!boundary) {
      reject(new Error("Multipart request is missing its boundary."));
      return;
    }

    const boundaryMarker = Buffer.from(`--${boundary[1] || boundary[2]}`);
    const chunks: Buffer[] = [];
    let totalSize = 0;
    let exceedsLimit = false;

    req.on("data", (chunk: Buffer) => {
      totalSize += chunk.length;
      if (totalSize > 2 * 1024 * 1024) {
        exceedsLimit = true;
        return;
      }
      chunks.push(chunk);
    });

    req.on("error", reject);
    req.on("end", () => {
      try {
        if (exceedsLimit) {
          reject(new Error("Multipart request exceeds the 2MB limit."));
          return;
        }

        const body = Buffer.concat(chunks);
        const fields: Record<string, string> = {};
        let file:
          | { name: string; type: string; size: number; data: string }
          | undefined;
        let markerIndex = body.indexOf(boundaryMarker);

        while (markerIndex !== -1) {
          let partStart = markerIndex + boundaryMarker.length;
          if (body.subarray(partStart, partStart + 2).toString() === "--") break;
          if (body.subarray(partStart, partStart + 2).toString() === "\r\n") {
            partStart += 2;
          }

          const headerEnd = body.indexOf("\r\n\r\n", partStart, "utf8");
          if (headerEnd === -1) break;
          const nextMarker = body.indexOf(boundaryMarker, headerEnd + 4);
          if (nextMarker === -1) break;

          const partEnd =
            body.subarray(nextMarker - 2, nextMarker).toString() === "\r\n"
              ? nextMarker - 2
              : nextMarker;
          const headers = body.subarray(partStart, headerEnd).toString("utf8");
          const disposition = headers.match(/content-disposition:\s*form-data;([^\r\n]+)/i)?.[1] || "";
          const fieldName = disposition.match(/name="([^"]+)"/i)?.[1];
          const fileName = disposition.match(/filename="([^"]*)"/i)?.[1];
          const partData = body.subarray(headerEnd + 4, partEnd);

          if (fieldName && fileName !== undefined) {
            if (partData.length > 1024 * 1024) {
              reject(new Error("Principal approval file exceeds the 1MB limit."));
              return;
            }
            const mimeType =
              headers.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim() ||
              "application/octet-stream";
            file = {
              name: fileName,
              type: mimeType,
              size: partData.length,
              data: `data:${mimeType};base64,${partData.toString("base64")}`,
            };
          } else if (fieldName) {
            fields[fieldName] = partData.toString("utf8");
          }

          markerIndex = nextMarker;
        }

        resolve({ fields, file });
      } catch (error) {
        reject(error);
      }
    });
  });

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

router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const contentType = req.headers["content-type"] || "";
    const multipart = contentType.startsWith("multipart/form-data")
      ? await readMultipartBody(req)
      : { fields: req.body || {} };
    const payload = {
      ...multipart.fields,
      ...(multipart.file ? { principalApprovalForm: multipart.file } : {}),
    };
    payload.onDutyFrom = payload.onDutyFrom || payload.offCampusFrom;
    payload.onDutyTo = payload.onDutyTo || payload.offCampusTo;

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
        return (
          value === undefined ||
          value === null ||
          String(value).trim() === "" ||
          !Number.isFinite(Number(value)) ||
          Number(value) < 0
        );
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

    const { specialRequirements: legacySpecialRequirements, ...payloadWithoutLegacySpecialRequirements } = payload;
    const nextIqacNumber =
      records.reduce((highest, item) => Math.max(highest, Number(item.iqacNumber) || 0), 0) + 1;
    const iqacNumber = String(nextIqacNumber).padStart(3, "0");
    const generatedId = globalThis.crypto?.randomUUID?.() ?? `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const record = {
      id: generatedId,
      ...payloadWithoutLegacySpecialRequirements,
      specialRequirement: payload.specialRequirement ?? legacySpecialRequirements ?? "",
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
    const message =
      error instanceof Error ? error.message : "Failed to create record";
    const isRequestSizeError = message.includes("exceeds the");
    res.status(isRequestSizeError ? 413 : 400).json({
      success: false,
      message,
    });
  }
});

export default router;
