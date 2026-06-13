"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { CarForm, type CarFormValues } from "@/features/cars/CarForm";
import { getCar, updateCar } from "@/shared/api/cars";

export default function EditCarClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const carQuery = useQuery({
    queryKey: ["admin", "cars", id],
    queryFn: () => getCar(id),
  });

  const mutation = useMutation({
    mutationFn: (values: Parameters<typeof updateCar>[1]) => updateCar(id, values),
    onSuccess: () => {
      toast.success("Car updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "cars"] });
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      router.replace("/admin/cars");
    },
    onError: (err: unknown) => {
      const detail =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data
              ?.detail
          : null;
      toast.error(detail || "Failed to update car");
    },
  });

  if (carQuery.isLoading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/2 p-8 text-sm text-white/55">
        Loading…
      </div>
    );
  }

  if (carQuery.isError || !carQuery.data) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/2 p-8 text-sm text-red-300">
        Failed to load this car.
      </div>
    );
  }

  const car = carQuery.data;
  const initial: CarFormValues = {
    name: car.name,
    brand: car.brand,
    model: car.model,
    year: car.year,
    category: car.category,
    description: car.description ?? "",
    images: car.images ?? [],
    price_per_day:
      typeof car.price_per_day === "string"
        ? Number(car.price_per_day)
        : car.price_per_day,
    highlights: (car.highlights ?? []).join(", "),
    is_available: car.is_available,
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="eyebrow">Cars · Edit</div>
        <h2 className="display-heading text-2xl font-semibold text-white">
          {car.name}
        </h2>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/2 p-6 md:p-8">
        <CarForm
          initial={initial}
          submitLabel="Save changes"
          pending={mutation.isPending}
          onCancel={() => router.replace("/admin/cars")}
          onSubmit={async (values) => {
            await mutation.mutateAsync(values);
          }}
        />
      </div>
    </div>
  );
}
