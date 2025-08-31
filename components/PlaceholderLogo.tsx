import Image from 'next/image';

interface PlaceholderLogoProps {
  className?: string;
}

export default function PlaceholderLogo({ className = "" }: PlaceholderLogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo.png"  // Change this to your actual filename
        alt="Galway Research"
        width={120}      // Adjust width as needed
        height={40}      // Adjust height as needed
        className="h-auto"
        priority
      />
    </div>
  );
}