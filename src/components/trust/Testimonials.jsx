import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

export default function Testimonials({ compact = false }) {
  const testimonials = [
    {
      name: "Mark Thompson",
      location: "Brisbane, QLD",
      company: "Thompson Fleet Services",
      rating: 5,
      text: "Been dealing with Aurex for 3 years now. Their knowledge of heavy truck parts is unmatched. Always get the right part first time, every time.",
      verified: true
    },
    {
      name: "Sarah Chen",
      location: "Melbourne, VIC",
      company: "Chen Logistics",
      rating: 5,
      text: "The online catalogue makes ordering so easy. VIN fitment checking saves us hours of research. Freight is always on time, even to regional WA.",
      verified: true
    },
    {
      name: "James Wilson",
      location: "Sydney, NSW",
      company: "Wilson Heavy Haulage",
      rating: 5,
      text: "Competitive pricing and genuine parts. The team really knows their stuff when it comes to Kenworth and Mack components. Highly recommend.",
      verified: true
    },
    {
      name: "Emma Roberts",
      location: "Perth, WA",
      company: "Roberts Transport",
      rating: 4,
      text: "Great range of trailer parts. The brake kits we ordered were perfect fit and arrived faster than expected. Will definitely order again.",
      verified: true
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [autoPlay, testimonials.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    setAutoPlay(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setAutoPlay(false);
  };

  const currentTestimonial = testimonials[currentIndex];

  if (compact) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.slice(0, 2).map((testimonial, index) => (
          <div key={index} className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-4">
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={star <= testimonial.rating ? "fill-[#FFBB00] text-[#FFBB00]" : "fill-[#E5E7EB] text-[#E5E7EB]"}
                />
              ))}
            </div>
            <p className="text-sm text-[#6B7280] line-clamp-3">{testimonial.text}</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E53E00] flex items-center justify-center text-white font-bold text-xs">
                {testimonial.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1A1A2E]">{testimonial.name}</p>
                <p className="text-[10px] text-[#9CA3AF]">{testimonial.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-2xl p-6 md:p-8"
        >
          <div className="flex items-start gap-4 mb-4">
            <Quote size={32} className="text-[#E53E00] shrink-0" />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  className={star <= currentTestimonial.rating ? "fill-[#FFBB00] text-[#FFBB00]" : "fill-[#E5E7EB] text-[#E5E7EB]"}
                />
              ))}
            </div>
          </div>

          <p className="text-[15px] md:text-[17px] text-[#1A1A2E] leading-relaxed mb-6">
            "{currentTestimonial.text}"
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#E53E00] flex items-center justify-center text-white font-bold text-lg">
                {currentTestimonial.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-[#1A1A2E]">{currentTestimonial.name}</p>
                <p className="text-sm text-[#6B7280]">
                  {currentTestimonial.company} · {currentTestimonial.location}
                </p>
              </div>
            </div>

            {currentTestimonial.verified && (
              <div className="flex items-center gap-1.5 bg-[#10B981]/10 text-[#10B981] px-3 py-1.5 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                Verified Customer
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setAutoPlay(false);
            }}
            className={`w-2 h-2 rounded-full transition ${
              index === currentIndex ? "bg-[#E53E00] w-6" : "bg-[#E5E7EB]"
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>

      {/* Arrow navigation */}
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePrevious}
          className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center hover:border-[#E53E00] transition"
          aria-label="Previous testimonial"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleNext}
          className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center hover:border-[#E53E00] transition"
          aria-label="Next testimonial"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}