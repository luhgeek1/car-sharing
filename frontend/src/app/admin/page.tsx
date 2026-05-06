"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Car, Inbox, Plus } from "lucide-react";

import { listCars } from "@/shared/api/cars";
import { listAdminContactRequests } from "@/shared/api/contactRequests";

export default function AdminHomePage() {
  const carsQuery = useQuery({
    queryKey: ["admin", "cars"],
    queryFn: () => listCars({ limit: 1 }),
  });
  const requestsQuery = useQuery({
    queryKey: ["admin", "contact-requests", "overview"],
    queryFn: () => listAdminContactRequests({ limit: 5 }),
  });

  const carCount = carsQuery.data?.total ?? 0;
  const requests = requestsQuery.data?.items ?? [];
  const requestsTotal = requestsQuery.data?.total ?? 0;

  return (
    <div className="space-y-12">
      <div className="border border-white/10 bg-[#050505] p-10">
        <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/40 mb-3">
          Welcome
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-light uppercase tracking-[0.1em] text-white">
          Manage the Righteous Rides operation.
        </h2>
        <p className="mt-4 max-w-2xl text-sm text-white/55 font-light tracking-wide leading-relaxed">
          Curate the fleet, review incoming quote requests, and keep the
          customer-facing site in sync. Changes appear on the public site
          immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Link
          href="/admin/cars"
          className="group border border-white/10 bg-[#050505] p-8 hover:border-white/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex h-10 w-10 items-center justify-center border border-white/15 text-white/75">
              <Car className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-white/40 group-hover:translate-x-1 group-hover:text-white transition-all" />
          </div>
          <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/40 mb-2">
            Fleet
          </div>
          <div className="text-3xl font-display font-light tracking-[0.05em] text-white mb-1">
            {carsQuery.isLoading ? "—" : carCount}
            <span className="ml-2 text-sm text-white/40 align-middle">
              vehicles
            </span>
          </div>
          <p className="text-sm text-white/55 font-light tracking-wide leading-relaxed">
            Add, edit, or remove vehicles. Upload photos directly from the
            device.
          </p>
        </Link>

        <Link
          href="/admin/requests"
          className="group border border-white/10 bg-[#050505] p-8 hover:border-white/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex h-10 w-10 items-center justify-center border border-white/15 text-white/75">
              <Inbox className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-white/40 group-hover:translate-x-1 group-hover:text-white transition-all" />
          </div>
          <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/40 mb-2">
            Quote requests
          </div>
          <div className="text-3xl font-display font-light tracking-[0.05em] text-white mb-1">
            {requestsQuery.isLoading ? "—" : requestsTotal}
            <span className="ml-2 text-sm text-white/40 align-middle">
              total
            </span>
          </div>
          <p className="text-sm text-white/55 font-light tracking-wide leading-relaxed">
            Review every contact form submission, search by customer or
            vehicle.
          </p>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/40">
            Latest requests
          </h3>
          <Link
            href="/admin/requests"
            className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/55 hover:text-white transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="border border-white/10 bg-[#050505]">
          {requestsQuery.isLoading ? (
            <div className="p-8 text-sm text-white/55">Loading…</div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-sm text-white/55">No requests yet.</div>
          ) : (
            <ul className="divide-y divide-white/5">
              {requests.map((req) => (
                <li
                  key={req.id}
                  className="flex flex-wrap items-center gap-x-6 gap-y-1 px-6 py-4 text-sm"
                >
                  <span className="text-white">{req.full_name}</span>
                  <span className="text-white/45">{req.email}</span>
                  <span className="ml-auto text-[10px] uppercase tracking-[0.2em] text-white/55">
                    {req.service_label}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-white/10 pt-8">
        <Link
          href="/admin/cars/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-white/90 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add a car
        </Link>
        <Link
          href="/admin/requests"
          className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
        >
          <Inbox className="h-3.5 w-3.5" />
          Open inbox
        </Link>
      </div>
    </div>
  );
}
