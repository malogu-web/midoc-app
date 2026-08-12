"use client";

import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import { WaitlistModal } from "@/components/WaitlistModal";

export default function Page() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <LandingPage onStartTrial={() => setOpen(true)} />
      <WaitlistModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

