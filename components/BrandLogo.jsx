import Image from "next/image";

export default function BrandLogo({
  className = "h-10 w-auto",
  nameClassName = "text-lg font-bold text-emerald-950",
  subtitle,
  subtitleClassName = "text-xs text-slate-500",
  wrapperClassName = "inline-flex items-center gap-3",
}) {
  return (
    <span className={wrapperClassName}>
      <Image
        src="/icons/krishisetu_logo.png"
        alt=""
        width={220}
        height={80}
        className={`shrink-0 object-contain ${className}`}
      />
      <span className="flex flex-col">
        <span className={nameClassName}>KrishiSetu</span>
        {subtitle && <span className={subtitleClassName}>{subtitle}</span>}
      </span>
    </span>
  );
}