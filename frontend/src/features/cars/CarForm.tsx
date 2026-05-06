"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { z } from "zod";
import { ArrowUp, ImagePlus, Loader2, Trash2 } from "lucide-react";

import { CAR_CATEGORIES, type CarCreatePayload } from "@/entities/car/model";
import { uploadCarImage } from "@/shared/api/cars";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z
    .number({ message: "Year must be a number" })
    .int()
    .min(1900)
    .max(2100),
  category: z.enum(["luxury", "performance", "suv", "sedan", "electric"]),
  description: z.string().max(4000).default(""),
  images: z.array(z.url()).max(12),
  price_per_day: z
    .number({ message: "Price is required" })
    .nonnegative("Price must be ≥ 0"),
  highlights: z.array(z.string().min(1)).default([]),
  is_available: z.boolean().default(true),
});

export interface CarFormValues {
  name: string;
  brand: string;
  model: string;
  year: number | "";
  category: CarCreatePayload["category"];
  description: string;
  images: string[];
  price_per_day: number | "";
  highlights: string;
  is_available: boolean;
}

export const emptyCarFormValues: CarFormValues = {
  name: "",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  category: "luxury",
  description: "",
  images: [],
  price_per_day: 0,
  highlights: "",
  is_available: true,
};

interface CarFormProps {
  initial?: CarFormValues;
  submitLabel: string;
  onSubmit: (values: CarCreatePayload) => Promise<void> | void;
  onCancel?: () => void;
  pending?: boolean;
}

export function CarForm({
  initial = emptyCarFormValues,
  submitLabel,
  onSubmit,
  onCancel,
  pending = false,
}: CarFormProps) {
  const [values, setValues] = useState<CarFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const update = <K extends keyof CarFormValues>(
    key: K,
    value: CarFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const uploaded = await Promise.all(files.map((file) => uploadCarImage(file)));
      setValues((prev) => ({
        ...prev,
        images: [...prev.images, ...uploaded].slice(0, 12),
      }));
    } catch {
      setUploadError(
        "Upload failed. Try a different file or check your connection.",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setValues((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const makeCover = (index: number) => {
    setValues((prev) => {
      if (index <= 0 || index >= prev.images.length) return prev;
      const next = [...prev.images];
      const [picked] = next.splice(index, 1);
      next.unshift(picked);
      return { ...prev, images: next };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    const highlights = values.highlights
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const candidate = {
      name: values.name.trim(),
      brand: values.brand.trim(),
      model: values.model.trim(),
      year: typeof values.year === "string" ? Number(values.year) : values.year,
      category: values.category,
      description: values.description,
      images: values.images,
      price_per_day:
        typeof values.price_per_day === "string"
          ? Number(values.price_per_day)
          : values.price_per_day,
      highlights,
      is_available: values.is_available,
    };

    const parsed = schema.safeParse(candidate);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    await onSubmit(parsed.data as CarCreatePayload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Name" error={errors.name}>
          <Input
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Corvette C8 Stingray"
            className="border-white/15 bg-black text-white"
            required
          />
        </Field>
        <Field label="Brand" error={errors.brand}>
          <Input
            value={values.brand}
            onChange={(e) => update("brand", e.target.value)}
            placeholder="Chevrolet"
            className="border-white/15 bg-black text-white"
            required
          />
        </Field>
        <Field label="Model" error={errors.model}>
          <Input
            value={values.model}
            onChange={(e) => update("model", e.target.value)}
            placeholder="C8 Stingray"
            className="border-white/15 bg-black text-white"
            required
          />
        </Field>
        <Field label="Year" error={errors.year}>
          <Input
            type="number"
            value={values.year}
            onChange={(e) =>
              update(
                "year",
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            min={1900}
            max={2100}
            className="border-white/15 bg-black text-white"
            required
          />
        </Field>
        <Field label="Category" error={errors.category}>
          <Select
            value={values.category}
            onValueChange={(v) =>
              update("category", v as CarCreatePayload["category"])
            }
          >
            <SelectTrigger className="border-white/15 bg-black text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CAR_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Price per day (USD)" error={errors.price_per_day}>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={values.price_per_day}
            onChange={(e) =>
              update(
                "price_per_day",
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            className="border-white/15 bg-black text-white"
            required
          />
        </Field>

        <Field
          label={`Photos (${values.images.length}/12)`}
          error={errors.images}
          className="md:col-span-2"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {values.images.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="group relative aspect-[4/3] overflow-hidden border border-white/10 bg-black"
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover"
                  />
                  {index === 0 ? (
                    <span className="absolute left-2 top-2 bg-white px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.2em] text-black">
                      Cover
                    </span>
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/85 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    {index > 0 ? (
                      <button
                        type="button"
                        onClick={() => makeCover(index)}
                        title="Make cover"
                        className="inline-flex h-7 w-7 items-center justify-center border border-white/30 bg-black/60 text-white hover:bg-white hover:text-black"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      title="Remove"
                      className="inline-flex h-7 w-7 items-center justify-center border border-red-400/40 bg-black/60 text-red-300 hover:bg-red-500/90 hover:text-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <label
                className={`group flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-white/20 bg-black text-white/60 transition-colors hover:border-white/60 hover:text-white ${
                  uploading ? "pointer-events-none opacity-60" : ""
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleFiles}
                  disabled={uploading || values.images.length >= 12}
                />
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ImagePlus className="h-5 w-5" />
                )}
                <span className="text-[10px] uppercase tracking-[0.2em]">
                  {uploading ? "Uploading…" : "Add photos"}
                </span>
              </label>
            </div>
            {uploadError ? (
              <p className="text-xs text-red-400">{uploadError}</p>
            ) : null}
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
              JPEG / PNG / WebP. First photo is the cover. Hover a tile to
              remove or promote.
            </p>
          </div>
        </Field>

        <Field label="Description" error={errors.description} className="md:col-span-2">
          <textarea
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            className="flex w-full rounded-md border border-white/15 bg-black px-3 py-2 text-sm text-white placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            placeholder="A short premium-tone description used on the fleet pages."
          />
        </Field>
        <Field
          label="Highlights (comma separated)"
          error={errors.highlights}
          className="md:col-span-2"
        >
          <Input
            value={values.highlights}
            onChange={(e) => update("highlights", e.target.value)}
            placeholder="Mid-engine V8, 0-60 in 2.9s, Magnetic Ride Control"
            className="border-white/15 bg-black text-white"
          />
        </Field>
        <div className="flex items-center gap-3 md:col-span-2">
          <Checkbox
            id="is_available"
            checked={values.is_available}
            onCheckedChange={(v) => update("is_available", Boolean(v))}
          />
          <Label htmlFor="is_available" className="text-sm text-white/75">
            Available for booking
          </Label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
        <Button
          type="submit"
          disabled={pending || uploading}
          className="bg-white text-black hover:bg-white/90"
        >
          {pending ? "Saving…" : submitLabel}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className ? `${className} space-y-2` : "space-y-2"}>
      <Label className="text-xs uppercase tracking-[0.2em] text-white/60">
        {label}
      </Label>
      {children}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
