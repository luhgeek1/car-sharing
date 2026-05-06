"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { CarForm, emptyCarFormValues } from "@/features/cars/CarForm";
import { createCar } from "@/shared/api/cars";

export default function NewCarPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createCar,
    onSuccess: () => {
      toast.success("Car created");
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
      toast.error(detail || "Failed to create car");
    },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="eyebrow">Cars · New</div>
        <h2 className="display-heading text-2xl font-semibold text-white">
          Add a vehicle
        </h2>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
        <CarForm
          initial={emptyCarFormValues}
          submitLabel="Create car"
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
