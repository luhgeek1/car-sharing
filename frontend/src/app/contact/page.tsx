"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";

import { createContactRequest } from "@/shared/api/contactRequests";
import { getCar } from "@/shared/api/cars";
import { listServices } from "@/shared/api/services";
import { getSiteContent } from "@/shared/api/site";
import { splitTitleLines } from "@/shared/lib/siteContent";

const formSchema = z.object({
  fullName: z.string().min(2, "Full Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.email("Valid email is required"),
  serviceNeeded: z.string().min(1, "Please select a service"),
  vehicleType: z.string().min(2, "Vehicle Type/Model is required"),
  preferredDate: z.string().min(1, "Preferred date is required"),
  message: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ContactPageContent />
    </Suspense>
  );
}

function ContactPageContent() {
  const searchParams = useSearchParams();
  const carId = searchParams.get("car");
  const serviceParam = searchParams.get("service");

  const siteContentQuery = useQuery({
    queryKey: ["site-content"],
    queryFn: getSiteContent,
  });
  const servicesQuery = useQuery({
    queryKey: ["services"],
    queryFn: listServices,
  });
  const carQuery = useQuery({
    queryKey: ["cars", carId],
    queryFn: () => getCar(carId as string),
    enabled: Boolean(carId),
  });

  const contactPage = siteContentQuery.data?.contact_page;
  const titleLines = contactPage?.title ? splitTitleLines(contactPage.title) : [];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, dirtyFields },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      serviceNeeded: serviceParam ?? "",
      vehicleType: "",
      preferredDate: "",
      message: "",
    },
  });

  const prefillAppliedRef = useRef<string | null>(null);

  useEffect(() => {
    const car = carQuery.data;
    if (!car) return;
    if (prefillAppliedRef.current === car.id) return;
    prefillAppliedRef.current = car.id;

    if (!dirtyFields.vehicleType) {
      setValue("vehicleType", car.name, { shouldDirty: false });
    }
  }, [carQuery.data, dirtyFields.vehicleType, setValue]);

  const contactMutation = useMutation({
    mutationFn: createContactRequest,
    onSuccess: () => {
      reset();
      prefillAppliedRef.current = null;
    },
  });

  const onSubmit = async (data: FormData) => {
    const selectedService = (servicesQuery.data ?? []).find(
      (service) => service.slug === data.serviceNeeded,
    );

    await contactMutation.mutateAsync({
      full_name: data.fullName,
      phone: data.phone,
      email: data.email,
      service_slug: selectedService?.slug ?? null,
      service_label: selectedService?.title ?? data.serviceNeeded,
      vehicle_type: data.vehicleType,
      preferred_date: data.preferredDate,
      message: data.message ?? "",
    });
  };

  const selectedCar = carQuery.data;

  return (
    <div className="w-full pt-32 lg:pt-40 pb-20 lg:pb-32">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-32">
          <div className="w-full lg:w-1/3">
            {contactPage?.badge ? (
              <div className="text-white/40 text-[10px] sm:text-xs font-medium uppercase tracking-[0.3em] mb-4 lg:mb-6">
                {contactPage.badge}
              </div>
            ) : null}
            {titleLines[0] ? (
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-5xl font-display font-light uppercase tracking-[0.05em] mb-4 lg:mb-6 leading-tight"
              >
                {titleLines[0]}
                {titleLines[1] ? (
                  <>
                    <br className="hidden lg:block" />
                    <span className="font-medium text-white/50">{titleLines[1]}</span>
                  </>
                ) : null}
              </motion.h1>
            ) : null}
            {contactPage?.subtitle ? (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-white/50 font-light tracking-wide text-sm sm:text-base mb-12 lg:mb-16 leading-relaxed"
              >
                {contactPage.subtitle}
              </motion.p>
            ) : null}

            <div className="space-y-12">
              {(contactPage?.location || contactPage?.service_area) ? (
                <div>
                  <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 mb-3 border-b border-white/5 pb-3">
                    Location
                  </h4>
                  <p className="font-light text-white/80 text-sm tracking-wide mt-3 leading-relaxed">
                    {contactPage?.location}
                    {contactPage?.service_area ? (
                      <>
                        <br />
                        <span className="text-white/40">
                          {contactPage.service_area}
                        </span>
                      </>
                    ) : null}
                  </p>
                </div>
              ) : null}
              {(contactPage?.phone || contactPage?.email) ? (
                <div>
                  <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 mb-3 border-b border-white/5 pb-3">
                    Contact
                  </h4>
                  <p className="font-light text-white/80 text-sm tracking-wide mt-3 leading-relaxed">
                    {contactPage?.phone}
                    {contactPage?.email ? (
                      <>
                        <br />
                        <span className="text-white/40">
                          {contactPage.email}
                        </span>
                      </>
                    ) : null}
                  </p>
                </div>
              ) : null}
              {(contactPage?.social_links ?? []).length > 0 ? (
                <div>
                  <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 mb-3 border-b border-white/5 pb-3">
                    Social
                  </h4>
                  {(contactPage?.social_links ?? []).map((link) => (
                    <a
                      key={`${link.label}:${link.href}`}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="font-light text-white/80 text-sm tracking-wide hover:text-white transition-colors mt-3 block"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="w-full lg:w-2/3 bg-[#050505] border border-white/10 p-8 md:p-16 relative">
            {contactMutation.isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 relative z-10">
                <div className="w-16 h-16 border border-white flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                {contactPage?.success_title ? (
                  <h3 className="text-2xl font-display font-light uppercase tracking-[0.1em] text-white">
                    {contactPage.success_title}
                  </h3>
                ) : null}
                {contactPage?.success_message ? (
                  <p className="text-white/50 font-light tracking-wide text-sm max-w-sm">
                    {contactPage.success_message}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => contactMutation.reset()}
                  className="mt-10 px-8 py-4 bg-transparent border border-white/30 text-white text-xs font-medium uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
                >
                  New Request
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-8 relative z-10"
              >
                {selectedCar ? (
                  <div className="flex items-center gap-3 border border-white/15 bg-white/[0.02] px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-white/75">
                    <span className="text-white/40">Selected:</span>
                    <span className="text-white">{selectedCar.name}</span>
                    <span className="ml-auto text-white/35 normal-case tracking-normal">
                      Year {selectedCar.year} · ${typeof selectedCar.price_per_day === "string" ? selectedCar.price_per_day : selectedCar.price_per_day}/day
                    </span>
                  </div>
                ) : null}

                {contactMutation.isError ? (
                  <div className="border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    Unable to submit the request right now. Please try again shortly.
                  </div>
                ) : null}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 ml-2">
                      Full Name
                    </label>
                    <input
                      {...register("fullName")}
                      className="w-full bg-transparent border-b border-white/20 px-2 py-3 text-white text-sm font-light tracking-wide focus:outline-none focus:border-white transition-all placeholder:text-white/20"
                      placeholder="John Doe"
                    />
                    {errors.fullName && (
                      <p className="text-red-400 text-[10px] uppercase tracking-wider mt-1 ml-2 font-light">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 ml-2">
                      Phone Number
                    </label>
                    <input
                      {...register("phone")}
                      className="w-full bg-transparent border-b border-white/20 px-2 py-3 text-white text-sm font-light tracking-wide focus:outline-none focus:border-white transition-all placeholder:text-white/20"
                      placeholder="(555) 000-0000"
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-[10px] uppercase tracking-wider mt-1 ml-2 font-light">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 ml-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      className="w-full bg-transparent border-b border-white/20 px-2 py-3 text-white text-sm font-light tracking-wide focus:outline-none focus:border-white transition-all placeholder:text-white/20"
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-[10px] uppercase tracking-wider mt-1 ml-2 font-light">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 ml-2">
                      Service Needed
                    </label>
                    <div className="border-b border-white/20 focus-within:border-white transition-all pb-1">
                      <select
                        {...register("serviceNeeded")}
                        className="w-full bg-transparent px-2 py-2 text-white text-sm font-light tracking-wide focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="" className="text-black">
                          Select a Service
                        </option>
                        {(servicesQuery.data ?? []).map((service) => (
                          <option key={service.slug} value={service.slug} className="text-black">
                            {service.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.serviceNeeded && (
                      <p className="text-red-400 text-[10px] uppercase tracking-wider mt-1 ml-2 font-light">
                        {errors.serviceNeeded.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 ml-2">
                      Vehicle Type / Model
                    </label>
                    <input
                      {...register("vehicleType")}
                      className="w-full bg-transparent border-b border-white/20 px-2 py-3 text-white text-sm font-light tracking-wide focus:outline-none focus:border-white transition-all placeholder:text-white/20"
                      placeholder="e.g. Porsche 911"
                    />
                    {errors.vehicleType && (
                      <p className="text-red-400 text-[10px] uppercase tracking-wider mt-1 ml-2 font-light">
                        {errors.vehicleType.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 ml-2">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      {...register("preferredDate")}
                      className="w-full bg-transparent border-b border-white/20 px-2 py-3 text-white text-sm font-light tracking-wide focus:outline-none focus:border-white transition-all [color-scheme:dark]"
                    />
                    {errors.preferredDate && (
                      <p className="text-red-400 text-[10px] uppercase tracking-wider mt-1 ml-2 font-light">
                        {errors.preferredDate.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 ml-2">
                    Message / Details
                  </label>
                  <textarea
                    {...register("message")}
                    rows={4}
                    className="w-full bg-transparent border border-white/20 p-4 text-white text-sm font-light tracking-wide focus:outline-none focus:border-white transition-all resize-none placeholder:text-white/20"
                    placeholder="Tell us about what you're looking for..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactMutation.isPending}
                  className="w-full py-4 bg-white text-black text-xs font-medium uppercase tracking-[0.2em] hover:bg-white/90 disabled:opacity-50 transition-colors mt-8"
                >
                  {contactMutation.isPending ? "Sending..." : "Submit Request"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
