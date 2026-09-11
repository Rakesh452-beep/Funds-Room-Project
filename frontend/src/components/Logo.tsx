interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-7 h-7 rounded-lg text-[13px]',
  md: 'w-9 h-9 rounded-xl text-base',
  lg: 'w-11 h-11 rounded-xl text-lg',
};

export const Logo = ({ size = 'md', className = '' }: LogoProps) => (
  <span className={`inline-flex items-center justify-center bg-black font-semibold tracking-tight ring-1 ring-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.25)] select-none ${sizeMap[size]} ${className}`}>
    <span className="text-lime-400">F</span>
    <span className="text-pink-400">R</span>
  </span>
);