"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
  description: string;
}

const PLACEHOLDER_PARTNERS = [
  { id: 'p1', name: "NSDA Bangladesh", logo_url: "", website_url: "https://nsda.gov.bd", description: "" },
  { id: 'p2', name: "ICT Division", logo_url: "", website_url: "https://ictd.gov.bd", description: "" },
  { id: 'p3', name: "a2i Programme", logo_url: "", website_url: "https://a2i.gov.bd", description: "" },
  { id: 'p4', name: "BASIS", logo_url: "", website_url: "https://basis.org.bd", description: "" },
  { id: 'p5', name: "BCC", logo_url: "", website_url: "https://bcc.gov.bd", description: "" },
  { id: 'p6', name: "SEIP", logo_url: "", website_url: "https://seip-fd.gov.bd", description: "" },
];

function PartnerLogo({ partner }: { partner: Partner }) {
  const isLink = partner.website_url && partner.website_url !== '#' && partner.website_url.trim() !== '';

  const logoNode = (
    <div className="relative group px-6 md:px-10 flex items-center justify-center shrink-0 cursor-pointer">
      {/* Tooltip on Hover */}
      <div className="absolute -top-9 opacity-0 group-hover:opacity-100 group-hover:-top-10 transition-all duration-300 pointer-events-none bg-[#0c0e1f] border border-blue-500/30 text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-xl whitespace-nowrap z-30">
        {partner.name}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0c0e1f] border-r border-b border-blue-500/30 rotate-45" />
      </div>

      {/* Pure Logo Image without background, wrap box, or grayscale filter */}
      <div className="relative h-12 md:h-16 w-28 md:w-36 flex items-center justify-center bg-transparent">
        {partner.logo_url ? (
          <img
            src={partner.logo_url}
            alt={partner.name}
            className="max-w-full max-h-full object-contain opacity-100 group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <span className="text-gray-300 hover:text-white font-black text-xs md:text-sm uppercase tracking-wider text-center truncate">
            {partner.name}
          </span>
        )}
      </div>
    </div>
  );

  return isLink ? (
    <a 
      href={partner.website_url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="inline-block"
      title={`Visit ${partner.name}`}
    >
      {logoNode}
    </a>
  ) : (
    logoNode
  );
}

export default function PartnerSection() {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    fetch('/api/partners')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setPartners(data.data);
        } else {
          setPartners(PLACEHOLDER_PARTNERS);
        }
      })
      .catch(() => setPartners(PLACEHOLDER_PARTNERS));
  }, []);

  const displayPartners = partners.length > 0 ? partners : PLACEHOLDER_PARTNERS;

  return (
    <section className="relative w-full overflow-hidden py-5 lg:py-6">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-[#05060f] dark:bg-[#05060f] z-0" />

      <div className="w-full px-4 md:px-8 relative z-10 mb-3 text-center">
        <h3 className="text-xs md:text-sm font-bold text-gray-400 dark:text-gray-400 uppercase tracking-[0.25em]" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
          আমাদের বিশ্বস্ত অংশীদারসমূহ (Trusted Partners & Collaborators)
        </h3>
      </div>

      {/* Marquee Carousel without background box */}
      <div className="w-full py-2 relative overflow-hidden z-10">
        <div
          className="overflow-hidden w-full flex items-center"
          style={{
            maskImage: "linear-gradient(to right, transparent, white 8%, white 92%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, white 8%, white 92%, transparent)"
          }}
        >
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, ease: "linear", repeat: Infinity, repeatType: "loop" }}
            className="flex items-center w-max"
          >
            {[...displayPartners, ...displayPartners].map((partner, i) => (
              <PartnerLogo key={`${partner.id}-${i}`} partner={partner} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
