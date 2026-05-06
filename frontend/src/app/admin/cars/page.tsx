"use client";

import Link from "next/link";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { Car } from "@/entities/car/model";
import { deleteCar, listCars } from "@/shared/api/cars";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

const formatPrice = (price: string | number) => {
  const num = typeof price === "string" ? Number(price) : price;
  if (Number.isNaN(num)) return String(price);
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};

export default function AdminCarsPage() {
  const queryClient = useQueryClient();

  const carsQuery = useQuery({
    queryKey: ["admin", "cars"],
    queryFn: () => listCars({ limit: 100 }),
  });

  const removeMutation = useMutation({
    mutationFn: deleteCar,
    onSuccess: () => {
      toast.success("Car removed");
      queryClient.invalidateQueries({ queryKey: ["admin", "cars"] });
      queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
    onError: () => toast.error("Failed to delete car"),
  });

  const cars: Car[] = carsQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="eyebrow mb-2">Fleet · {cars.length} vehicles</div>
          <h2 className="display-heading text-2xl font-semibold text-white">
            Manage cars
          </h2>
        </div>
        <Button
          asChild
          className="bg-white text-black hover:bg-white/90"
        >
          <Link href="/admin/cars/new">
            <Plus className="mr-2 h-4 w-4" />
            Add a car
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
        {carsQuery.isLoading ? (
          <div className="p-8 text-sm text-white/55">Loading…</div>
        ) : carsQuery.isError ? (
          <div className="p-8 text-sm text-red-300">
            Failed to load cars.
          </div>
        ) : cars.length === 0 ? (
          <div className="p-8 text-sm text-white/55">
            No cars yet. Add one to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/60">Name</TableHead>
                <TableHead className="text-white/60">Brand</TableHead>
                <TableHead className="text-white/60">Category</TableHead>
                <TableHead className="text-white/60">Year</TableHead>
                <TableHead className="text-white/60">Price/day</TableHead>
                <TableHead className="text-white/60">Status</TableHead>
                <TableHead className="text-right text-white/60">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cars.map((car) => (
                <TableRow key={car.id} className="border-white/10">
                  <TableCell className="font-medium text-white">
                    {car.name}
                  </TableCell>
                  <TableCell className="text-white/75">{car.brand}</TableCell>
                  <TableCell className="text-white/75 capitalize">
                    {car.category}
                  </TableCell>
                  <TableCell className="text-white/75">{car.year}</TableCell>
                  <TableCell className="text-white/75">
                    {formatPrice(car.price_per_day)}
                  </TableCell>
                  <TableCell>
                    {car.is_available ? (
                      <Badge className="bg-white text-black">Available</Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-white/30 text-white/70"
                      >
                        Hidden
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="border-white/20 bg-transparent text-white hover:bg-white/10"
                      >
                        <Link href={`/admin/cars/${car.id}/edit`}>
                          <Pencil className="mr-1 h-3.5 w-3.5" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 bg-transparent text-red-300 hover:bg-red-500/10"
                        disabled={removeMutation.isPending}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete "${car.name}"? This cannot be undone.`,
                            )
                          ) {
                            removeMutation.mutate(car.id);
                          }
                        }}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
