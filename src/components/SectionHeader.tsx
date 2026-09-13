import Link from "next/link";
import { IconArrow } from "@/components/icons";

export default function SectionHeader({
  eyebrow,
  title,
  lead,
  link,
  as: Tag = "h2",
  invert = false,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  link?: { href: string; label: string };
  as?: "h1" | "h2";
  invert?: boolean;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className={`eyebrow mb-3 ${invert ? "!text-white/50" : ""}`}>{eyebrow}</p>}
        <Tag className={`text-2xl font-semibold sm:text-[2.1rem] ${invert ? "text-white" : ""}`}>{title}</Tag>
        {lead && <p className={`mt-3 text-[17px] ${invert ? "text-white/70" : "text-ink-soft"}`}>{lead}</p>}
      </div>
      {link && (
        <Link href={link.href} className={`group inline-flex shrink-0 items-center gap-2 font-medium ${invert ? "text-white" : "text-cobalt"}`}>
          {link.label}
          <IconArrow width={18} height={18} className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
