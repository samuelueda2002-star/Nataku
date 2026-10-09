import { images } from "@/constants/images";
import { Image as ExpoImage } from "expo-image";
import { styled } from "nativewind";

const Image = styled(ExpoImage, { className: "style" });

type NatakuMascotProps = {
  className: string;
  portrait?: boolean;
  accessibilityLabel?: string;
};

export function NatakuMascot({ className, portrait = false, accessibilityLabel = "Nataku" }: NatakuMascotProps) {
  return (
    <Image
      className={className}
      source={portrait ? images.natakuIcon : images.natakuMascot}
      contentFit={portrait ? "cover" : "contain"}
      allowDownscaling
      cachePolicy="memory-disk"
      accessibilityLabel={accessibilityLabel}
    />
  );
}
