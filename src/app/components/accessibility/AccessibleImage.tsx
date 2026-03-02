"use client";

import React from "react";
import Image, { ImageProps } from "next/image";
import { getImageAlt } from "../../utils/accessibility";

interface AccessibleImageProps extends Omit<ImageProps, "alt"> {
  alt: string;
  decorative?: boolean;
  context?: string;
}

/**
 * Componente de imagem acessível
 * Garante que todas as imagens tenham texto alternativo apropriado
 */
export const AccessibleImage: React.FC<AccessibleImageProps> = ({
  alt,
  decorative = false,
  context,
  ...props
}) => {
  // Se a imagem for decorativa, usa alt vazio e aria-hidden
  if (decorative) {
    return (
      <Image
        {...props}
        alt=""
        aria-hidden="true"
        role="presentation"
      />
    );
  }

  // Gera alt text apropriado se não fornecido
  const altText = alt || getImageAlt(props.src.toString(), context);

  return <Image {...props} alt={altText} />;
};

