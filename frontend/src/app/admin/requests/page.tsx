"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, Search } from "lucide-react";

import { listAdminContactRequests } from "@/shared/api/contactRequests";
import type { ContactRequest } from "@/shared/api/contactRequests";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

export default function AdminRequestsPage() {
  const [search, setSearch] = useState("");
  const [submitted, setSubmitted] = useState("");

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin", "contact-requests", submitted],
    queryFn: () =>
      listAdminContactRequests({
        search: submitted || undefined,
        limit: 100,
      }),
  });

  const items: ContactRequest[] = data?.items ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/40">
            Quote requests
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-light uppercase tracking-[0.1em] text-white">
            Customer leads {data ? <span className="text-white/40">· {data.total}</span> : null}
          </h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(search.trim());
          }}
          className="flex items-center gap-2"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone…"
              className="border-white/15 bg-black text-white pl-9 w-64"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            Search
          </Button>
        </form>
      </div>

      <div className="overflow-hidden border border-white/10 bg-[#050505]">
        {isLoading ? (
          <div className="p-12 text-center text-white/50 font-light tracking-wide text-sm">
            Loading requests…
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-300 font-light tracking-wide text-sm">
            Failed to load requests.
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-white/50 font-light tracking-wide text-sm">
            {submitted ? "No matching requests." : "No requests yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-white/10 bg-black/40 text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
                <tr>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Preferred</th>
                  <th className="px-6 py-4">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-light text-white/85">
                {items.map((req) => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 align-top text-xs text-white/55 tracking-wide whitespace-nowrap">
                      {formatDate(req.created_at)}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm text-white">{req.full_name}</div>
                      <div className="mt-1 flex flex-col gap-1 text-[11px] text-white/55">
                        <a
                          href={`mailto:${req.email}`}
                          className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                        >
                          <Mail className="h-3 w-3" />
                          {req.email}
                        </a>
                        <a
                          href={`tel:${req.phone}`}
                          className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                        >
                          <Phone className="h-3 w-3" />
                          {req.phone}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className="inline-block border border-white/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/75">
                        {req.service_label}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top text-white/85 text-sm">
                      {req.vehicle_type}
                    </td>
                    <td className="px-6 py-4 align-top text-white/75 text-xs whitespace-nowrap">
                      {req.preferred_date}
                    </td>
                    <td className="px-6 py-4 align-top max-w-md">
                      <p className="text-xs text-white/65 leading-relaxed line-clamp-3">
                        {req.message || (
                          <span className="text-white/30">—</span>
                        )}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-white/40">
        <span>{items.length} of {data?.total ?? 0} shown</span>
        <button
          type="button"
          onClick={() => refetch()}
          className="hover:text-white transition-colors"
          disabled={isFetching}
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>
    </div>
  );
}
