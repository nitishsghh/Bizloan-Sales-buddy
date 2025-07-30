import bizloanLogo from "@assets/Bizloan-new-logo-1_1753807695156.webp";

interface LogoProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function Logo({ size = "medium", className = "" }: LogoProps) {
  const sizeClasses = {
    small: "w-16 h-8",
    medium: "w-24 h-12", 
    large: "w-32 h-16"
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <img 
        src={bizloanLogo} 
        alt="Logo" 
        className={`${sizeClasses[size]} object-contain`}
      />
    </div>
  );
}