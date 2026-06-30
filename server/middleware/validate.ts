import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";

interface ValidationRule {
  field: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  required?: boolean;
  min?: number;
  max?: number;
}

export function validate(schema: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const rule of schema) {
      const value = req.body[rule.field];

      if (rule.required && (value === undefined || value === null || value === "")) {
        errors.push(`Campo "${rule.field}" é obrigatório`);
        continue;
      }

      if (value === undefined || value === null) continue;

      if (rule.type === "string" && typeof value !== "string") {
        errors.push(`Campo "${rule.field}" deve ser texto`);
      } else if (rule.type === "number" && typeof value !== "number") {
        errors.push(`Campo "${rule.field}" deve ser número`);
      } else if (rule.type === "boolean" && typeof value !== "boolean") {
        errors.push(`Campo "${rule.field}" deve ser verdadeiro/falso`);
      }

      if (rule.min !== undefined && typeof value === "string" && value.length < rule.min) {
        errors.push(`Campo "${rule.field}" deve ter no mínimo ${rule.min} caracteres`);
      }
      if (rule.max !== undefined && typeof value === "string" && value.length > rule.max) {
        errors.push(`Campo "${rule.field}" deve ter no máximo ${rule.max} caracteres`);
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ error: errors.join("; "), code: "VALIDATION_ERROR" });
      return;
    }

    next();
  };
}
