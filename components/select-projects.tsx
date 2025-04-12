"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const carouselItems = [
  {
    title: "Andon Analysis",
    description: "Tracking departmental responses and improvement initiatives",
    enabled: true,
    image: "/andon.svg",
    link: "/andon/dashboard",
  },
  {
    title: "Idle Analysis",
    description: "Analyze and optimize production buffer",
    enabled: true,
    image: "/idle.svg",
    link: "/idle/dashboard",
  },
  {
    title: "Task Control System",
    description: "Project and task management system for teams",
    enabled: true,
    image: "/jira.svg",
    link: "/jira",
  },
  {
    title: "BOM Analysis",
    description: "Bill of Materials management and tracking system",
    enabled: false,
    image: "/bom.svg",
    link: "/bom/dashboard",
  },
];

export default function SelectProjects() {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      carousel.classList.add("active");
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
    };

    const onMouseLeave = () => {
      isDown = false;
      carousel.classList.remove("active");
    };

    const onMouseUp = () => {
      isDown = false;
      carousel.classList.remove("active");
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 2;
      carousel.scrollLeft = scrollLeft - walk;
    };

    carousel.addEventListener("mousedown", onMouseDown);
    carousel.addEventListener("mouseleave", onMouseLeave);
    carousel.addEventListener("mouseup", onMouseUp);
    carousel.addEventListener("mousemove", onMouseMove);

    return () => {
      carousel.removeEventListener("mousedown", onMouseDown);
      carousel.removeEventListener("mouseleave", onMouseLeave);
      carousel.removeEventListener("mouseup", onMouseUp);
      carousel.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <Carousel className="w-full max-w-[95vw] mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <CarouselPrevious className="relative inset-0 translate-x-0 translate-y-0 h-8 w-8 sm:h-6 sm:w-6">
            <ChevronLeft className="h-2 w-2 sm:h-5 sm:w-2" />
          </CarouselPrevious>
          <CarouselNext className="relative inset-0 translate-x-0 translate-y-0 h-8 w-8 sm:h-6 sm:w-6">
            <ChevronRight className="h-2 w-2 sm:h-5 sm:w-2" />
          </CarouselNext>
        </div>
      </div>
      <CarouselContent
        ref={carouselRef}
        className="cursor-grab active:cursor-grabbing mt-5"
      >
        {carouselItems.map((item, index) => (
          <CarouselItem
            key={index}
            className="sm:basis-1/2 lg:basis-1/3 pl-4 min-w-[280px]"
          >
            <Card
              className={`${
                item.enabled
                  ? "bg-[#262626] opacity-90 border-0"
                  : "bg-[#191817] opacity-50 border-0"
              } overflow-hidden rounded-lg shadow-md ${
                !item.enabled && "cursor-not-allowed"
              }`}
            >
              <CardContent className="aspect-[6/7] flex flex-col justify-between p-4 sm:p-6">
                <div
                  className={`text-sm sm:text-base font-medium self-start ${item.enabled ? "text-primary-foreground" : "text-muted-foreground"}`}
                >
                  {item.title}
                </div>
                <div className="relative w-full h-full flex-1 my-2">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-contain rounded-md"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div
                    className={`text-xs sm:text-sm font-semibold self-start ${item.enabled ? "text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    {item.description}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant={item.enabled ? "default" : "secondary"}
                      size="sm"
                      className={`
                        ${item.enabled ? "bg-primary-foreground/20 hover:bg-primary-foreground/30" : ""}
                        text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4
                      `}
                      disabled={!item.enabled}
                      onClick={() => (window.location.href = item.link)}
                    >
                      Enter
                      <ArrowRight
                        className="opacity-60 transition-transform group-hover:translate-x-0.5"
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
