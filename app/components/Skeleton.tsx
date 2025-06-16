interface SkeletonProps {
  size?: "small" | "medium" | "large" | "full";
  width?: "full" | "half" | "quarter" | "text";
}

export const Skeleton = ({ size = "small", width = "half" }: SkeletonProps) => {
  return <div className={`skeleton ${size} w${width}`}></div>;
};
